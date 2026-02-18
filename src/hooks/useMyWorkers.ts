import { useState, useEffect } from "react";
import { db } from "../config/firebase";

export type WorkerRuntimeStatus = "running_idle" | "running_executing" | "not_running";

export interface MyWorker {
  id: string;
  address: string;
  lastPing: number | null;
  status: string | null;
  runtimeStatus: WorkerRuntimeStatus;
}

const PING_TIMEOUT_MS = 120_000; // 120 seconds

function computeRuntimeStatus(
  lastPing: any,
  status: string | undefined,
): WorkerRuntimeStatus {
  if (!lastPing) return "not_running";

  // Handle Firestore Timestamp objects (.seconds/.toMillis) or plain numbers
  let pingMs: number;
  if (typeof lastPing === "number") {
    // If the value is too small to be milliseconds, treat as seconds
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

export const useMyWorkers = (userId: string | undefined) => {
  const [workers, setWorkers] = useState<MyWorker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setWorkers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = db
      .collection("users")
      .doc(userId)
      .collection("registeredWorkers")
      .onSnapshot(
        (snapshot: any) => {
          const docs: MyWorker[] = snapshot.docs.map((doc: any) => {
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
          console.error("useMyWorkers snapshot error", err);
          setError(err.message || String(err));
          setLoading(false);
        },
      );

    return () => {
      try {
        unsubscribe();
      } catch {}
    };
  }, [userId]);

  // Re-compute runtime status every 30 seconds so stale pings flip to "not_running"
  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(() => {
      setWorkers((prev) =>
        prev.map((w) => ({
          ...w,
          runtimeStatus: computeRuntimeStatus(w.lastPing, w.status ?? undefined),
        })),
      );
    }, 30_000);

    return () => clearInterval(interval);
  }, [userId]);

  return { myWorkers: workers, loading, error };
};
