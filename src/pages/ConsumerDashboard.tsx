import { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Grid, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, Divider, TextField, FormControlLabel, Switch, CircularProgress, LinearProgress, Link } from '@mui/material';
import { ListChecks, BarChart3, Settings, Plus, Download, Check, CheckCircle } from 'lucide-react';
import { COLORS } from '../theme/theme';
import {  mockBlockchainStats, mockUserProfile } from '../mockData';
import DashboardLayout from '../components/DashboardLayout';
import TaskSubmissionWizard from '../components/TaskSubmissionWizard';
import { useVideoRenderingTasks } from '../hooks/useFirestoreData.js';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { formatUnits } from 'ethers';

interface ConsumerDashboardProps {
  onRoleSwitch: () => void;
  onLogout: () => void;
  user: object
}

interface Task {
  id: string;
  taskName: string;
  status: string;
  frameFrom: number;
  frameTo: number;
  reward: number;
  rewardFormated: string;
  fileName: string;
  submittedAt?: string;
  workersAssigned?: number;
  progress?: number;
}


interface Thread {
  id: string | number;         // threadId
  status: string;              // COMPLETED / SOLUTION_PROPOSED / RENDERING / etc
  startFrame: number;
  endFrame: number;
  acceptedProposer?: string;
  workers?: any[];             // same shape you currently use
  reward?: any;                // bigint-ish, same as your task reward
  solutionZip?: any;           // same as current
  solution?: any;              // { url, status }
}

type TaskWithThreads = Task & {
  threads?: Thread[];
};




