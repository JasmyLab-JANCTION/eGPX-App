import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  MenuItem,
  Select,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import { Wallet, Plus, Server, Copy, Check } from "lucide-react";
import { COLORS } from "../theme/theme";
import { useWorkers } from "../hooks/useWorkers";
import RegisterWorkerDialog from "./RegisterWorkerDialog";
import { useDisconnect } from "@reown/appkit/react";

interface WorkerConfigurationTabProps {
  userId: string;
}

const truncateAddress = (addr: string) =>
  `${addr.slice(0, 6)}...${addr.slice(-4)}`;

const softwareVersions: Record<string, string> = {
  blender: "blender-4.3-cycles",
  "v-ray": "vray-6.2",
  lumion: "lumion-12.5",
  unreal: "unreal-5.3",
};

const generateDockerImageName = (os: string, software: string) =>
  `${os}-${softwareVersions[software] || software}:latest`;

const statusConfig: Record<
  string,
  { color: string; emoji: string; label: string }
> = {
  active: { color: COLORS.green, emoji: "✅", label: "Active" },
  registered: {
    color: COLORS.gold,
    emoji: "⏳",
    label: "Registered - Waiting for Task",
  },
  idle: { color: COLORS.gold, emoji: "⏳", label: "Idle" },
  offline: { color: COLORS.slate, emoji: "❌", label: "Offline" },
};

