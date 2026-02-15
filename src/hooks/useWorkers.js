import { useState, useEffect } from "react";
import { db } from "../config/firebase";

export const useWorkers = (userId) => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      .collection("workers")
      .onSnapshot(
        (snapshot) => {
          const docs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setWorkers(docs);
          setLoading(false);
        },
        (err) => {
          console.error("workers snapshot error", err);
          setError(err.message || String(err));
          setLoading(false);
        }
      );

    return () => {
      try {
        unsubscribe();
      } catch {}
    };
  }, [userId]);

  const addWorker = async (address) => {
    if (!userId) throw new Error("No userId");
    await db
      .collection("users")
      .doc(userId)
      .collection("workers")
      .doc(address)
      .set({
        address,
        status: "registered",
        registeredAt: new Date(),
        updatedAt: new Date(),
      });
  };

  const updateWorker = async (address, partialData) => {
    if (!userId) throw new Error("No userId");
    await db
      .collection("users")
      .doc(userId)
      .collection("workers")
      .doc(address)
      .set(
        {
          ...partialData,
          updatedAt: new Date(),
        },
        { merge: true }
      );
  };

  const deleteWorker = async (address) => {
    if (!userId) throw new Error("No userId");
    await db
      .collection("users")
      .doc(userId)
      .collection("workers")
      .doc(address)
      .delete();
  };

  return { workers, loading, error, addWorker, updateWorker, deleteWorker };
};