export default function ConsumerDashboard({ onRoleSwitch, onLogout, user }: ConsumerDashboardProps) {
  const [activeMenuItem, setActiveMenuItem] = useState('my-tasks');
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [displayName, setDisplayName] = useState(mockUserProfile.name);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(mockUserProfile.twoFactorEnabled);
  const { videoRenderingTasks, loading, error } = useVideoRenderingTasks(user?.uid);
  const [expandedTaskId, setExpandedTaskId] = useState<string | false>(false);
const [selectedThread, setSelectedThread] = useState<{
  task: any;
  thread: any;
} | null>(null);
const [threadDetailsOpen, setThreadDetailsOpen] = useState(false);

  const menuItems = [
    { id: 'my-tasks', label: 'My Tasks', icon: ListChecks },
    { id: 'network', label: 'Network', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return COLORS.green;
      case 'RENDERING': return COLORS.gold;
      case "SOLUTION_PROPOSED": return COLORS.navyLight;
      case "navyLight": return COLORS.amber;
      case 'Open': return COLORS.blue;
      default: return COLORS.slate;
    }
  };

  useEffect(() => {
    if (selectedTask){
      setSelectedTask(current => (videoRenderingTasks.find(val => val.id === current.id) ))
    }
  }, [videoRenderingTasks])
  

  const handleViewThreadDetails = (task: any, thread: any) => {
  setSelectedThread({ task, thread });
  setThreadDetailsOpen(true);
};

const handleCloseThreadDetails = () => {
  setThreadDetailsOpen(false);
  setSelectedThread(null);
};

  const renderThreadDetailsDialog = () => {
  if (!selectedThread) return null;

  const { task, thread } = selectedThread;

  const isCompleted = thread.status === "COMPLETED";
  const workers = thread.workers || [];

  if (isCompleted) {
    return (
      <Dialog open={threadDetailsOpen} onClose={handleCloseThreadDetails} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography sx={{ fontFamily: '"Playfair Display", serif', fontSize: "1.5rem", fontWeight: 700, color: COLORS.navy }}>
            Thread Completed
          </Typography>
          <Typography sx={{ fontSize: "0.875rem", color: COLORS.slate, mt: 0.5 }}>
            {task.taskName} • Thread #{thread.id}
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Check size={20} style={{ color: COLORS.green }} />
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: COLORS.slate }}>
                Winner Node
              </Typography>
            </Box>

            <Paper sx={{ p: 2, bgcolor: COLORS.background, border: `1px solid ${COLORS.border}` }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography sx={{ fontFamily: "monospace", fontSize: "0.9375rem", fontWeight: 600, color: COLORS.navy }}>
                  {thread.acceptedProposer || "—"}
                </Typography>

                <Chip
                  label={`${task.rewardCurrency || "$"} ${thread.rewardFormatted || task.rewardFormatted || "—"}`}
                  size="small"
                  sx={{
                    bgcolor: `${COLORS.green}20`,
                    color: COLORS.green,
                    fontWeight: 700,
                    fontSize: "0.8125rem",
                    fontFamily: "monospace",
                  }}
                />
              </Box>
            </Paper>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: COLORS.slate, mb: 2 }}>
              Verifiers ({workers.length} Nodes)
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {workers.map((verifier, index) => (
                <Paper key={index} sx={{ p: 1.5, bgcolor: COLORS.background, border: `1px solid ${COLORS.border}` }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography sx={{ fontFamily: "monospace", fontSize: "0.8125rem", color: COLORS.navy }}>
                      {verifier.address || verifier.uid || "—"}
                    </Typography>

                    <Chip
                      label={`${task.rewardCurrency || "$"} ${thread.validatorRewardFormatted || "—"}`}
                      size="small"
                      sx={{
                        bgcolor: `${COLORS.blue}20`,
                        color: COLORS.blue,
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        fontFamily: "monospace",
                      }}
                    />
                  </Box>
                </Paper>
              ))}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={handleCloseThreadDetails}
            sx={{
              color: COLORS.slate,
              textTransform: "none",
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            Close
          </Button>

          <Button
            startIcon={<Download size={18} />}
            LinkComponent={Link}
            href={thread.solutionZip?.url}
            underline="none"
            disabled={!thread.solutionZip || thread.solutionZip.status !== "ready"}
            sx={{
              bgcolor: COLORS.navy,
              color: COLORS.white,
              px: 3,
              py: 1,
              textTransform: "none",
              fontSize: "0.875rem",
              fontWeight: 600,
              "&:hover": { bgcolor: COLORS.navyLight },
              "&.Mui-disabled": {
                background: "#f0f0f0",
                color: "#9e9e9e",
              },
            }}
          >
            {!thread.solutionZip || thread.solutionZip.status !== "ready" ? "Generating Zip..." : "Download Solution"}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  // In progress view (same as your old task dialog, but for the thread)
  const renderingNodes = workers;

  return (
    <Dialog open={threadDetailsOpen} onClose={handleCloseThreadDetails} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography sx={{ fontFamily: '"Playfair Display", serif', fontSize: "1.5rem", fontWeight: 700, color: COLORS.navy }}>
          Thread In Progress
        </Typography>
        <Typography sx={{ fontSize: "0.875rem", color: COLORS.slate, mt: 0.5 }}>
          {task.taskName} • Thread #{thread.id}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: COLORS.slate, mb: 2 }}>
          Active Nodes ({renderingNodes.length} Working)
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {renderingNodes.map((node, index) => (
            <Paper key={index} sx={{ p: 2, bgcolor: COLORS.background, border: `1px solid ${COLORS.border}` }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
                <Box sx={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CircularProgress variant="determinate" value={node.progressPct || 0} size={36} thickness={4} sx={{ color: COLORS.gold }} />
                  <Typography sx={{ position: "absolute", fontSize: "0.625rem", fontWeight: 700, color: COLORS.gold }}>
                    {`${node.progressPct || 0}%`}
                  </Typography>
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontFamily: "monospace", fontSize: "0.8125rem", fontWeight: 600, color: COLORS.navy }}>
                    {node.uid || node.address || "—"}
                  </Typography>
                </Box>

                <Chip
                  label={`Rendered ${node.framesRendered || 0}/${node.totalFrames || 0}`}
                  size="small"
                  sx={{
                    bgcolor: `${COLORS.gold}20`,
                    color: COLORS.gold,
                    fontWeight: 600,
                    fontSize: "0.6875rem",
                  }}
                />
              </Box>

              {node.status !== "DONE" && (
                <Box mt={2} sx={{ width: "100%" }}>
                  <LinearProgress color="secondary" />
                </Box>
              )}
            </Paper>
          ))}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button
          onClick={handleCloseThreadDetails}
          sx={{
            bgcolor: COLORS.navy,
            color: COLORS.white,
            px: 3,
            py: 1,
            textTransform: "none",
            fontSize: "0.875rem",
            fontWeight: 600,
            "&:hover": { bgcolor: COLORS.navyLight },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

  const renderContent = () => {
    switch (activeMenuItem) {
      case 'my-tasks':
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Box>
                <Typography sx={{ fontFamily: '"Playfair Display", serif', fontSize: '2rem', fontWeight: 700, color: COLORS.navy, mb: 1 }}>
                  My Tasks
                </Typography>
                <Typography sx={{ fontSize: '0.9375rem', color: COLORS.slate }}>
                  Manage your rendering tasks and submit new ones
                </Typography>
              </Box>
              <Button
                startIcon={<Plus size={20} />}
                onClick={() => setWizardOpen(true)}
                sx={{
                  bgcolor: COLORS.navy,
                  color: COLORS.white,
                  px: 3,
                  py: 1.25,
                  textTransform: 'none',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  '&:hover': { bgcolor: '#0a1628' }
                }}
              >
                Submit New Task
              </Button>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 3, borderLeft: `4px solid ${COLORS.blue}` }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.slate, mb: 1 }}>
                      Active Tasks
                    </Typography>
                    <Typography sx={{ fontFamily: 'monospace', fontSize: '2rem', fontWeight: 700, color: COLORS.navy }}>
                      {videoRenderingTasks.filter(t => t.status !== 'COMPLETED').length}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 3, borderLeft: `4px solid ${COLORS.green}` }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.slate, mb: 1 }}>
                      Completed
                    </Typography>
                    <Typography sx={{ fontFamily: 'monospace', fontSize: '2rem', fontWeight: 700, color: COLORS.navy }}>
                      {videoRenderingTasks.filter(t => t.status === 'COMPLETED').length}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 3, borderLeft: `4px solid ${COLORS.gold}` }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.slate, mb: 1 }}>
                      Total Spent
                    </Typography>
                    <Typography sx={{ fontFamily: 'monospace', fontSize: '2rem', fontWeight: 700, color: COLORS.navy }}>
                      ${formatUnits( videoRenderingTasks.reduce((sum, t) => sum + t.reward, 0),6).toLocaleString()}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
  {videoRenderingTasks.map((task) => {
    const threads = task.threads || []; // assumes your hook provides threads array

    return (
      <Accordion
        key={task.id}
        expanded={expandedTaskId === task.id}
        onChange={(_, isExpanded) => setExpandedTaskId(isExpanded ? task.id : false)}
        disableGutters
        sx={{
          border: `1px solid ${COLORS.border}`,
          borderRadius: "12px",
          overflow: "hidden",
          "&:before": { display: "none" },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            bgcolor: "#F8F9FA",
            "& .MuiAccordionSummary-content": { alignItems: "center" },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", width: "100%", gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: COLORS.navy }}>
                {task.taskName}
              </Typography>
              <Typography sx={{ fontSize: "0.8125rem", color: COLORS.slate }}>
                Frames {task.frameFrom}-{task.frameTo}
              </Typography>
            </Box>

            <Chip
              label={task.status}
              size="small"
              sx={{
                bgcolor: `${getStatusColor(task.status)}20`,
                color: getStatusColor(task.status),
                fontWeight: 700,
                fontSize: "0.75rem",
              }}
            />

            <Typography sx={{ fontFamily: "monospace", fontWeight: 700, color: COLORS.navy, minWidth: 120, textAlign: "right" }}>
              {task.rewardCurrency || "$"} {task.rewardFormatted || 0}
            </Typography>
          </Box>
        </AccordionSummary>

        <AccordionDetails sx={{ bgcolor: COLORS.white }}>
          {/* Threads header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography sx={{ fontWeight: 800, color: COLORS.navy, fontSize: "0.95rem" }}>
              Threads ({threads.length})
            </Typography>
            <Typography sx={{ color: COLORS.slate, fontSize: "0.8125rem" }}>
              Expand a thread to download or track progress
            </Typography>
          </Box>

          {/* Threads table */}
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: "10px", borderColor: COLORS.border }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#FAFAFB" }}>
                  <TableCell sx={{ fontWeight: 800, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Thread
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Frames
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Workers
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {threads.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography sx={{ color: COLORS.slate, fontSize: "0.875rem" }}>
                        No threads yet.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}

                {threads.map((th) => (
                  <TableRow key={String(th.id)} sx={{ "&:hover": { bgcolor: "#F8F9FA" } }}>
                    <TableCell>
                      <Typography sx={{ fontWeight: 700, color: COLORS.navy }}>
                        #{th.id}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography sx={{ fontSize: "0.875rem", color: COLORS.slate }}>
                        {th.startFrame}-{th.endFrame}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={th.status}
                        size="small"
                        sx={{
                          bgcolor: `${getStatusColor(th.status)}20`,
                          color: getStatusColor(th.status),
                          fontWeight: 700,
                          fontSize: "0.75rem",
                          textTransform: "capitalize",
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Typography sx={{ fontFamily: "monospace", color: COLORS.slate, fontSize: "0.8125rem" }}>
                        {(th.workers || []).length}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => handleViewThreadDetails(task, th)}
                        sx={{ textTransform: "none", fontSize: "0.8125rem", color: COLORS.navy, fontWeight: 700 }}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>
    );
  })}
</Box>

          </Box>
        );

      case 'network':
        return (
          <Box>
            <Typography sx={{ fontFamily: '"Playfair Display", serif', fontSize: '2rem', fontWeight: 700, color: COLORS.navy, mb: 1 }}>
              Network Stats
            </Typography>
            <Typography sx={{ fontSize: '0.9375rem', color: COLORS.slate, mb: 4 }}>
              Real-time network performance and worker statistics
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 3, borderLeft: `4px solid ${COLORS.gold}` }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.slate, mb: 1 }}>
                    Active Workers
                  </Typography>
                  <Typography sx={{ fontFamily: 'monospace', fontSize: '2rem', fontWeight: 700, color: COLORS.navy }}>
                    {mockBlockchainStats.activeWorkers.toLocaleString()}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 3, borderLeft: `4px solid ${COLORS.green}` }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.slate, mb: 1 }}>
                    Tasks Completed
                  </Typography>
                  <Typography sx={{ fontFamily: 'monospace', fontSize: '2rem', fontWeight: 700, color: COLORS.navy }}>
                    {mockBlockchainStats.totalTasksCompleted.toLocaleString()}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 3, borderLeft: `4px solid ${COLORS.blue}` }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.slate, mb: 1 }}>
                    Frames Rendered
                  </Typography>
                  <Typography sx={{ fontFamily: 'monospace', fontSize: '2rem', fontWeight: 700, color: COLORS.navy }}>
                    {(mockBlockchainStats.framesRendered / 1000000).toFixed(1)}M
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 3, borderLeft: `4px solid ${COLORS.gold}` }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.slate, mb: 1 }}>
                    Avg Frame Time
                  </Typography>
                  <Typography sx={{ fontFamily: 'monospace', fontSize: '2rem', fontWeight: 700, color: COLORS.navy }}>
                    {mockBlockchainStats.avgFrameRenderTime}s
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );

      case 'settings':
        return (
          <Box>
            <Typography sx={{ fontFamily: '"Playfair Display", serif', fontSize: '2rem', fontWeight: 700, color: COLORS.navy, mb: 1 }}>
              Settings
            </Typography>
            <Typography sx={{ fontSize: '0.9375rem', color: COLORS.slate, mb: 4 }}>
              Manage your account settings and preferences
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 4 }}>
                  <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: COLORS.navy, mb: 3 }}>
                    Profile Settings
                  </Typography>

                  <Box sx={{ mb: 3 }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.slate, mb: 1 }}>
                      Display Name
                    </Typography>
                    <TextField
                      fullWidth
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      size="small"
                      placeholder="Enter your display name"
                    />
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.slate, mb: 1 }}>
                      Email Address
                    </Typography>
                    <TextField
                      fullWidth
                      value={mockUserProfile.email}
                      size="small"
                      disabled
                      sx={{ bgcolor: '#F8F9FA' }}
                    />
                    <Typography sx={{ fontSize: '0.75rem', color: COLORS.slate, mt: 0.5 }}>
                      Email cannot be changed
                    </Typography>
                  </Box>

                  <Button
                    fullWidth
                    sx={{
                      bgcolor: COLORS.navy,
                      color: COLORS.white,
                      py: 1.25,
                      textTransform: 'none',
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      '&:hover': { bgcolor: '#0a1628' }
                    }}
                  >
                    Save Profile Changes
                  </Button>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 4 }}>
                  <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: COLORS.navy, mb: 3 }}>
                    Security Settings
                  </Typography>

                  <Box sx={{ mb: 3, p: 3, bgcolor: twoFactorEnabled ? `${COLORS.green}10` : '#F8F9FA', borderRadius: 1, border: `1px solid ${twoFactorEnabled ? COLORS.green : COLORS.border}` }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={twoFactorEnabled}
                          onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                        />
                      }
                      label={
                        <Box>
                          <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                            Two-Factor Authentication
                          </Typography>
                          <Typography sx={{ fontSize: '0.75rem', color: COLORS.slate }}>
                            Add an extra layer of security to your account
                          </Typography>
                        </Box>
                      }
                    />
                    {twoFactorEnabled && (
                      <Box sx={{ mt: 2, p: 2, bgcolor: COLORS.white, borderRadius: 1, border: `1px solid ${COLORS.border}` }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <CheckCircle size={16} color={COLORS.green} />
                          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: COLORS.green }}>
                            2FA Enabled
                          </Typography>
                        </Box>
                        <Typography sx={{ fontSize: '0.75rem', color: COLORS.slate }}>
                          Your account is protected with two-factor authentication
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  <Box>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: COLORS.navy, mb: 2 }}>
                      Change Password
                    </Typography>
                    <Button
                      fullWidth
                      variant="outlined"
                      sx={{
                        borderColor: COLORS.border,
                        color: COLORS.navy,
                        py: 1.25,
                        textTransform: 'none',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        '&:hover': { borderColor: COLORS.navy, bgcolor: 'transparent' }
                      }}
                    >
                      Update Password
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <DashboardLayout
        userRole="consumer"
        activeMenuItem={activeMenuItem}
        onMenuItemClick={setActiveMenuItem}
        onRoleSwitch={onRoleSwitch}
        onLogout={onLogout}
        menuItems={menuItems}
        user={user}
      >
        {renderContent()}
      </DashboardLayout>
      <TaskSubmissionWizard open={wizardOpen} onClose={() => setWizardOpen(false)} />
      {renderThreadDetailsDialog()}
    </>
  );
}
