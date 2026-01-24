import { useState } from 'react';
import { Box, Typography, Paper, Grid, Switch, FormControlLabel, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, LinearProgress, Divider, MenuItem, Select } from '@mui/material';
import { Award, Coins, Settings, BarChart3, Sliders, Star, TrendingUp, CheckCircle, XCircle, Wallet } from 'lucide-react';
import { COLORS } from '../theme/theme';
import { mockUserProfile, mockBlockchainStats } from '../mockData';
import DashboardLayout from '../components/DashboardLayout';

interface WorkerDashboardProps {
  onRoleSwitch: () => void;
  onLogout: () => void;
}

export default function WorkerDashboard({ onRoleSwitch, onLogout }: WorkerDashboardProps) {
  const [activeMenuItem, setActiveMenuItem] = useState('dashboard');
  const [displayName, setDisplayName] = useState(mockUserProfile.name);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(mockUserProfile.twoFactorEnabled);
  const [selectedOS, setSelectedOS] = useState('linux');
  const [selectedSoftware, setSelectedSoftware] = useState('blender');
  const [minReward, setMinReward] = useState('50');
  const [walletConnected, setWalletConnected] = useState(false);
  const stats = mockUserProfile;

  const earningsData = [
    { month: 'Jan', amount: 850 },
    { month: 'Feb', amount: 1250 },
    { month: 'Mar', amount: 1580 },
    { month: 'Apr', amount: 2100 },
    { month: 'May', amount: 2650 },
    { month: 'Jun', amount: 3420 }
  ];

  const maxEarnings = Math.max(...earningsData.map(d => d.amount));

  const generateDockerImageName = () => {
    const softwareVersions: Record<string, string> = {
      blender: 'blender-4.3-cycles',
      'v-ray': 'vray-6.2',
      lumion: 'lumion-12.5',
      unreal: 'unreal-5.3'
    };
    return `${selectedOS}-${softwareVersions[selectedSoftware]}:latest`;
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'configuration', label: 'Configuration', icon: Sliders },
    { id: 'reputation', label: 'Reputation', icon: Star },
    { id: 'earnings', label: 'Earnings', icon: Coins },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const renderContent = () => {
    switch (activeMenuItem) {
      case 'dashboard':
        return (
          <Box>
            <Typography sx={{ fontFamily: '"Playfair Display", serif', fontSize: '2rem', fontWeight: 700, color: COLORS.navy, mb: 1 }}>
              Worker Dashboard
            </Typography>
            <Typography sx={{ fontSize: '0.9375rem', color: COLORS.slate, mb: 4 }}>
              Monitor your performance and earnings
            </Typography>

            <Paper sx={{ p: 4, mb: 4, background: COLORS.white }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                <Box>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.slate, mb: 1 }}>
                    Total Earnings
                  </Typography>
                  <Typography sx={{ fontFamily: 'monospace', fontSize: '3rem', fontWeight: 700, color: COLORS.navy, mb: 1 }}>
                    ${earningsData[earningsData.length - 1].amount.toLocaleString()}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUp size={16} color={COLORS.green} />
                    <Typography sx={{ fontSize: '0.875rem', color: COLORS.green, fontWeight: 600 }}>
                      +{Math.round(((earningsData[earningsData.length - 1].amount - earningsData[earningsData.length - 2].amount) / earningsData[earningsData.length - 2].amount) * 100)}% from last month
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ textAlign: 'center', px: 3, py: 2, bgcolor: '#F8F9FA', borderRadius: 1, border: '1px solid #E5E7EB' }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.slate, mb: 0.5 }}>
                      This Month
                    </Typography>
                    <Typography sx={{ fontFamily: 'monospace', fontSize: '1.5rem', fontWeight: 700, color: COLORS.navy }}>
                      ${earningsData[earningsData.length - 1].amount}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center', px: 3, py: 2, bgcolor: '#F8F9FA', borderRadius: 1, border: '1px solid #E5E7EB' }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.slate, mb: 0.5 }}>
                      Avg/Month
                    </Typography>
                    <Typography sx={{ fontFamily: 'monospace', fontSize: '1.5rem', fontWeight: 700, color: COLORS.navy }}>
                      ${Math.round(earningsData.reduce((acc, curr) => acc + curr.amount, 0) / earningsData.length)}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ position: 'relative', height: 300, px: 2, py: 3 }}>
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: COLORS.blue, stopOpacity: 0.2 }} />
                      <stop offset="100%" style={{ stopColor: COLORS.blue, stopOpacity: 0.05 }} />
                    </linearGradient>
                  </defs>

                  <polygon
                    points={`0,100 ${earningsData.map((data, index) => {
                      const x = (index / (earningsData.length - 1)) * 100;
                      const y = 100 - ((data.amount / maxEarnings) * 70);
                      return `${x},${y}`;
                    }).join(' ')} 100,100`}
                    fill="url(#areaGradient)"
                  />

                  <polyline
                    points={earningsData.map((data, index) => {
                      const x = (index / (earningsData.length - 1)) * 100;
                      const y = 100 - ((data.amount / maxEarnings) * 70);
                      return `${x},${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke={COLORS.navy}
                    strokeWidth="0.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                </svg>

                <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', px: 2, py: 3 }}>
                  <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                    {earningsData.map((data, index) => {
                      const xPercent = (index / (earningsData.length - 1)) * 100;
                      const yPercent = ((data.amount / maxEarnings) * 70);
                      return (
                        <Box
                          key={index}
                          sx={{
                            position: 'absolute',
                            left: `${xPercent}%`,
                            bottom: `${yPercent}%`,
                            transform: 'translate(-50%, 50%)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 1,
                            '&:hover .tooltip': {
                              opacity: 1
                            },
                            '&:hover .dot': {
                              transform: 'scale(1.3)',
                              boxShadow: '0 4px 12px rgba(15, 39, 64, 0.5)',
                            }
                          }}
                        >
                          <Box
                            className="dot"
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              bgcolor: COLORS.navy,
                              border: `3px solid ${COLORS.white}`,
                              boxShadow: '0 2px 8px rgba(15, 39, 64, 0.3)',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                            }}
                          />
                          <Box
                            className="tooltip"
                            sx={{
                              position: 'absolute',
                              top: -40,
                              bgcolor: COLORS.navy,
                              color: COLORS.white,
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 1,
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              whiteSpace: 'nowrap',
                              opacity: 0,
                              transition: 'opacity 0.2s ease',
                              pointerEvents: 'none',
                              '&::after': {
                                content: '""',
                                position: 'absolute',
                                bottom: -4,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: 0,
                                height: 0,
                                borderLeft: '4px solid transparent',
                                borderRight: '4px solid transparent',
                                borderTop: `4px solid ${COLORS.navy}`
                              }
                            }}
                          >
                            ${data.amount}
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, px: 2 }}>
                  {earningsData.map((data, index) => (
                    <Typography key={index} sx={{ fontSize: '0.8125rem', fontWeight: 600, color: COLORS.slate }}>
                      {data.month}
                    </Typography>
                  ))}
                </Box>
              </Box>
            </Paper>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, borderLeft: `4px solid ${COLORS.gold}` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Award size={24} color={COLORS.gold} />
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.slate }}>
                      Reputation
                    </Typography>
                  </Box>
                  <Typography sx={{ fontFamily: 'monospace', fontSize: '2rem', fontWeight: 700, color: COLORS.navy }}>
                    {stats.reputation}★
                  </Typography>
                  <Typography sx={{ fontSize: '0.875rem', color: COLORS.slate }}>
                    {stats.completedTasks} tasks completed
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, borderLeft: `4px solid ${COLORS.green}` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Coins size={24} color={COLORS.green} />
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.slate }}>
                      Total Earnings
                    </Typography>
                  </Box>
                  <Typography sx={{ fontFamily: 'monospace', fontSize: '2rem', fontWeight: 700, color: COLORS.navy }}>
                    ${stats.earnings.toLocaleString()}
                  </Typography>
                  <Typography sx={{ fontSize: '0.875rem', color: COLORS.slate }}>
                    Lifetime earnings
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, borderLeft: `4px solid ${COLORS.blue}` }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.slate, mb: 1 }}>
                    JCT Staked
                  </Typography>
                  <Typography sx={{ fontFamily: 'monospace', fontSize: '2rem', fontWeight: 700, color: COLORS.navy }}>
                    {stats.jctStaked}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, borderLeft: `4px solid ${COLORS.gold}` }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.slate, mb: 1 }}>
                    JCT Available
                  </Typography>
                  <Typography sx={{ fontFamily: 'monospace', fontSize: '2rem', fontWeight: 700, color: COLORS.navy }}>
                    {stats.jctAvailable}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, borderLeft: `4px solid ${COLORS.green}` }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.slate, mb: 1 }}>
                    Success Rate
                  </Typography>
                  <Typography sx={{ fontFamily: 'monospace', fontSize: '2rem', fontWeight: 700, color: COLORS.navy }}>
                    98.5%
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );

      case 'configuration':
        return (
          <Box>
            <Typography sx={{ fontFamily: '"Playfair Display", serif', fontSize: '2rem', fontWeight: 700, color: COLORS.navy, mb: 1 }}>
              Configuration
            </Typography>
            <Typography sx={{ fontSize: '0.9375rem', color: COLORS.slate, mb: 4 }}>
              Configure your worker node and download the container image
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 4 }}>
                  <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: COLORS.navy, mb: 3 }}>
                    Worker Configuration
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.slate, mb: 1 }}>
                        Operating System
                      </Typography>
                      <Select
                        fullWidth
                        value={selectedOS}
                        onChange={(e) => setSelectedOS(e.target.value)}
                        size="small"
                      >
                        <MenuItem value="linux">Linux</MenuItem>
                        <MenuItem value="mac">Mac</MenuItem>
                        <MenuItem value="windows">Windows</MenuItem>
                      </Select>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.slate, mb: 1 }}>
                        Rendering Software
                      </Typography>
                      <Select
                        fullWidth
                        value={selectedSoftware}
                        onChange={(e) => setSelectedSoftware(e.target.value)}
                        size="small"
                      >
                        <MenuItem value="blender">Blender</MenuItem>
                        <MenuItem value="v-ray">V-Ray</MenuItem>
                        <MenuItem value="lumion">Lumion</MenuItem>
                        <MenuItem value="unreal">Unreal</MenuItem>
                      </Select>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.slate, mb: 1 }}>
                        Minimum Reward (USD)
                      </Typography>
                      <TextField
                        fullWidth
                        value={minReward}
                        onChange={(e) => setMinReward(e.target.value)}
                        size="small"
                        type="number"
                      />
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 4 }} />

                  <Box sx={{ mb: 3 }}>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: COLORS.navy, mb: 2 }}>
                      Docker Image
                    </Typography>
                    <Box sx={{ p: 2, bgcolor: '#F8F9FA', borderRadius: 1, border: '1px solid #E5E7EB' }}>
                      <Typography sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                        {generateDockerImageName()}
                      </Typography>
                    </Box>
                  </Box>

                  <Button
                    fullWidth
                    startIcon={walletConnected ? undefined : <Wallet size={20} />}
                    onClick={() => setWalletConnected(!walletConnected)}
                    sx={{
                      bgcolor: walletConnected ? COLORS.green : COLORS.navy,
                      color: COLORS.white,
                      py: 1.5,
                      textTransform: 'none',
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      '&:hover': { bgcolor: walletConnected ? '#059669' : '#0a1628' }
                    }}
                  >
                    {walletConnected ? 'Submit Configuration' : 'Connect Wallet'}
                  </Button>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 4, bgcolor: '#F8F9FA' }}>
                  <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: COLORS.navy, mb: 3 }}>
                    Container Instructions
                  </Typography>

                  <Typography sx={{ fontSize: '0.875rem', color: COLORS.slate, mb: 2 }}>
                    Run the following command to start your worker node:
                  </Typography>

                  <Box sx={{ p: 3, bgcolor: '#1e293b', borderRadius: 1, overflow: 'auto' }}>
                    <Typography sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#e2e8f0', whiteSpace: 'pre' }}>
{`docker run -it --rm \\
  --name janction-video-worker \\
  -e WS_RPC_URL="YourRPCProvider" \\
  -e PRIVATE_KEY="YourPrivateKey" \\
  -e VIDEO_RENDER_TASKS_ADDRESS="0x10d63b86Bc223f097E2E689651C3499c84FC8681" \\
  -e MODULE_MANAGER_ADDRESS="0x8257062618E59a0FB716D1cB31441625Ef6E1Bd7" \\
  -e WORKER_REGISTRY_ADDRESS="0xb25E0BC520F9e9AD0B9e153115c322cC319368d1" \\
  -e CONFIG_ID="0x3100000000000000000000000000000000000000000000000000000000000000" \\
  -v $(pwd)/worker-data:/data \\
  ${generateDockerImageName()}`}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 4 }}>
                  <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: COLORS.navy, mb: 3 }}>
                    Worker Status
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3, bgcolor: `${COLORS.gold}15`, borderRadius: 1, border: `2px solid ${COLORS.gold}` }}>
                    <Typography sx={{ fontSize: '2rem' }}>
                      ⏳
                    </Typography>
                    <Box>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.slate, mb: 0.5 }}>
                        Current Status
                      </Typography>
                      <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: COLORS.gold }}>
                        Active and Waiting for Task
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );

      case 'reputation':
        return (
          <Box>
            <Typography sx={{ fontFamily: '"Playfair Display", serif', fontSize: '2rem', fontWeight: 700, color: COLORS.navy, mb: 1 }}>
              Reputation
            </Typography>
            <Typography sx={{ fontSize: '0.9375rem', color: COLORS.slate, mb: 4 }}>
              Track your reputation score and performance metrics
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 4, textAlign: 'center', borderTop: `4px solid ${COLORS.gold}` }}>
                  <Star size={48} color={COLORS.gold} fill={COLORS.gold} style={{ marginBottom: '16px' }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.slate, mb: 2 }}>
                    Overall Reputation
                  </Typography>
                  <Typography sx={{ fontFamily: 'monospace', fontSize: '3rem', fontWeight: 700, color: COLORS.navy, mb: 1 }}>
                    {stats.reputation}
                  </Typography>
                  <Typography sx={{ fontSize: '0.875rem', color: COLORS.slate }}>
                    Top 5% of workers
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 4 }}>
                  <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: COLORS.navy, mb: 3 }}>
                    Performance Breakdown
                  </Typography>

                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                        Task Completion Rate
                      </Typography>
                      <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: COLORS.green }}>
                        98.5%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={98.5}
                      sx={{
                        height: 8,
                        borderRadius: 1,
                        bgcolor: '#E5E7EB',
                        '& .MuiLinearProgress-bar': { bgcolor: COLORS.green }
                      }}
                    />
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                        On-Time Delivery
                      </Typography>
                      <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: COLORS.green }}>
                        96.2%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={96.2}
                      sx={{
                        height: 8,
                        borderRadius: 1,
                        bgcolor: '#E5E7EB',
                        '& .MuiLinearProgress-bar': { bgcolor: COLORS.green }
                      }}
                    />
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                        Quality Score
                      </Typography>
                      <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: COLORS.gold }}>
                        94.8%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={94.8}
                      sx={{
                        height: 8,
                        borderRadius: 1,
                        bgcolor: '#E5E7EB',
                        '& .MuiLinearProgress-bar': { bgcolor: COLORS.gold }
                      }}
                    />
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                        Network Uptime
                      </Typography>
                      <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: COLORS.green }}>
                        99.8%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={99.8}
                      sx={{
                        height: 8,
                        borderRadius: 1,
                        bgcolor: '#E5E7EB',
                        '& .MuiLinearProgress-bar': { bgcolor: COLORS.green }
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 4 }}>
                  <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: COLORS.navy, mb: 3 }}>
                    Recent Task History
                  </Typography>

                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#F8F9FA' }}>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Task ID</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Frames</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Earnings</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rating</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {[
                          { date: '2024-01-15', id: 'TASK-4521', frames: '240', status: 'completed', earnings: 125, rating: 4.9 },
                          { date: '2024-01-14', id: 'TASK-4498', frames: '180', status: 'completed', earnings: 95, rating: 5.0 },
                          { date: '2024-01-13', id: 'TASK-4475', frames: '300', status: 'completed', earnings: 150, rating: 4.8 },
                          { date: '2024-01-12', id: 'TASK-4462', frames: '120', status: 'completed', earnings: 68, rating: 5.0 },
                          { date: '2024-01-11', id: 'TASK-4441', frames: '200', status: 'completed', earnings: 110, rating: 4.9 }
                        ].map((task, idx) => (
                          <TableRow key={idx} sx={{ '&:hover': { bgcolor: '#F8F9FA' } }}>
                            <TableCell>
                              <Typography sx={{ fontSize: '0.875rem' }}>{task.date}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography sx={{ fontFamily: 'monospace', fontSize: '0.875rem', fontWeight: 600 }}>
                                {task.id}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography sx={{ fontSize: '0.875rem', color: COLORS.slate }}>
                                {task.frames}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CheckCircle size={16} color={COLORS.green} />
                                <Typography sx={{ fontSize: '0.875rem', color: COLORS.green, fontWeight: 600, textTransform: 'capitalize' }}>
                                  {task.status}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.875rem' }}>
                                ${task.earnings}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Star size={14} color={COLORS.gold} fill={COLORS.gold} />
                                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                                  {task.rating}
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );

      case 'earnings':
        return (
          <Box>
            <Typography sx={{ fontFamily: '"Playfair Display", serif', fontSize: '2rem', fontWeight: 700, color: COLORS.navy, mb: 1 }}>
              Earnings
            </Typography>
            <Typography sx={{ fontSize: '0.9375rem', color: COLORS.slate, mb: 4 }}>
              Track your earnings and token balance
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 4 }}>
                  <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: COLORS.navy, mb: 3 }}>
                    Token Balance
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.slate, mb: 1 }}>
                      Staked JCT
                    </Typography>
                    <Typography sx={{ fontFamily: 'monospace', fontSize: '1.5rem', fontWeight: 700, color: COLORS.navy }}>
                      {stats.jctStaked} JCT
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.slate, mb: 1 }}>
                      Available JCT
                    </Typography>
                    <Typography sx={{ fontFamily: 'monospace', fontSize: '1.5rem', fontWeight: 700, color: COLORS.navy }}>
                      {stats.jctAvailable} JCT
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 4 }}>
                  <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: COLORS.navy, mb: 3 }}>
                    Earnings Summary
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.slate, mb: 1 }}>
                      Total Earned
                    </Typography>
                    <Typography sx={{ fontFamily: 'monospace', fontSize: '1.5rem', fontWeight: 700, color: COLORS.navy }}>
                      ${stats.earnings.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.slate, mb: 1 }}>
                      Tasks Completed
                    </Typography>
                    <Typography sx={{ fontFamily: 'monospace', fontSize: '1.5rem', fontWeight: 700, color: COLORS.navy }}>
                      {stats.completedTasks}
                    </Typography>
                  </Box>
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
                      value={stats.email}
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
    <DashboardLayout
      userRole="worker"
      activeMenuItem={activeMenuItem}
      onMenuItemClick={setActiveMenuItem}
      onRoleSwitch={onRoleSwitch}
      onLogout={onLogout}
      menuItems={menuItems}
    >
      {renderContent()}
    </DashboardLayout>
  );
}
