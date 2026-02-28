import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { CreditCard, Lock } from "lucide-react";
import { COLORS } from "../theme/theme";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "",
);

type CreditCardPaymentProps = {
  open: boolean;
  onClose: () => void;
  onPaymentMethodSaved: (paymentMethodId: string) => void;
};

const cardElementStyle = {
  style: {
    base: {
      fontSize: "16px",
      color: COLORS.textPrimary,
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      "::placeholder": {
        color: COLORS.gray400,
      },
    },
    invalid: {
      color: COLORS.red,
    },
  },
};

const fieldContainerSx = {
  border: `1px solid ${COLORS.border}`,
  borderRadius: "4px",
  p: "12px 14px",
  transition: "border-color 0.2s",
  "&:hover": {
    borderColor: COLORS.slate,
  },
  "&:focus-within": {
    borderColor: COLORS.blue,
    boxShadow: `0 0 0 1px ${COLORS.blue}`,
  },
};

function CheckoutForm({
  onClose,
  onPaymentMethodSaved,
}: {
  onClose: () => void;
  onPaymentMethodSaved: (paymentMethodId: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async () => {
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardNumberElement);
    if (!cardElement) {
      setError("Card element not found");
      setProcessing(false);
      return;
    }

    const { error: stripeError, paymentMethod } =
      await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });

    if (stripeError) {
      setError(stripeError.message || "An error occurred");
      setProcessing(false);
      return;
    }

    onPaymentMethodSaved(paymentMethod.id);
    setProcessing(false);
    setSucceeded(true);
  };

  if (succeeded) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            bgcolor: COLORS.greenBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 2,
          }}
        >
          <CreditCard size={32} color={COLORS.green} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          Payment Method Saved
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
          Your credit card has been verified. The payment will be processed when
          you submit the task.
        </Typography>
        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            bgcolor: COLORS.blue,
            "&:hover": { bgcolor: COLORS.blueDark },
          }}
        >
          Continue
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, mb: 1, color: "text.primary" }}
        >
          Card Number
        </Typography>
        <Box sx={fieldContainerSx}>
          <CardNumberElement options={cardElementStyle} />
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, mb: 1, color: "text.primary" }}
          >
            Expiration
          </Typography>
          <Box sx={fieldContainerSx}>
            <CardExpiryElement options={cardElementStyle} />
          </Box>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, mb: 1, color: "text.primary" }}
          >
            CVC
          </Typography>
          <Box sx={fieldContainerSx}>
            <CardCvcElement options={cardElementStyle} />
          </Box>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 3,
          color: "text.secondary",
        }}
      >
        <Lock size={14} />
        <Typography variant="body2">
          Secured by Stripe. Your card details are encrypted.
        </Typography>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Button onClick={onClose} disabled={processing}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!stripe || processing}
          sx={{
            bgcolor: COLORS.blue,
            "&:hover": { bgcolor: COLORS.blueDark },
            minWidth: 140,
          }}
        >
          {processing ? (
            <CircularProgress size={22} sx={{ color: "white" }} />
          ) : (
            "Save Card"
          )}
        </Button>
      </Box>
    </Box>
  );
}

export const CreditCardPayment = ({
  open,
  onClose,
  onPaymentMethodSaved,
}: CreditCardPaymentProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <CreditCard size={24} color={COLORS.blue} />
          <Typography
            sx={{
              fontFamily: '"Playfair Display", serif',
              fontSize: "1.25rem",
              fontWeight: 700,
            }}
          >
            Credit Card Payment
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Your payment will be processed securely via Stripe. Enter your
            card details below to save your payment method.
          </Alert>
          <Elements stripe={stripePromise}>
            <CheckoutForm
              onClose={onClose}
              onPaymentMethodSaved={onPaymentMethodSaved}
            />
          </Elements>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
