import { useState, useEffect, useRef, useMemo } from "react";
import { db } from "../config/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";

/**
 * Subscribes to:
 * - videoRenderingTasks where creator == userId
 * - for each task:
 *   - /workers
 *   - /threads
 *   - for each thread: /threads/{threadId}/workers
 *
 * Returns tasks shaped as:
 * {
 *   id,
 *   ...taskData,
 *   workers: [...],
 *   threads: [
 *     { id, ...threadData, workers: [...] },
 *   ]
 * }
 */
export const useVideoRenderingTasks = (userId) => {
  const [tasks, setTasks] = useState([]);

  const [workersByTaskId, setWorkersByTaskId] = useState({}); // { [taskId]: Worker[] }
  const [threadsByTaskId, setThreadsByTaskId] = useState({}); // { [taskId]: Thread[] }
  const [threadWorkersByKey, setThreadWorkersByKey] = useState({}); // { ["taskId::threadId"]: Worker[] }

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Unsub maps
  const taskWorkersUnsubsRef = useRef(new Map()); // taskId -> unsub
  const taskThreadsUnsubsRef = useRef(new Map()); // taskId -> unsub
  const threadWorkersUnsubsRef = useRef(new Map()); // "taskId::threadId" -> unsub

  useEffect(() => {
    const cleanupAll = () => {
      // task-level workers
      for (const unsub of taskWorkersUnsubsRef.current.values()) {
        try {
          unsub();
        } catch {}
      }
      taskWorkersUnsubsRef.current.clear();

      // task-level threads
      for (const unsub of taskThreadsUnsubsRef.current.values()) {
        try {
          unsub();
        } catch {}
      }
      taskThreadsUnsubsRef.current.clear();

      // thread-level workers
      for (const unsub of threadWorkersUnsubsRef.current.values()) {
        try {
          unsub();
        } catch {}
      }
      threadWorkersUnsubsRef.current.clear();

      setWorkersByTaskId({});
      setThreadsByTaskId({});
      setThreadWorkersByKey({});
    };

    if (!userId) {
      cleanupAll();
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const q = query(
      collection(db, "videoRenderingTasks"),
      where("creator", "==", userId),
    );

    const unsubscribeTasks = onSnapshot(
      q,
      (snapshot) => {
        const nextTasks = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        const currentTaskIds = new Set(nextTasks.map((t) => t.id));

        // --- Remove listeners for tasks that disappeared ---
        for (const [taskId, unsub] of taskWorkersUnsubsRef.current.entries()) {
          if (!currentTaskIds.has(taskId)) {
            try {
              unsub();
            } catch {}
            taskWorkersUnsubsRef.current.delete(taskId);

            setWorkersByTaskId((prev) => {
              const copy = { ...prev };
              delete copy[taskId];
              return copy;
            });
          }
        }

        for (const [taskId, unsub] of taskThreadsUnsubsRef.current.entries()) {
          if (!currentTaskIds.has(taskId)) {
            try {
              unsub();
            } catch {}
            taskThreadsUnsubsRef.current.delete(taskId);

            // also remove all thread-worker listeners for this task
            for (const key of threadWorkersUnsubsRef.current.keys()) {
              if (key.startsWith(taskId + "::")) {
                const twUnsub = threadWorkersUnsubsRef.current.get(key);
                try {
                  twUnsub && twUnsub();
                } catch {}
                threadWorkersUnsubsRef.current.delete(key);

                setThreadWorkersByKey((prev) => {
                  const copy = { ...prev };
                  delete copy[key];
                  return copy;
                });
              }
            }

            setThreadsByTaskId((prev) => {
              const copy = { ...prev };
              delete copy[taskId];
              return copy;
            });
          }
        }

        // --- Ensure listeners for each task ---
        for (const t of nextTasks) {
          // 1) task workers listener
          if (!taskWorkersUnsubsRef.current.has(t.id)) {
            const workersCol = collection(
              db,
              "videoRenderingTasks",
              t.id,
              "workers",
            );

            const unsubWorkers = onSnapshot(
              workersCol,
              (workersSnap) => {
                const workers = workersSnap.docs.map((w) => ({
                  id: w.id,
                  ...w.data(),
                }));

                setWorkersByTaskId((prev) => ({
                  ...prev,
                  [t.id]: workers,
                }));
              },
              (err) => {
                console.error("task workers snapshot error", t.id, err);
              },
            );

            taskWorkersUnsubsRef.current.set(t.id, unsubWorkers);
          }

          // 2) task threads listener
          if (!taskThreadsUnsubsRef.current.has(t.id)) {
            const threadsCol = collection(
              db,
              "videoRenderingTasks",
              t.id,
              "threads",
            );

            const unsubThreads = onSnapshot(
              threadsCol,
              (threadsSnap) => {
                const threads = threadsSnap.docs.map((th) => ({
                  id: th.id,
                  ...th.data(),
                }));

                // Update threadsByTaskId
                setThreadsByTaskId((prev) => ({
                  ...prev,
                  [t.id]: threads,
                }));

                // Maintain per-thread worker listeners for this task
                const currentThreadIds = new Set(
                  threads.map((th) => String(th.id)),
                );

                // remove thread worker listeners for threads that disappeared
                for (const [
                  key,
                  twUnsub,
                ] of threadWorkersUnsubsRef.current.entries()) {
                  const [taskId, threadId] = key.split("::");
                  if (taskId !== t.id) continue;

                  if (!currentThreadIds.has(threadId)) {
                    try {
                      twUnsub();
                    } catch {}
                    threadWorkersUnsubsRef.current.delete(key);

                    setThreadWorkersByKey((prev2) => {
                      const copy2 = { ...prev2 };
                      delete copy2[key];
                      return copy2;
                    });
                  }
                }

                // ensure a worker listener for each thread
                for (const th of threads) {
                  const threadId = String(th.id);
                  const key = `${t.id}::${threadId}`;
                  if (threadWorkersUnsubsRef.current.has(key)) continue;

                  const threadWorkersCol = collection(
                    db,
                    "videoRenderingTasks",
                    t.id,
                    "threads",
                    threadId,
                    "workers",
                  );

                  const unsubThreadWorkers = onSnapshot(
                    threadWorkersCol,
                    (twSnap) => {
                      const tw = twSnap.docs.map((w) => ({
                        id: w.id,
                        ...w.data(),
                      }));

                      setThreadWorkersByKey((prev2) => ({
                        ...prev2,
                        [key]: tw,
                      }));
                    },
                    (err) => {
                      console.error("thread workers snapshot error", key, err);
                    },
                  );

                  threadWorkersUnsubsRef.current.set(key, unsubThreadWorkers);
                }
              },
              (err) => {
                console.error("threads snapshot error", t.id, err);
              },
            );

            taskThreadsUnsubsRef.current.set(t.id, unsubThreads);
          }
        }

        setTasks(nextTasks);
        setLoading(false);
      },
      (err) => {
        cleanupAll();
        setError(err.message || String(err));
        setLoading(false);
      },
    );

    return () => {
      try {
        unsubscribeTasks();
      } catch {}
      cleanupAll();
    };
  }, [userId]);

  // Final derived tasks with injected workers + threads + thread workers
  const videoRenderingTasks = useMemo(() => {
    return tasks.map((t) => {
      const taskWorkers = workersByTaskId[t.id] ?? [];

      const taskThreads = (threadsByTaskId[t.id] ?? []).map((th) => {
        const key = `${t.id}::${String(th.id)}`;
        const threadWorkers = threadWorkersByKey[key] ?? [];
        return {
          ...th,
          workers: threadWorkers,
        };
      });

      return {
        ...t,
        workers: taskWorkers,
        threads: taskThreads,
      };
    });
  }, [tasks, workersByTaskId, threadsByTaskId, threadWorkersByKey]);

  return { videoRenderingTasks, loading, error };
};
