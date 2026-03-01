import { useState, useEffect, useCallback } from "react";
import { db } from "../config/firebase";

export type PaymentStatus =
  | "succeeded"
  | "processing"
  | "failed"
  | "requires_action"
  | "requires_capture"
  | "requires_payment_method"
  | null;

interface UsePaymentStatusReturn {
  status: PaymentStatus;
  loading: boolean;
  error: string | null;
  reset: () => void;
}

export const usePaymentStatus = (
  uid: string | null,
  paymentIntentId: string | null,
): UsePaymentStatusReturn => {
  const [status, setStatus] = useState<PaymentStatus>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStatus(null);
    setLoading(false);
    setError(null);
  }, []);

  useEffect(() => {
    if (!uid || !paymentIntentId) {
      setStatus(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = db
      .collection("users")
      .doc(uid)
      .collection("payments")
      .doc(paymentIntentId)
      .onSnapshot(
        (snapshot: any) => {
          if (!snapshot.exists) {
            return;
          }
          const data = snapshot.data();
          setStatus(data.status ?? null);
          setLoading(false);
        },
        (err: any) => {
          console.error("usePaymentStatus snapshot error", err);
          setError(err.message || String(err));
          setLoading(false);
        },
      );

    return () => {
      unsubscribe();
    };
  }, [uid, paymentIntentId]);

  return { status, loading, error, reset };
};
