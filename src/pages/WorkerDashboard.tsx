import { useState } from 'react';
import { Box, Typography, Paper, Grid, Switch, FormControlLabel, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, LinearProgress, Divider } from '@mui/material';
import { Award, Coins, Settings, BarChart3, Sliders, Star, TrendingUp, CheckCircle } from 'lucide-react';
import { COLORS } from '../theme/theme';
import { mockUserProfile, mockBlockchainStats } from '../mockData';
import DashboardLayout from '../components/DashboardLayout';
import WorkerConfigurationTab from '../components/WorkerConfigurationTab';
import WorkerReputationTab from '../components/WorkerReputationTab';

interface WorkerDashboardProps {
  onRoleSwitch: () => void;
  onLogout: () => void;
  user: object
}

export default function WorkerDashboard({ onRoleSwitch, onLogout, user }: WorkerDashboardProps) {
  const [activeMenuItem, setActiveMenuItem] = useState('dashboard');
  const [displayName, setDisplayName] = useState(mockUserProfile.name);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(mockUserProfile.twoFactorEnabled);
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
        return <WorkerConfigurationTab userId={(user as any).uid} />;

      case 'reputation':
        return <WorkerReputationTab userId={(user as any).uid} />;

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
      user={user}
    >
      {renderContent()}
    </DashboardLayout>
  );
}
