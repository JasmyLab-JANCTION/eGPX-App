import { Box, Container, Grid, Paper, Typography, Button, TextField } from '@mui/material';
import { ArrowRight, Cpu, Zap, TrendingUp, Users, Network, Music, Video, Mail } from 'lucide-react';
import { COLORS } from '../theme/theme';
import { mockBlockchainStats } from '../mockData';
import LandingNavigation from '../components/LandingNavigation';

interface LandingProps {
  onLaunchApp: () => void;
}

export default function Landing({ onLaunchApp }: LandingProps) {
  const stats = [
    { icon: Users, label: 'Active Workers', value: mockBlockchainStats.activeWorkers.toLocaleString(), color: COLORS.gold },
    { icon: Zap, label: 'Tasks Completed', value: mockBlockchainStats.totalTasksCompleted.toLocaleString(), color: COLORS.green },
    { icon: Cpu, label: 'Frames Rendered', value: `${(mockBlockchainStats.framesRendered / 1000000).toFixed(1)}M`, color: COLORS.blue },
    { icon: TrendingUp, label: 'Avg Frame Time', value: `${mockBlockchainStats.avgFrameRenderTime}s`, color: COLORS.gold },
  ];

  return (
    <Box>
      <LandingNavigation onLaunchApp={onLaunchApp} />

      <Box sx={{ pt: { xs: 10, md: 12 }, background: `linear-gradient(135deg, ${COLORS.navy} 0%, ${COLORS.navyLight} 100%)`, color: COLORS.white, pb: { xs: 6, md: 12 } }}>
        <Container maxWidth="lg">
          <Typography sx={{ fontFamily: '"Playfair Display", serif', fontSize: { xs: '2.5rem', md: '4rem' }, fontWeight: 700, mb: 2, lineHeight: 1.2 }}>
            Distributed Rendering Powered by Web3
          </Typography>

          <Typography sx={{ fontSize: { xs: '1rem', md: '1.25rem' }, maxWidth: '600px', opacity: 0.95, lineHeight: 1.6 }}>
            Connect your render jobs to a global network of computing power. Faster rendering, better prices, complete transparency.
          </Typography>
        </Container>
      </Box>

      <Box sx={{ bgcolor: '#F8F9FA', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 4, md: 8 }}>
            <Grid item xs={12} md={5}>
              <Box sx={{ position: 'sticky', top: 100 }}>
                <Box sx={{ width: 60, height: 3, bgcolor: COLORS.navy, mb: 4 }} />
                <Typography sx={{ fontFamily: '"Playfair Display", serif', fontSize: { xs: '2.5rem', md: '3.5rem' }, fontWeight: 700, mb: 3, color: COLORS.navy, lineHeight: 1.1 }}>
                  How It Works
                </Typography>
                <Typography sx={{ fontSize: '1.0625rem', color: COLORS.slate, lineHeight: 1.7, mb: 4 }}>
                  Blockchain transparency meets competitive rendering. Every task is verified on-chain.
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={7}>
              <Box sx={{ position: 'relative', pl: { xs: 0, md: 4 } }}>
                <Box sx={{ position: 'absolute', left: { xs: 18, md: 82 }, top: 40, bottom: 40, width: 2, bgcolor: '#E5E7EB' }} />

                {[
                  { step: '01', title: 'Task Submission', desc: 'Video rendering task is submitted to the blockchain with detailed specifications and reward amounts. Capital is deployed only under signed terms.' },
                  { step: '02', title: 'Competitive Racing', desc: 'Matching workers compete to be the fastest to render all frames. Speed and efficiency determine the winner in this decentralized marketplace.' },
                  { step: '03', title: 'Solution & Validation', desc: 'Winner submits the complete solution while other workers submit validations to ensure quality. Multi-party verification keeps standards high.' },
                  { step: '04', title: 'Verification & Rewards', desc: 'Blockchain verifies the completed task and automatically distributes rewards to participants. Every transaction is transparent and verifiable.' }
                ].map((item, idx) => (
                  <Box key={idx} sx={{ position: 'relative', mb: idx === 3 ? 0 : 8, pl: { xs: 7, md: 0 } }}>
                    <Box sx={{ position: 'absolute', left: { xs: 10, md: 74 }, top: 8, width: 16, height: 16, borderRadius: '50%', border: `3px solid ${idx === 1 ? COLORS.gold : COLORS.navy}`, bgcolor: idx === 1 ? COLORS.gold : COLORS.white, zIndex: 1 }} />

                    <Box sx={{ pl: { xs: 0, md: 12 } }}>
                      <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: COLORS.slate, mb: 2 }}>
                        STEP {item.step}
                      </Typography>
                      <Typography sx={{ fontFamily: '"Playfair Display", serif', fontSize: { xs: '1.75rem', md: '2rem' }, fontWeight: 700, mb: 2, color: COLORS.navy, lineHeight: 1.2 }}>
                        {item.title}
                      </Typography>
                      <Typography sx={{ fontSize: '1rem', color: COLORS.slate, lineHeight: 1.7 }}>
                        {item.desc}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography sx={{ fontFamily: '"Playfair Display", serif', fontSize: '1.5rem', fontWeight: 700, mb: 4, color: COLORS.navy }}>
          Network Performance
        </Typography>

        <Grid container spacing={3}>
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Grid item xs={12} key={idx}>
                <Paper sx={{ p: 4, borderLeft: `4px solid ${stat.color}`, background: `linear-gradient(135deg, ${COLORS.white} 0%, rgba(245,247,250,0.5) 100%)`, transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.08)', transform: 'translateY(-2px)' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Box sx={{ p: 2, borderRadius: '2px', bgcolor: `rgba(${parseInt(stat.color.slice(1, 3), 16)},${parseInt(stat.color.slice(3, 5), 16)},${parseInt(stat.color.slice(5, 7), 16)},0.1)` }}>
                        <Icon size={32} color={stat.color} />
                      </Box>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.slate }}>
                        {stat.label}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontFamily: 'monospace', fontSize: '2.5rem', fontWeight: 700, color: COLORS.navy }}>
                      {stat.value}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Container>

      <Box sx={{ bgcolor: COLORS.white, py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography sx={{ fontSize: { xs: '0.75rem', md: '0.8125rem' }, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: COLORS.gold, mb: 2 }}>
              Coming Soon
            </Typography>
            <Typography sx={{ fontFamily: '"Playfair Display", serif', fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 700, mb: 3, color: COLORS.navy, lineHeight: 1.2 }}>
              Expanding the Network
            </Typography>
            <Typography sx={{ fontSize: '1.0625rem', color: COLORS.slate, lineHeight: 1.7, maxWidth: '800px', mx: 'auto' }}>
              Janction is currently building new modules to allow more distributed tasks on chain
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 5, height: '100%', borderTop: `4px solid ${COLORS.blue}`, transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 12px 32px rgba(0,0,0,0.12)', transform: 'translateY(-4px)' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box sx={{ p: 2, borderRadius: 1, bgcolor: `${COLORS.blue}15` }}>
                    <Music size={32} color={COLORS.blue} strokeWidth={2} />
                  </Box>
                  <Typography sx={{ fontFamily: '"Playfair Display", serif', fontSize: '1.75rem', fontWeight: 700, color: COLORS.navy }}>
                    Audio Steam
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: '1rem', color: COLORS.slate, lineHeight: 1.7 }}>
                  Separate instruments out of any audio file using distributed processing power. AI-powered stem separation for music producers and audio engineers.
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 5, height: '100%', borderTop: `4px solid ${COLORS.green}`, transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 12px 32px rgba(0,0,0,0.12)', transform: 'translateY(-4px)' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box sx={{ p: 2, borderRadius: 1, bgcolor: `${COLORS.green}15` }}>
                    <Video size={32} color={COLORS.green} strokeWidth={2} />
                  </Box>
                  <Typography sx={{ fontFamily: '"Playfair Display", serif', fontSize: '1.75rem', fontWeight: 700, color: COLORS.navy }}>
                    Video Upscale
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: '1rem', color: COLORS.slate, lineHeight: 1.7 }}>
                  Increase low quality resolution videos to stunning HD and 4K. Leverage distributed GPU power for AI-enhanced video upscaling at scale.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box sx={{ bgcolor: '#F8F9FA', py: { xs: 8, md: 10 } }}>
        <Container maxWidth="md">
          <Paper sx={{ p: { xs: 4, md: 6 }, textAlign: 'center', borderTop: `4px solid ${COLORS.gold}` }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Box sx={{ p: 2, borderRadius: '50%', bgcolor: `${COLORS.gold}15` }}>
                <Mail size={32} color={COLORS.gold} strokeWidth={2} />
              </Box>
            </Box>
            <Typography sx={{ fontFamily: '"Playfair Display", serif', fontSize: { xs: '1.75rem', md: '2.25rem' }, fontWeight: 700, color: COLORS.navy, mb: 2 }}>
              Stay Updated with Janction
            </Typography>
            <Typography sx={{ fontSize: '1rem', color: COLORS.slate, lineHeight: 1.7, mb: 4, maxWidth: '500px', mx: 'auto' }}>
              Get the latest news about network upgrades, new modules, and exclusive updates delivered to your inbox.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, maxWidth: '500px', mx: 'auto', flexDirection: { xs: 'column', sm: 'row' } }}>
              <TextField
                fullWidth
                placeholder="Enter your email address"
                size="medium"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: COLORS.white,
                    '&:hover fieldset': { borderColor: COLORS.navy },
                    '&.Mui-focused fieldset': { borderColor: COLORS.navy }
                  }
                }}
              />
              <Button
                sx={{
                  bgcolor: COLORS.navy,
                  color: COLORS.white,
                  px: 4,
                  py: 1.5,
                  textTransform: 'none',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  '&:hover': { bgcolor: '#0a1628' }
                }}
              >
                Subscribe
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>

      <Box sx={{ bgcolor: COLORS.navy, color: COLORS.white, py: 6 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Network size={32} color={COLORS.gold} strokeWidth={2} />
              <Typography sx={{ fontFamily: '"Playfair Display", serif', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
                Janction
              </Typography>
            </Box>

            <Typography sx={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)' }}>
              © {new Date().getFullYear()} Janction. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
