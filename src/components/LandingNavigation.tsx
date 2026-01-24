import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { Network } from 'lucide-react';
import { COLORS } from '../theme/theme';

interface LandingNavigationProps {
  onLaunchApp: () => void;
}

export default function LandingNavigation({ onLaunchApp }: LandingNavigationProps) {
  return (
    <AppBar position="fixed" elevation={0} sx={{ bgcolor: COLORS.white, borderBottom: `1px solid ${COLORS.border}` }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', minHeight: { xs: 70, md: 80 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Network size={36} color={COLORS.navy} strokeWidth={2} />
            <Typography sx={{ fontFamily: '"Playfair Display", serif', fontSize: '1.75rem', fontWeight: 700, color: COLORS.navy, letterSpacing: '-0.02em' }}>
              Janction
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Button sx={{ color: COLORS.slate, fontWeight: 500, textTransform: 'none', fontSize: '0.9375rem', '&:hover': { color: COLORS.navy } }}>
              About
            </Button>
            <Button sx={{ color: COLORS.slate, fontWeight: 500, textTransform: 'none', fontSize: '0.9375rem', '&:hover': { color: COLORS.navy } }}>
              Documentation
            </Button>
            <Button
              onClick={onLaunchApp}
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
              Launch App
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
