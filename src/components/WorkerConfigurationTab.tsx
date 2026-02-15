import { useState, useEffect, useCallback } from "react";
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
import { useAppKitProvider, useDisconnect } from "@reown/appkit/react";
import {
  BrowserProvider,
  Contract,
  Eip1193Provider,
  formatUnits,
  parseUnits,
} from "ethers";
import WorkerRegistryABI from "../contracts/WorkerRegistry.json";
import StableCoinABI from "../contracts/StableCoin.json";
import SimpleBackdrop from "./SimpleBackdrop";

const WORKER_REGISTRY_ADDRESS = import.meta.env
  .VITE_BLOCKCHAIN_WORKER_REGISTRY_ADDRESS;
const USDC_CONTRACT_ADDRESS = import.meta.env
  .VITE_BLOCKCHAIN_USDC_CONTRACT_ADDRESS;
const CONFIG_ID =
  "0x3100000000000000000000000000000000000000000000000000000000000000";
const MODULE_KEY =
  "0x0735c5123c545fb1079b2c831758b7fd7801678d4bdd0a16d4c8d420a26a8c53";

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
  const { walletProvider } = useAppKitProvider("eip155");

  // Form state for selected worker
  const [editOS, setEditOS] = useState("linux");
  const [editSoftware, setEditSoftware] = useState("blender");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  // On-chain state
  const [onChainMinReward, setOnChainMinReward] = useState<string | null>(null);
  const [onChainStake, setOnChainStake] = useState<string | null>(null);
  const [loadingOnChain, setLoadingOnChain] = useState(false);

  // Edit state for reward & stake
  const [editMinReward, setEditMinReward] = useState("");
  const [editStake, setEditStake] = useState("");
  const [savingReward, setSavingReward] = useState(false);
  const [savingStake, setSavingStake] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

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
    }
  }, [selectedAddress, selectedWorker?.address]);

  // Fetch on-chain min reward and stake for the selected worker
  const fetchOnChainData = useCallback(async () => {
    if (!selectedAddress || !walletProvider) return;
    setLoadingOnChain(true);
    try {
      const ethersProvider = new BrowserProvider(
        walletProvider as Eip1193Provider,
      );
      const workerRegistry = new Contract(
        WORKER_REGISTRY_ADDRESS,
        WorkerRegistryABI.abi,
        ethersProvider,
      );

      const [minReward, stake] = await Promise.all([
        workerRegistry.getMinReward(selectedAddress, MODULE_KEY),
        workerRegistry.stakeOf(selectedAddress),
      ]);

      const rewardFormatted = formatUnits(minReward, 6);
      const stakeFormatted = formatUnits(stake, 6);
      setOnChainMinReward(rewardFormatted);
      setOnChainStake(stakeFormatted);
      setEditMinReward(rewardFormatted);
      setEditStake(stakeFormatted);
    } catch (err) {
      console.error("Failed to fetch on-chain data:", err);
      setOnChainMinReward(null);
      setOnChainStake(null);
    } finally {
      setLoadingOnChain(false);
    }
  }, [selectedAddress, walletProvider]);

  useEffect(() => {
    fetchOnChainData();
  }, [fetchOnChainData]);

  const handleSaveConfig = async () => {
    if (!selectedAddress || !walletProvider) return;
    setSaving(true);
    try {
      const ethersProvider = new BrowserProvider(
        walletProvider as Eip1193Provider,
      );
      const signer = await ethersProvider.getSigner();
      const workerRegistry = new Contract(
        WORKER_REGISTRY_ADDRESS,
        WorkerRegistryABI.abi,
        signer,
      );

      setStatusMessage("Sign configuration submission in your wallet...");
      const configTx = await workerRegistry.addConfiguration(CONFIG_ID);
      setStatusMessage("Waiting for configuration confirmation...");
      await configTx.wait();

      await updateWorker(selectedAddress, {
        os: editOS,
        renderingSoftware: editSoftware,
      });
      setSnackbar({
        open: true,
        message: "Configuration saved",
        severity: "success",
      });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.reason || err.message || "Failed to save",
        severity: "error",
      });
    } finally {
      setSaving(false);
      setStatusMessage("");
    }
  };

  const handleSetMinReward = async () => {
    if (!selectedAddress || !walletProvider) return;
    const amount = parseFloat(editMinReward);
    if (isNaN(amount) || amount <= 0) {
      setSnackbar({
        open: true,
        message: "Enter a valid reward amount",
        severity: "error",
      });
      return;
    }
    setSavingReward(true);
    try {
      const ethersProvider = new BrowserProvider(
        walletProvider as Eip1193Provider,
      );
      const signer = await ethersProvider.getSigner();
      const workerRegistry = new Contract(
        WORKER_REGISTRY_ADDRESS,
        WorkerRegistryABI.abi,
        signer,
      );

      const amountParsed = parseUnits(editMinReward, 6);
      setStatusMessage("Sign minimum reward transaction in your wallet...");
      const tx = await workerRegistry.setMinReward(MODULE_KEY, amountParsed);
      setStatusMessage("Waiting for confirmation...");
      await tx.wait();

      await fetchOnChainData();
      setSnackbar({
        open: true,
        message: "Minimum reward updated",
        severity: "success",
      });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.reason || err.message || "Failed to set reward",
        severity: "error",
      });
    } finally {
      setSavingReward(false);
      setStatusMessage("");
    }
  };

  const handleStake = async () => {
    if (!selectedAddress || !walletProvider) return;
    const amount = parseFloat(editStake);
    if (isNaN(amount) || amount <= 0) {
      setSnackbar({
        open: true,
        message: "Enter a valid stake amount",
        severity: "error",
      });
      return;
    }
    setSavingStake(true);
    try {
      const ethersProvider = new BrowserProvider(
        walletProvider as Eip1193Provider,
      );
      const signer = await ethersProvider.getSigner();
      const workerRegistry = new Contract(
        WORKER_REGISTRY_ADDRESS,
        WorkerRegistryABI.abi,
        signer,
      );
      const usdcContract = new Contract(
        USDC_CONTRACT_ADDRESS,
        StableCoinABI.abi,
        signer,
      );

      const amountParsed = parseUnits(editStake, 6);

      setStatusMessage("Approve USDC transfer in your wallet...");
      const approveTx = await usdcContract.approve(
        WORKER_REGISTRY_ADDRESS,
        amountParsed,
      );
      setStatusMessage("Waiting for approval confirmation...");
      await approveTx.wait();

      setStatusMessage("Sign staking transaction in your wallet...");
      const stakeTx = await workerRegistry.stake(amountParsed);
      setStatusMessage("Waiting for staking confirmation...");
      await stakeTx.wait();

      await fetchOnChainData();
      setSnackbar({
        open: true,
        message: "Stake updated",
        severity: "success",
      });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.reason || err.message || "Failed to stake",
        severity: "error",
      });
    } finally {
      setSavingStake(false);
      setStatusMessage("");
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

  const dockerCommand = `
  # Download the latest worker image
  docker pull rodrigoa77/egpx-videorendering:linux-blender-cycles-4.1-cpu
  
  # Run the worker
  docker run -it --rm \\
  --name janction-worker-${selectedAddress ? selectedAddress.slice(2, 8).toLowerCase() : "node"} \\
  -e AUTH_API_URL="https://egpx-api.onrender.com" \
  -e HTTP_RPC_URL="YourHttpRPCProvider" \\
  -e HTTP_RPC_URL="YourHttpRPCProvider" \\
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

  const isBusy = saving || savingReward || savingStake;

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
      <SimpleBackdrop open={isBusy} message={statusMessage} />

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

              <Typography
                sx={{
                  fontSize: "0.8125rem",
                  color: COLORS.slate,
                  mb: 3,
                  lineHeight: 1.6,
                }}
              >
                Select the OS and rendering software that matches the machine
                where this worker will run. This determines the Docker image
                used and which tasks the worker is eligible for — task creators
                can target specific configurations (e.g. Linux + Blender only).
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
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

                <Grid item xs={12} md={6}>
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

          {/* Minimum Reward */}
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
                  Minimum Reward
                </Typography>
                {loadingOnChain ? (
                  <CircularProgress size={16} sx={{ color: COLORS.slate }} />
                ) : (
                  <Typography
                    sx={{
                      fontSize: "0.875rem",
                      color: COLORS.slate,
                    }}
                  >
                    Current:{" "}
                    <strong>
                      {onChainMinReward !== null
                        ? `${onChainMinReward} USDC`
                        : "—"}
                    </strong>
                  </Typography>
                )}
              </Box>

              <Typography
                sx={{
                  fontSize: "0.8125rem",
                  color: COLORS.slate,
                  mb: 3,
                  lineHeight: 1.6,
                }}
              >
                Set the minimum amount of USDC you are willing to accept per
                task. Your worker will only be assigned tasks whose reward meets
                or exceeds this threshold.
              </Typography>

              <Grid container spacing={3} alignItems="flex-end">
                <Grid item xs={12} md={8}>
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
                    Reward Amount (USDC)
                  </Typography>
                  <TextField
                    fullWidth
                    value={editMinReward}
                    onChange={(e) => setEditMinReward(e.target.value)}
                    size="small"
                    type="number"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Button
                    fullWidth
                    onClick={handleSetMinReward}
                    disabled={savingReward}
                    sx={{
                      bgcolor: COLORS.navy,
                      color: COLORS.white,
                      py: 1,
                      textTransform: "none",
                      fontSize: "0.9375rem",
                      fontWeight: 600,
                      "&:hover": { bgcolor: "#0a1628" },
                      "&:disabled": { bgcolor: "#E5E7EB", color: "#9CA3AF" },
                    }}
                  >
                    {savingReward
                      ? "Updating..."
                      : onChainMinReward && parseFloat(onChainMinReward) > 0
                        ? "Change Reward"
                        : "Set Reward"}
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Stake */}
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
                  Stake
                </Typography>
                {loadingOnChain ? (
                  <CircularProgress size={16} sx={{ color: COLORS.slate }} />
                ) : (
                  <Typography
                    sx={{
                      fontSize: "0.875rem",
                      color: COLORS.slate,
                    }}
                  >
                    Current:{" "}
                    <strong>
                      {onChainStake !== null ? `${onChainStake} USDC` : "—"}
                    </strong>
                  </Typography>
                )}
              </Box>

              <Typography
                sx={{
                  fontSize: "0.8125rem",
                  color: COLORS.slate,
                  mb: 3,
                  lineHeight: 1.6,
                }}
              >
                Stake USDC to make your worker eligible for task assignments. A
                minimum stake of 100 USDC is required. Higher stakes increase
                your worker&apos;s priority when competing for tasks. Staked
                tokens can be slashed if the worker fails to complete assigned
                tasks.
              </Typography>

              <Grid container spacing={3} alignItems="flex-end">
                <Grid item xs={12} md={8}>
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
                    Stake Amount (USDC)
                  </Typography>
                  <TextField
                    fullWidth
                    value={editStake}
                    onChange={(e) => setEditStake(e.target.value)}
                    size="small"
                    type="number"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Button
                    fullWidth
                    onClick={handleStake}
                    disabled={savingStake}
                    sx={{
                      bgcolor: COLORS.navy,
                      color: COLORS.white,
                      py: 1,
                      textTransform: "none",
                      fontSize: "0.9375rem",
                      fontWeight: 600,
                      "&:hover": { bgcolor: "#0a1628" },
                      "&:disabled": { bgcolor: "#E5E7EB", color: "#9CA3AF" },
                    }}
                  >
                    {savingStake
                      ? "Staking..."
                      : onChainStake && parseFloat(onChainStake) > 0
                        ? "Add Stake"
                        : "Stake"}
                  </Button>
                </Grid>
              </Grid>
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
                sx={{
                  fontSize: "0.8125rem",
                  color: COLORS.slate,
                  mb: 2,
                  lineHeight: 1.6,
                }}
              >
                To run the worker you need to download the Docker image and
                specify the following parameters:
              </Typography>

              <Box sx={{ mb: 2, pl: 2 }}>
                <Typography
                  sx={{
                    fontSize: "0.8125rem",
                    color: COLORS.slate,
                    lineHeight: 1.8,
                  }}
                >
                  <strong>HTTP_RPC_URL</strong> — the URL of an HTTP RPC
                  provider (e.g. Alchemy, Infura)
                  <br />
                  <strong>WS_RPC_URL</strong> — the URL of a WebSocket RPC
                  provider
                  <br />
                  <strong>PRIVATE_KEY</strong> — the private key of the current
                  worker address. Keep this secret and never share it.
                </Typography>
              </Box>

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
