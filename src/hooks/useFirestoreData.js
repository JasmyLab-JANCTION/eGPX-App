import { useState, useEffect } from "react";

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

// ============================================================================
// HOOK: useVideoRenderingTasks - Fetch video rendering tasks
// ============================================================================
/**
 * Fetches all published vaults from all borrowers
 * For the vault marketplace view
 *
 * @param {Object} options - { status: 'published' | 'all', limit: number }
 * @returns {Object} { vaults, loading, error }
 */
export const useVideoRenderingTasks = (userId) => {
  const [videoRenderingTasks, setVideoRenderingTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    const q = query(collection(db, "users", userId, "videoRenderingTasks"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setVideoRenderingTasks(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );

    setLoading(false);

    return unsubscribe;
    // Return empty - components will fall back to mockData.js
  }, [userId]);

  return { videoRenderingTasks, loading, error };
};
