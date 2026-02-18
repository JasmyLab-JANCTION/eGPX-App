import { Box, Typography, Paper, Grid } from "@mui/material";
import { Activity } from "lucide-react";
import { COLORS } from "../theme/theme";
import { useMyWorkers, WorkerRuntimeStatus } from "../hooks/useMyWorkers";

const runtimeStatusConfig: Record<
  WorkerRuntimeStatus,
  { color: string; bgColor: string; label: string; description: string }
> = {
  running_idle: {
    color: COLORS.green,
    bgColor: COLORS.greenBg,
    label: "Running - Idle",
    description: "Worker is online and waiting for tasks",
  },
  running_executing: {
    color: COLORS.blue,
    bgColor: COLORS.blueBg,
    label: "Running - Executing Task",
    description: "Worker is online and currently processing a task",
  },
  not_running: {
    color: COLORS.slate,
    bgColor: "#F8F9FA",
    label: "Not Running",
    description: "Worker has not reported in over 120 seconds",
  },
};

interface WorkerStatusSectionProps {
  userId: string;
  selectedAddress: string | null;
}

export default function WorkerStatusSection({
  userId,
  selectedAddress,
}: WorkerStatusSectionProps) {
  const { myWorkers } = useMyWorkers(userId);

  const selectedWorkerStatus = myWorkers.find(
    (w) => w.address === selectedAddress || w.id === selectedAddress,
  );

  if (!selectedAddress || !selectedWorkerStatus) return null;

  const config = runtimeStatusConfig[selectedWorkerStatus.runtimeStatus];

  return (
    <Grid item xs={12}>
      <Paper
        sx={{
          p: 4,
          borderLeft: `4px solid ${config.color}`,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography
            sx={{
              fontSize: "1.125rem",
              fontWeight: 600,
              color: COLORS.navy,
            }}
          >
            Worker Status
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            p: 2.5,
            bgcolor: config.bgColor,
            borderRadius: 1,
            border: `1px solid ${config.color}20`,
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              bgcolor: `${config.color}15`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Activity size={20} color={config.color} />
          </Box>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: config.color,
                  ...(selectedWorkerStatus.runtimeStatus !== "not_running" && {
                    animation: "pulse 2s infinite",
                    "@keyframes pulse": {
                      "0%": { boxShadow: `0 0 0 0 ${config.color}60` },
                      "70%": { boxShadow: `0 0 0 6px ${config.color}00` },
                      "100%": { boxShadow: `0 0 0 0 ${config.color}00` },
                    },
                  }),
                }}
              />
              <Typography
                sx={{
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                  color: config.color,
                }}
              >
                {config.label}
              </Typography>
            </Box>
            <Typography
              sx={{ fontSize: "0.8125rem", color: COLORS.slate }}
            >
              {config.description}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Grid>
  );
}
