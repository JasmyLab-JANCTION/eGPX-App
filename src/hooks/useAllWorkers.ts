import { useState, useEffect } from "react";
import { db } from "../config/firebase";

export type WorkerRuntimeStatus =
  | "running_idle"
  | "running_executing"
  | "not_running";

export interface AllWorker {
  id: string;
  address: string;
  lastPing: any;
  status: string | null;
  runtimeStatus: WorkerRuntimeStatus;
}

const PING_TIMEOUT_MS = 120_000; // 120 seconds

function computeRuntimeStatus(
  lastPing: any,
  status: string | undefined,
): WorkerRuntimeStatus {
  if (!lastPing) return "not_running";

  let pingMs: number;
  if (typeof lastPing === "number") {
    pingMs = lastPing < 1e12 ? lastPing * 1000 : lastPing;
  } else if (lastPing.toMillis) {
    pingMs = lastPing.toMillis();
  } else if (lastPing.seconds) {
    pingMs = lastPing.seconds * 1000;
  } else {
    return "not_running";
  }

  const elapsed = Date.now() - pingMs;
  if (elapsed > PING_TIMEOUT_MS) return "not_running";

  if (status === "executing task") return "running_executing";
  return "running_idle";
}

export const useAllWorkers = () => {
  const [workers, setWorkers] = useState<AllWorker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = db
      .collectionGroup("registeredWorkers")
      .onSnapshot(
        (snapshot: any) => {
          const docs: AllWorker[] = snapshot.docs.map((doc: any) => {
            const data = doc.data();
            return {
              id: doc.id,
              address: data.address ?? doc.id,
              lastPing: data.lastPing ?? null,
              status: data.status ?? null,
              runtimeStatus: computeRuntimeStatus(data.lastPing, data.status),
            };
          });
          setWorkers(docs);
          setLoading(false);
        },
        (err: any) => {
          console.error("useAllWorkers snapshot error", err);
          setError(err.message || String(err));
          setLoading(false);
        },
      );

    return () => {
      try {
        unsubscribe();
      } catch {}
    };
  }, []);

  // Re-compute runtime status every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setWorkers((prev) =>
        prev.map((w) => ({
          ...w,
          runtimeStatus: computeRuntimeStatus(w.lastPing, w.status ?? undefined),
        })),
      );
    }, 30_000);

    return () => clearInterval(interval);
  }, []);

  const runningWorkers = workers.filter(
    (w) => w.runtimeStatus === "running_idle" || w.runtimeStatus === "running_executing",
  );

  const idleWorkers = workers.filter((w) => w.runtimeStatus === "running_idle");
  const executingWorkers = workers.filter((w) => w.runtimeStatus === "running_executing");
  const offlineWorkers = workers.filter((w) => w.runtimeStatus === "not_running");

  return {
    allWorkers: workers,
    runningWorkers,
    idleWorkers,
    executingWorkers,
    offlineWorkers,
    runningCount: runningWorkers.length,
    totalCount: workers.length,
    loading,
    error,
  };
};
