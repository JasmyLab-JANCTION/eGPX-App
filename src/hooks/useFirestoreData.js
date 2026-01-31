import { useState, useEffect, useRef } from "react";

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

/**
 * useVideoRenderingTasks(userId)
 * - Subscribes to tasks created by user
 * - For each task, subscribes to its workers subcollection
 * - Returns tasks with `workers` array (live updates)
 */
export const useVideoRenderingTasks = (userId) => {
  const [videoRenderingTasks, setVideoRenderingTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // taskId -> unsubscribe function for its workers listener
  const workersUnsubsRef = useRef(new Map());

  useEffect(() => {
    // cleanup all workers listeners on unmount / user change
    const cleanupAllWorkers = () => {
      for (const unsub of workersUnsubsRef.current.values()) {
        try {
          unsub();
        } catch {}
      }
      workersUnsubsRef.current.clear();
    };

    if (!userId) {
      cleanupAllWorkers();
      setVideoRenderingTasks([]);
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
        const tasks = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          workers: [], // will be filled by sub-listener
        }));

        const currentTaskIds = new Set(tasks.map((t) => t.id));

        // 1) Unsubscribe workers listeners for tasks that disappeared
        for (const [taskId, unsub] of workersUnsubsRef.current.entries()) {
          if (!currentTaskIds.has(taskId)) {
            try {
              unsub();
            } catch {}
            workersUnsubsRef.current.delete(taskId);
          }
        }

        // 2) Ensure there is a workers listener for each task
        tasks.forEach((task) => {
          if (workersUnsubsRef.current.has(task.id)) return;

          const workersCol = collection(
            db,
            "videoRenderingTasks",
            task.id,
            "workers",
          );

          const unsubWorkers = onSnapshot(
            workersCol,
            (workersSnap) => {
              const workers = workersSnap.docs.map((w) => ({
                id: w.id, // address
                ...w.data(),
              }));

              // merge workers into that single task
              setVideoRenderingTasks((prev) =>
                prev.map((t) => (t.id === task.id ? { ...t, workers } : t)),
              );
            },
            (err) => {
              // workers listener error should not kill tasks
              console.error("workers snapshot error", task.id, err);
            },
          );

          workersUnsubsRef.current.set(task.id, unsubWorkers);
        });

        // 3) Set tasks list (workers will populate async)
        setVideoRenderingTasks((prev) => {
          // Preserve any already-fetched workers arrays when possible
          const prevById = new Map(prev.map((t) => [t.id, t]));
          return tasks.map((t) => ({
            ...t,
            workers: prevById.get(t.id)?.workers ?? t.workers,
          }));
        });

        setLoading(false);
      },
      (err) => {
        cleanupAllWorkers();
        setError(err.message);
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

  return { videoRenderingTasks, loading, error };
};
