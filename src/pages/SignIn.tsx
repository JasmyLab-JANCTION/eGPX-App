import { Box, Container, Paper, Typography, TextField, Button, Divider } from '@mui/material';
import { Network, Mail } from 'lucide-react';
import { COLORS } from '../theme/theme';

interface SignInProps {
  onSignIn: () => void;
}

export default function SignIn({ onSignIn }: SignInProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSignIn();
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', bgcolor: '#F8F9FA' }}>
      <Container maxWidth="sm">
        <Paper sx={{ p: { xs: 4, md: 6 }, borderRadius: 2, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Network size={40} color={COLORS.navy} strokeWidth={2} />
              <Typography sx={{ fontFamily: '"Playfair Display", serif', fontSize: '2rem', fontWeight: 700, color: COLORS.navy, letterSpacing: '-0.02em' }}>
                Janction
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.875rem', color: COLORS.slate, fontWeight: 500 }}>
              Sign in to access your dashboard
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              variant="outlined"
              sx={{ mb: 2.5 }}
              required
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              variant="outlined"
              sx={{ mb: 3 }}
              required
            />

            <Button
              type="submit"
              fullWidth
              sx={{
                bgcolor: COLORS.navy,
                color: COLORS.white,
                py: 1.5,
                fontSize: '0.9375rem',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': { bgcolor: '#0a1628' },
                mb: 2
              }}
            >
              Sign In
            </Button>

            <Divider sx={{ my: 3 }}>
              <Typography sx={{ fontSize: '0.75rem', color: COLORS.slate, textTransform: 'uppercase', fontWeight: 600 }}>
                Or
              </Typography>
            </Divider>

            <Button
              fullWidth
              variant="outlined"
              startIcon={
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                  <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.335z"/>
                  <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
                </svg>
              }
              sx={{
                borderColor: COLORS.border,
                color: COLORS.navy,
                py: 1.5,
                fontSize: '0.9375rem',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': { borderColor: COLORS.navy, bgcolor: 'rgba(15, 23, 42, 0.05)' }
              }}
            >
              Continue with Google
            </Button>
          </form>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.8125rem', color: COLORS.slate }}>
              Don't have an account?{' '}
              <Box component="span" sx={{ color: COLORS.navy, fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                Sign up
              </Box>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
