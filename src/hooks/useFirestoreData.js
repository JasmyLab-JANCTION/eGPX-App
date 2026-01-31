import { useState, useEffect, useRef, useMemo } from "react";

// TODO: Uncomment this import and point to your Firebase config
import { db } from "../config/firebase";
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  collectionGroup,
} from "firebase/firestore";

export const useVideoRenderingTasks = (userId) => {
  const [tasks, setTasks] = useState([]);
  const [workersByTaskId, setWorkersByTaskId] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // taskId -> unsubscribe
  const workersUnsubsRef = useRef(new Map());

  useEffect(() => {
    const cleanupAllWorkers = () => {
      for (const unsub of workersUnsubsRef.current.values()) {
        try {
          unsub();
        } catch {}
      }
      workersUnsubsRef.current.clear();
      setWorkersByTaskId({});
    };

    if (!userId) {
      cleanupAllWorkers();
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const q = query(
      collection(db, "videoRenderingTasks"),
      where("creator", "==", userId),
      // orderBy("createdAt", "desc"), // optional but recommended if you have it
    );

    const unsubscribeTasks = onSnapshot(
      q,
      (snapshot) => {
        const nextTasks = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        const currentTaskIds = new Set(nextTasks.map((t) => t.id));

        // remove worker listeners + workers state for tasks that disappeared
        for (const [taskId, unsub] of workersUnsubsRef.current.entries()) {
          if (!currentTaskIds.has(taskId)) {
            try {
              unsub();
            } catch {}
            workersUnsubsRef.current.delete(taskId);

            setWorkersByTaskId((prev) => {
              const copy = { ...prev };
              delete copy[taskId];
              return copy;
            });
          }
        }

        // ensure a workers listener for each task
        for (const t of nextTasks) {
          if (workersUnsubsRef.current.has(t.id)) continue;

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
              console.error("workers snapshot error", t.id, err);
            },
          );

          workersUnsubsRef.current.set(t.id, unsubWorkers);
        }

        setTasks(nextTasks);
        setLoading(false);
      },
      (err) => {
        cleanupAllWorkers();
        setError(err.message || String(err));
        setLoading(false);
      },
    );

    return () => {
      try {
        unsubscribeTasks();
      } catch {}
      cleanupAllWorkers();
    };
  }, [userId]);

  // derive final array with workers injected
  const videoRenderingTasks = useMemo(() => {
    return tasks.map((t) => ({
      ...t,
      workers: workersByTaskId[t.id] ?? [],
    }));
  }, [tasks, workersByTaskId]);

  return { videoRenderingTasks, loading, error };
};
