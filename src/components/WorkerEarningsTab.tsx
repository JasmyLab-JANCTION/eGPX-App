import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import { DollarSign, Trophy, Film, ShieldCheck, Layers, Clock } from "lucide-react";
import { COLORS } from "../theme/theme";
import { useWorkers } from "../hooks/useWorkers";
import { useAppKitProvider } from "@reown/appkit/react";
import { BrowserProvider, Contract, Eip1193Provider, formatUnits } from "ethers";
import VideoRenderTasksABI from "../contracts/VideoRenderTasks.json";

const VIDEO_RENDER_TASKS_ADDRESS = import.meta.env
  .VITE_BLOCKCHAIN_VIDEO_RENDERING_TASKS_CONTRACT_ADDRESS;

interface WorkerEarningsTabProps {
  userId: string;
}

interface WorkerStats {
  address: string;
  threadsParticipated: string;
  threadsWon: string;
  framesRendered: string;
  framesValidated: string;
  totalRewardEarned: string;
  totalRenderTime: string;
}

const truncateAddress = (addr: string) =>
  `${addr.slice(0, 6)}...${addr.slice(-4)}`;

export default function WorkerEarningsTab({ userId }: WorkerEarningsTabProps) {
  const { workers, loading, error } = useWorkers(userId);
  const { walletProvider } = useAppKitProvider("eip155");
  const [allWorkerStats, setAllWorkerStats] = useState<WorkerStats[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);

  const fetchAllWorkerStats = useCallback(async () => {
    if (!walletProvider || workers.length === 0) return;
    setLoadingStats(true);
    try {
      const ethersProvider = new BrowserProvider(
        walletProvider as Eip1193Provider,
      );
      const contract = new Contract(
        VIDEO_RENDER_TASKS_ADDRESS,
        VideoRenderTasksABI.abi,
        ethersProvider,
      );

      const results = await Promise.all(
        workers.map(async (w: any) => {
          try {
            const stats = await contract.workerStats(w.address);
            return {
              address: w.address,
              threadsParticipated: stats.threadsParticipated.toString(),
              threadsWon: stats.threadsWon.toString(),
              framesRendered: stats.framesRendered.toString(),
              framesValidated: stats.framesValidated.toString(),
              totalRewardEarned: formatUnits(stats.totalRewardEarned, 6),
              totalRenderTime: stats.totalRenderTime.toString(),
            };
          } catch (err) {
            console.error(`Failed to fetch stats for ${w.address}:`, err);
            return {
              address: w.address,
              threadsParticipated: "0",
              threadsWon: "0",
              framesRendered: "0",
              framesValidated: "0",
              totalRewardEarned: "0",
              totalRenderTime: "0",
            };
          }
        }),
      );

      setAllWorkerStats(results);
    } catch (err) {
      console.error("Failed to fetch worker stats:", err);
    } finally {
      setLoadingStats(false);
    }
  }, [walletProvider, workers]);

  useEffect(() => {
    fetchAllWorkerStats();
  }, [fetchAllWorkerStats]);

  const totals = allWorkerStats.reduce(
    (acc, ws) => ({
      threadsParticipated: acc.threadsParticipated + parseInt(ws.threadsParticipated),
      threadsWon: acc.threadsWon + parseInt(ws.threadsWon),
      framesRendered: acc.framesRendered + parseInt(ws.framesRendered),
      framesValidated: acc.framesValidated + parseInt(ws.framesValidated),
      totalRewardEarned: acc.totalRewardEarned + parseFloat(ws.totalRewardEarned),
      totalRenderTime: acc.totalRenderTime + parseInt(ws.totalRenderTime),
    }),
    {
      threadsParticipated: 0,
      threadsWon: 0,
      framesRendered: 0,
      framesValidated: 0,
      totalRewardEarned: 0,
      totalRenderTime: 0,
    },
  );

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 10 }}>
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
        Earnings
      </Typography>
      <Typography sx={{ fontSize: "0.9375rem", color: COLORS.slate, mb: 4 }}>
        Track your earnings across all worker nodes
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {workers.length === 0 ? (
        <Paper
          sx={{
            p: 6,
            textAlign: "center",
            border: `2px dashed ${COLORS.border}`,
            bgcolor: "#FAFBFC",
          }}
        >
          <DollarSign
            size={48}
            color={COLORS.slate}
            style={{ marginBottom: 16, opacity: 0.5 }}
          />
          <Typography
            sx={{ fontSize: "1.25rem", fontWeight: 600, color: COLORS.navy, mb: 1 }}
          >
            No Workers Registered
          </Typography>
          <Typography
            sx={{ fontSize: "0.9375rem", color: COLORS.slate, maxWidth: 400, mx: "auto" }}
          >
            Register a worker in the Configuration tab to start earning rewards.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {/* Total Earnings Card */}
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 4, borderLeft: `4px solid ${COLORS.green}` }}>
              <Typography
                sx={{ fontSize: "1.125rem", fontWeight: 600, color: COLORS.navy, mb: 2 }}
              >
                Total Earnings
              </Typography>
              {loadingStats ? (
                <CircularProgress sx={{ color: COLORS.navy }} />
              ) : (
                <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                  <Typography
                    sx={{
                      fontFamily: "monospace",
                      fontSize: "3rem",
                      fontWeight: 700,
                      color: COLORS.navy,
                    }}
                  >
                    ${totals.totalRewardEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                  <Typography
                    sx={{ fontSize: "1rem", fontWeight: 600, color: COLORS.slate }}
                  >
                    USDC
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Per-Worker Earnings */}
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 4 }}>
              <Typography
                sx={{ fontSize: "1.125rem", fontWeight: 600, color: COLORS.navy, mb: 3 }}
              >
                Earnings by Worker
              </Typography>
              {loadingStats ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress sx={{ color: COLORS.navy }} />
                </Box>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {allWorkerStats.map((ws) => (
                    <Box
                      key={ws.address}
                      sx={{
                        p: 2.5,
                        bgcolor: "#F8F9FA",
                        borderRadius: 1,
                        border: `1px solid ${COLORS.border}`,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 1.5,
                        }}
                      >
                        <Typography
                          sx={{
                            fontFamily: "monospace",
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            color: COLORS.navy,
                          }}
                        >
                          {truncateAddress(ws.address)}
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: "monospace",
                            fontSize: "1.25rem",
                            fontWeight: 700,
                            color: COLORS.green,
                          }}
                        >
                          ${parseFloat(ws.totalRewardEarned).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                        <Typography sx={{ fontSize: "0.75rem", color: COLORS.slate }}>
                          Threads won: <strong>{ws.threadsWon}</strong>
                        </Typography>
                        <Typography sx={{ fontSize: "0.75rem", color: COLORS.slate }}>
                          Frames rendered: <strong>{ws.framesRendered}</strong>
                        </Typography>
                        <Typography sx={{ fontSize: "0.75rem", color: COLORS.slate }}>
                          Frames validated: <strong>{ws.framesValidated}</strong>
                        </Typography>
                        <Typography sx={{ fontSize: "0.75rem", color: COLORS.slate }}>
                          Render time: <strong>{ws.totalRenderTime}s</strong>
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Earnings Summary */}
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 4 }}>
              <Typography
                sx={{ fontSize: "1.125rem", fontWeight: 600, color: COLORS.navy, mb: 3 }}
              >
                Earnings Summary
              </Typography>
              {loadingStats ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress sx={{ color: COLORS.navy }} />
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {[
                    {
                      label: "Total Reward Earned",
                      value: `$${totals.totalRewardEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`,
                      icon: <DollarSign size={24} color={COLORS.green} />,
                    },
                    {
                      label: "Threads Participated",
                      value: totals.threadsParticipated.toString(),
                      icon: <Layers size={24} color={COLORS.navy} />,
                    },
                    {
                      label: "Threads Won",
                      value: totals.threadsWon.toString(),
                      icon: <Trophy size={24} color={COLORS.gold} />,
                    },
                    {
                      label: "Frames Rendered",
                      value: totals.framesRendered.toString(),
                      icon: <Film size={24} color={COLORS.navy} />,
                    },
                    {
                      label: "Frames Validated",
                      value: totals.framesValidated.toString(),
                      icon: <ShieldCheck size={24} color={COLORS.green} />,
                    },
                    {
                      label: "Total Render Time",
                      value: `${totals.totalRenderTime}s`,
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
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
