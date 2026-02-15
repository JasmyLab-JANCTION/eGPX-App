import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Wallet,
  Star,
  Layers,
  Trophy,
  Film,
  ShieldCheck,
  DollarSign,
  Clock,
} from "lucide-react";
import { COLORS } from "../theme/theme";
import { useWorkers } from "../hooks/useWorkers";
import { useAppKitProvider } from "@reown/appkit/react";
import { BrowserProvider, Contract, Eip1193Provider, formatUnits } from "ethers";
import WorkerRegistryABI from "../contracts/WorkerRegistry.json";
import VideoRenderTasksABI from "../contracts/VideoRenderTasks.json";

const WORKER_REGISTRY_ADDRESS = import.meta.env
  .VITE_BLOCKCHAIN_WORKER_REGISTRY_ADDRESS;
const VIDEO_RENDER_TASKS_ADDRESS = import.meta.env
  .VITE_BLOCKCHAIN_VIDEO_RENDERING_TASKS_CONTRACT_ADDRESS;

interface WorkerReputationTabProps {
  userId: string;
}

const truncateAddress = (addr: string) =>
  `${addr.slice(0, 6)}...${addr.slice(-4)}`;

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

export default function WorkerReputationTab({
  userId,
}: WorkerReputationTabProps) {
  const { workers, loading, error } = useWorkers(userId);
  const { walletProvider } = useAppKitProvider("eip155");
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [reputation, setReputation] = useState<string | null>(null);
  const [loadingReputation, setLoadingReputation] = useState(false);
  const [workerStats, setWorkerStats] = useState<{
    threadsParticipated: string;
    threadsWon: string;
    framesRendered: string;
    framesValidated: string;
    totalRewardEarned: string;
    totalRenderTime: string;
  } | null>(null);

  const selectedWorker = workers.find(
    (w: any) => w.address === selectedAddress,
  );

  // Auto-select first worker
  useEffect(() => {
    if (!selectedAddress && workers.length > 0) {
      setSelectedAddress(workers[0].address);
    }
  }, [workers, selectedAddress]);

  // Fetch on-chain reputation and worker stats
  const fetchOnChainData = useCallback(async () => {
    if (!selectedAddress || !walletProvider) return;
    setLoadingReputation(true);
    try {
      const ethersProvider = new BrowserProvider(
        walletProvider as Eip1193Provider,
      );
      const workerRegistry = new Contract(
        WORKER_REGISTRY_ADDRESS,
        WorkerRegistryABI.abi,
        ethersProvider,
      );
      const videoRenderTasks = new Contract(
        VIDEO_RENDER_TASKS_ADDRESS,
        VideoRenderTasksABI.abi,
        ethersProvider,
      );

      const [rep, stats] = await Promise.all([
        workerRegistry.reputationOf(selectedAddress),
        videoRenderTasks.workerStats(selectedAddress),
      ]);

      setReputation(rep.toString());
      setWorkerStats({
        threadsParticipated: stats.threadsParticipated.toString(),
        threadsWon: stats.threadsWon.toString(),
        framesRendered: stats.framesRendered.toString(),
        framesValidated: stats.framesValidated.toString(),
        totalRewardEarned: formatUnits(stats.totalRewardEarned, 6),
        totalRenderTime: stats.totalRenderTime.toString(),
      });
    } catch (err) {
      console.error("Failed to fetch on-chain data:", err);
      setReputation(null);
      setWorkerStats(null);
    } finally {
      setLoadingReputation(false);
    }
  }, [selectedAddress, walletProvider]);

  useEffect(() => {
    fetchOnChainData();
  }, [fetchOnChainData]);

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
        Reputation
      </Typography>
      <Typography sx={{ fontSize: "0.9375rem", color: COLORS.slate, mb: 4 }}>
        Track your on-chain reputation score across your worker nodes
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

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

      {selectedWorker ? (
        <Grid container spacing={3}>
          {/* Reputation Score */}
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 4,
                textAlign: "center",
                borderTop: `4px solid ${COLORS.gold}`,
              }}
            >
              <Star
                size={48}
                color={COLORS.gold}
                fill={COLORS.gold}
                style={{ marginBottom: "16px" }}
              />
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: COLORS.slate,
                  mb: 2,
                }}
              >
                On-Chain Reputation
              </Typography>
              {loadingReputation ? (
                <CircularProgress sx={{ color: COLORS.navy, my: 2 }} />
              ) : (
                <Typography
                  sx={{
                    fontFamily: "monospace",
                    fontSize: "3rem",
                    fontWeight: 700,
                    color: COLORS.navy,
                    mb: 1,
                  }}
                >
                  {reputation !== null ? reputation : "—"}
                </Typography>
              )}
              <Typography sx={{ fontSize: "0.875rem", color: COLORS.slate }}>
                {selectedWorker.address}
              </Typography>
            </Paper>
          </Grid>

          {/* About Reputation */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 4 }}>
              <Typography
                sx={{
                  fontSize: "1.125rem",
                  fontWeight: 600,
                  color: COLORS.navy,
                  mb: 3,
                }}
              >
                How Reputation Works
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.8125rem",
                  color: COLORS.slate,
                  lineHeight: 1.8,
                  mb: 2,
                }}
              >
                Your reputation score is stored on-chain and updated
                automatically based on your worker&apos;s performance.
                Successfully completing tasks increases your reputation, while
                failing or abandoning tasks decreases it.
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.8125rem",
                  color: COLORS.slate,
                  lineHeight: 1.8,
                }}
              >
                A higher reputation score makes your worker more likely to be
                assigned tasks, especially high-value ones. Some task creators
                may set a minimum reputation requirement for their jobs.
              </Typography>
            </Paper>
          </Grid>

          {/* Recent Work History */}
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
                Recent Work History
              </Typography>

              {loadingReputation ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    py: 4,
                  }}
                >
                  <CircularProgress sx={{ color: COLORS.navy }} />
                </Box>
              ) : workerStats ? (
                <Grid container spacing={2}>
                  {[
                    {
                      label: "Threads Participated",
                      value: workerStats.threadsParticipated,
                      icon: <Layers size={24} color={COLORS.navy} />,
                    },
                    {
                      label: "Threads Won",
                      value: workerStats.threadsWon,
                      icon: <Trophy size={24} color={COLORS.gold} />,
                    },
                    {
                      label: "Frames Rendered",
                      value: workerStats.framesRendered,
                      icon: <Film size={24} color={COLORS.navy} />,
                    },
                    {
                      label: "Frames Validated",
                      value: workerStats.framesValidated,
                      icon: <ShieldCheck size={24} color={COLORS.green} />,
                    },
                    {
                      label: "Total Reward Earned",
                      value: `${workerStats.totalRewardEarned} USDC`,
                      icon: <DollarSign size={24} color={COLORS.green} />,
                    },
                    {
                      label: "Total Render Time",
                      value: `${workerStats.totalRenderTime}s`,
                      icon: <Clock size={24} color={COLORS.slate} />,
                    },
                  ].map((stat) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={stat.label}>
                      <Box
                        sx={{
                          p: 3,
                          borderRadius: 2,
                          bgcolor: "#F8F9FA",
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 1.5,
                            bgcolor: COLORS.white,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {stat.icon}
                        </Box>
                        <Box>
                          <Typography
                            sx={{
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              color: COLORS.slate,
                              mb: 0.5,
                            }}
                          >
                            {stat.label}
                          </Typography>
                          <Typography
                            sx={{
                              fontFamily: "monospace",
                              fontSize: "1.25rem",
                              fontWeight: 700,
                              color: COLORS.navy,
                            }}
                          >
                            {stat.value}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography
                  sx={{
                    fontSize: "0.875rem",
                    color: COLORS.slate,
                    textAlign: "center",
                    py: 4,
                  }}
                >
                  No work history available for this worker.
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      ) : workers.length === 0 ? (
        <Paper
          sx={{
            p: 6,
            textAlign: "center",
            border: `2px dashed ${COLORS.border}`,
            bgcolor: "#FAFBFC",
          }}
        >
          <Star
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
              maxWidth: 400,
              mx: "auto",
            }}
          >
            Register a worker in the Configuration tab to start building your
            reputation.
          </Typography>
        </Paper>
      ) : null}
    </Box>
  );
}