export default function WorkerConfigurationTab({
  userId,
}: WorkerConfigurationTabProps) {
  const { workers, loading, error, addWorker, updateWorker } =
    useWorkers(userId);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const { disconnect } = useDisconnect();
  // Form state for selected worker
  const [editOS, setEditOS] = useState("linux");
  const [editSoftware, setEditSoftware] = useState("blender");
  const [editMinReward, setEditMinReward] = useState("50");
  const [editStake, setEditStake] = useState("0");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const selectedWorker = workers.find(
    (w: any) => w.address === selectedAddress,
  );

  // Auto-select first worker if none selected
  useEffect(() => {
    if (!selectedAddress && workers.length > 0) {
      setSelectedAddress(workers[0].address);
    }
  }, [workers, selectedAddress]);

  // Sync form when selected worker changes
  useEffect(() => {
    if (selectedWorker) {
      setEditOS(selectedWorker.os || "linux");
      setEditSoftware(selectedWorker.renderingSoftware || "blender");
      setEditMinReward(String(selectedWorker.minReward ?? "50"));
      setEditStake(String(selectedWorker.stake ?? "0"));
    }
  }, [selectedAddress, selectedWorker?.address]);

  const handleSaveConfig = async () => {
    if (!selectedAddress) return;
    setSaving(true);
    try {
      await updateWorker(selectedAddress, {
        os: editOS,
        renderingSoftware: editSoftware,
        minReward: parseFloat(editMinReward) || 0,
        stake: parseFloat(editStake) || 0,
      });
      setSnackbar({
        open: true,
        message: "Configuration saved",
        severity: "success",
      });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || "Failed to save",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRegister = async (address: string) => {
    await addWorker(address);
    setSelectedAddress(address);
  };

  const handleAddWorker = () => {
    disconnect();
    setRegisterDialogOpen(true);
  };

  const dockerImage = generateDockerImageName(editOS, editSoftware);

  const dockerCommand = `docker run -it --rm \\
  --name janction-worker-${selectedAddress ? selectedAddress.slice(2, 8).toLowerCase() : "node"} \\
  -e AUTH_API_URL="YourHttpRPCProvider" \\
  -e WS_RPC_URL="YourWsRPCProvider" \\
  -e PRIVATE_KEY="YourPrivateKey" \\
  -e VIDEO_RENDER_TASKS_ADDRESS="${import.meta.env.VITE_BLOCKCHAIN_VIDEO_RENDERING_TASKS_CONTRACT_ADDRESS}" \\
  -e MODULE_MANAGER_ADDRESS="${import.meta.env.VITE_BLOCKCHAIN_MODULE_MANAGER_ADDRESS}}" \\
  -e WORKER_REGISTRY_ADDRESS="${import.meta.env.VITE_BLOCKCHAIN_WORKER_REGISTRY_ADDRESS}" \\
  -e CONFIG_ID="0x3100000000000000000000000000000000000000000000000000000000000000" \\
  -v $(pwd)/worker-data:/data \\
  ${dockerImage}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(dockerCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const status =
    statusConfig[selectedWorker?.status] || statusConfig.registered;

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          py: 10,
        }}
      >
        <CircularProgress sx={{ color: COLORS.navy }} />
      </Box>
    );
  }

  return (
    <Box>
      <Typography
        sx={{
          fontFamily: '"Playfair Display", serif',
          fontSize: "2rem",
          fontWeight: 700,
          color: COLORS.navy,
          mb: 1,
        }}
      >
        Configuration
      </Typography>
      <Typography sx={{ fontSize: "0.9375rem", color: COLORS.slate, mb: 4 }}>
        Register and configure your worker nodes
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Register Worker Section */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderLeft: `4px solid ${COLORS.gold}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: "1rem",
              fontWeight: 600,
              color: COLORS.navy,
              mb: 0.5,
            }}
          >
            Register New Worker
          </Typography>
          <Typography sx={{ fontSize: "0.875rem", color: COLORS.slate }}>
            Connect a wallet to register a new worker node on the network
          </Typography>
        </Box>
        <Button
          startIcon={<Plus size={18} />}
          onClick={handleAddWorker}
          sx={{
            bgcolor: COLORS.navy,
            color: COLORS.white,
            px: 3,
            py: 1.25,
            textTransform: "none",
            fontSize: "0.875rem",
            fontWeight: 600,
            whiteSpace: "nowrap",
            "&:hover": { bgcolor: "#0a1628" },
          }}
        >
          Add Worker
        </Button>
      </Paper>

      {/* Worker Selector */}
      {workers.length > 0 && (
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
            Your Workers ({workers.length})
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {workers.map((worker: any) => {
              const isSelected = worker.address === selectedAddress;
              const workerStatus =
                statusConfig[worker.status] || statusConfig.registered;
              return (
                <Chip
                  key={worker.address}
                  icon={<Wallet size={14} />}
                  label={truncateAddress(worker.address)}
                  variant={isSelected ? "filled" : "outlined"}
                  onClick={() => setSelectedAddress(worker.address)}
                  sx={{
                    fontFamily: "monospace",
                    fontWeight: 600,
                    fontSize: "0.8125rem",
                    py: 2.5,
                    px: 0.5,
                    ...(isSelected
                      ? {
                          bgcolor: COLORS.navy,
                          color: COLORS.white,
                          "& .MuiChip-icon": { color: COLORS.white },
                          "&:hover": { bgcolor: "#0a1628" },
                        }
                      : {
                          borderColor: COLORS.border,
                          color: COLORS.navy,
                          "& .MuiChip-icon": { color: COLORS.slate },
                          "&:hover": { borderColor: COLORS.navy },
                        }),
                    "&::after": {
                      content: '""',
                      display: "inline-block",
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: workerStatus.color,
                      ml: 1,
                    },
                  }}
                />
              );
            })}
          </Box>
        </Box>
      )}

      {/* Selected Worker Configuration */}
      {selectedWorker ? (
        <Grid container spacing={3}>
          {/* Configuration Form */}
          <Grid item xs={12}>
            <Paper sx={{ p: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography
                  sx={{
                    fontSize: "1.125rem",
                    fontWeight: 600,
                    color: COLORS.navy,
                  }}
                >
                  Worker Configuration
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "monospace",
                    fontSize: "0.8125rem",
                    color: COLORS.slate,
                  }}
                >
                  {selectedWorker.address}
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                  <Typography
                    sx={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: COLORS.slate,
                      mb: 1,
                    }}
                  >
                    Operating System
                  </Typography>
                  <Select
                    fullWidth
                    value={editOS}
                    onChange={(e) => setEditOS(e.target.value)}
                    size="small"
                  >
                    <MenuItem value="linux">Linux</MenuItem>
                    <MenuItem value="mac">Mac</MenuItem>
                    <MenuItem value="windows">Windows</MenuItem>
                  </Select>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Typography
                    sx={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: COLORS.slate,
                      mb: 1,
                    }}
                  >
                    Rendering Software
                  </Typography>
                  <Select
                    fullWidth
                    value={editSoftware}
                    onChange={(e) => setEditSoftware(e.target.value)}
                    size="small"
                  >
                    <MenuItem value="blender">Blender</MenuItem>
                    <MenuItem value="v-ray">V-Ray</MenuItem>
                    <MenuItem value="lumion">Lumion</MenuItem>
                    <MenuItem value="unreal">Unreal</MenuItem>
                  </Select>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Typography
                    sx={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: COLORS.slate,
                      mb: 1,
                    }}
                  >
                    Minimum Reward (USD)
                  </Typography>
                  <TextField
                    fullWidth
                    value={editMinReward}
                    onChange={(e) => setEditMinReward(e.target.value)}
                    size="small"
                    type="number"
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <Typography
                    sx={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: COLORS.slate,
                      mb: 1,
                    }}
                  >
                    Stake (JCT)
                  </Typography>
                  <TextField
                    fullWidth
                    value={editStake}
                    onChange={(e) => setEditStake(e.target.value)}
                    size="small"
                    type="number"
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ mb: 3 }}>
                <Typography
                  sx={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: COLORS.navy,
                    mb: 2,
                  }}
                >
                  Docker Image
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "#F8F9FA",
                    borderRadius: 1,
                    border: "1px solid #E5E7EB",
                  }}
                >
                  <Typography
                    sx={{ fontFamily: "monospace", fontSize: "0.875rem" }}
                  >
                    {dockerImage}
                  </Typography>
                </Box>
              </Box>

              <Button
                fullWidth
                onClick={handleSaveConfig}
                disabled={saving}
                sx={{
                  bgcolor: COLORS.navy,
                  color: COLORS.white,
                  py: 1.5,
                  textTransform: "none",
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                  "&:hover": { bgcolor: "#0a1628" },
                  "&:disabled": { bgcolor: "#E5E7EB", color: "#9CA3AF" },
                }}
              >
                {saving ? "Saving..." : "Save Configuration"}
              </Button>
            </Paper>
          </Grid>

          {/* Container Instructions */}
          <Grid item xs={12}>
            <Paper sx={{ p: 4, bgcolor: "#F8F9FA" }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography
                  sx={{
                    fontSize: "1.125rem",
                    fontWeight: 600,
                    color: COLORS.navy,
                  }}
                >
                  Container Instructions
                </Typography>
                <Button
                  startIcon={copied ? <Check size={16} /> : <Copy size={16} />}
                  onClick={handleCopy}
                  size="small"
                  sx={{
                    color: copied ? COLORS.green : COLORS.slate,
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.8125rem",
                  }}
                >
                  {copied ? "Copied" : "Copy"}
                </Button>
              </Box>

              <Typography
                sx={{ fontSize: "0.875rem", color: COLORS.slate, mb: 2 }}
              >
                Run the following command to start your worker node:
              </Typography>

              <Box
                sx={{
                  p: 3,
                  bgcolor: "#1e293b",
                  borderRadius: 1,
                  overflow: "auto",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "monospace",
                    fontSize: "0.75rem",
                    color: "#e2e8f0",
                    whiteSpace: "pre",
                  }}
                >
                  {dockerCommand}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Worker Status */}
          <Grid item xs={12}>
            <Paper sx={{ p: 4 }}>
              <Typography
                sx={{
                  fontSize: "1.125rem",
                  fontWeight: 600,
                  color: COLORS.navy,
                  mb: 3,
                }}
              >
                Worker Status
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  p: 3,
                  bgcolor: `${status.color}15`,
                  borderRadius: 1,
                  border: `2px solid ${status.color}`,
                }}
              >
                <Typography sx={{ fontSize: "2rem" }}>
                  {status.emoji}
                </Typography>
                <Box>
                  <Typography
                    sx={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: COLORS.slate,
                      mb: 0.5,
                    }}
                  >
                    Current Status
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "1.125rem",
                      fontWeight: 700,
                      color: status.color,
                    }}
                  >
                    {status.label}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      ) : workers.length === 0 ? (
        /* Empty State */
        <Paper
          sx={{
            p: 6,
            textAlign: "center",
            border: `2px dashed ${COLORS.border}`,
            bgcolor: "#FAFBFC",
          }}
        >
          <Server
            size={48}
            color={COLORS.slate}
            style={{ marginBottom: 16, opacity: 0.5 }}
          />
          <Typography
            sx={{
              fontSize: "1.25rem",
              fontWeight: 600,
              color: COLORS.navy,
              mb: 1,
            }}
          >
            No Workers Registered
          </Typography>
          <Typography
            sx={{
              fontSize: "0.9375rem",
              color: COLORS.slate,
              mb: 3,
              maxWidth: 400,
              mx: "auto",
            }}
          >
            Register your first worker to start rendering tasks and earning
            rewards on the Janction network.
          </Typography>
          <Button
            startIcon={<Wallet size={18} />}
            onClick={() => setRegisterDialogOpen(true)}
            sx={{
              bgcolor: COLORS.navy,
              color: COLORS.white,
              px: 4,
              py: 1.25,
              textTransform: "none",
              fontSize: "0.9375rem",
              fontWeight: 600,
              "&:hover": { bgcolor: "#0a1628" },
            }}
          >
            Register Your First Worker
          </Button>
        </Paper>
      ) : null}

      {/* Register Dialog */}
      <RegisterWorkerDialog
        open={registerDialogOpen}
        onClose={() => setRegisterDialogOpen(false)}
        onRegister={handleRegister}
        existingAddresses={workers.map((w: any) => w.address.toLowerCase())}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
