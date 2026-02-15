import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  IconButton,
} from "@mui/material";
import {
  useAppKit,
  useAppKitAccount,
  useAppKitProvider,
} from "@reown/appkit/react";
import { BrowserProvider, Contract } from "ethers";
import { Wallet, X } from "lucide-react";
import { COLORS } from "../theme/theme";
import SimpleBackdrop from "./SimpleBackdrop";
import WorkerRegistryABI from "../contracts/WorkerRegistry.json";

const WORKER_REGISTRY_ADDRESS = import.meta.env
  .VITE_BLOCKCHAIN_WORKER_REGISTRY_ADDRESS;

interface RegisterWorkerDialogProps {
  open: boolean;
  onClose: () => void;
  onRegister: (address: string) => Promise<void>;
  existingAddresses: string[];
}

export default function RegisterWorkerDialog({
  open,
  onClose,
  onRegister,
  existingAddresses,
}: RegisterWorkerDialogProps) {
  const { open: openWallet } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isDuplicate = address
    ? existingAddresses.includes(address.toLowerCase())
    : false;

  useEffect(() => {
    if (!open) {
      setError(null);
      setStatusMessage("");
    }
  }, [open]);

  const handleRegister = async () => {
    if (!address || !isConnected || !walletProvider) return;
    if (isDuplicate) return;

    setSubmitting(true);
    setError(null);
    try {
      await onRegister(address.toLowerCase());
      const ethersProvider = new BrowserProvider(walletProvider as any);
      const signer = await ethersProvider.getSigner();
      const workerRegistry = new Contract(
        WORKER_REGISTRY_ADDRESS,
        WorkerRegistryABI.abi,
        signer,
      );

      setStatusMessage("Sign worker registration in your wallet...");
      const registerTx = await workerRegistry.registerWorker();
      setStatusMessage("Waiting for registration confirmation...");
      await registerTx.wait();

      setStatusMessage("Saving worker data...");
      onClose();
    } catch (err: any) {
      setError(err.reason || err.message || "Failed to register worker");
    } finally {
      setSubmitting(false);
      setStatusMessage("");
    }
  };

  const canRegister = isConnected && address && !isDuplicate;

  return (
    <>
      <SimpleBackdrop open={submitting} message={statusMessage} />
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 1,
          }}
        >
          <Typography
            sx={{
              fontFamily: '"Playfair Display", serif',
              fontSize: "1.5rem",
              fontWeight: 700,
              color: COLORS.navy,
            }}
          >
            Register New Worker
          </Typography>
          <IconButton onClick={onClose} size="small">
            <X size={20} />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {/* Wallet Connection */}
          <Box sx={{ mb: 3 }}>
            <Typography
              sx={{
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: COLORS.slate,
                mb: 1.5,
              }}
            >
              Wallet Connection
            </Typography>

            {isConnected && address ? (
              <Alert
                severity={isDuplicate ? "warning" : "success"}
                sx={{ "& .MuiAlert-message": { width: "100%" } }}
              >
                <Box>
                  <Typography
                    sx={{ fontSize: "0.875rem", fontWeight: 600, mb: 0.5 }}
                  >
                    {isDuplicate
                      ? "Worker Already Registered"
                      : "Wallet Connected"}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "monospace",
                      fontSize: "0.8125rem",
                      wordBreak: "break-all",
                    }}
                  >
                    {address}
                  </Typography>
                  {isDuplicate && (
                    <Typography sx={{ fontSize: "0.75rem", mt: 0.5 }}>
                      This address is already registered. Connect a different
                      wallet to add a new worker.
                    </Typography>
                  )}
                </Box>
              </Alert>
            ) : (
              <Button
                fullWidth
                startIcon={<Wallet size={20} />}
                onClick={() => openWallet()}
                sx={{
                  bgcolor: COLORS.navy,
                  color: COLORS.white,
                  py: 1.5,
                  textTransform: "none",
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                  "&:hover": { bgcolor: "#0a1628" },
                }}
              >
                Connect Wallet
              </Button>
            )}
          </Box>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={onClose}
            sx={{ color: COLORS.slate, textTransform: "none", fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRegister}
            disabled={!canRegister || submitting}
            sx={{
              bgcolor: COLORS.navy,
              color: COLORS.white,
              px: 4,
              textTransform: "none",
              fontWeight: 600,
              "&:hover": { bgcolor: "#0a1628" },
              "&:disabled": { bgcolor: "#E5E7EB", color: "#9CA3AF" },
            }}
          >
            {submitting ? "Registering..." : "Register Worker"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
