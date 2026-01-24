// Common reusable styles for MUI sx prop
import { COLORS } from '../theme/theme';

export const styles = {
  // Page container
  pageContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
  },

  // Page header
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderBottom: `1px solid ${COLORS.border}`,
    pb: 2,
  },

  // Page title
  pageTitle: {
    fontFamily: '"Playfair Display", serif',
    fontWeight: 700,
    fontSize: '1.5rem',
    color: COLORS.navy,
  },

  // Page subtitle
  pageSubtitle: {
    fontSize: '0.75rem',
    color: COLORS.slate,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    mt: 0.5,
  },

  // Card with left accent
  cardWithAccent: (color = COLORS.gold) => ({
    borderLeft: `4px solid ${color}`,
  }),

  // Gradient header (navy)
  gradientHeaderNavy: {
    background: `linear-gradient(to right, ${COLORS.navy}, ${COLORS.navyLight})`,
    p: 2,
    borderBottom: `1px solid ${COLORS.border}`,
  },

  // Gradient header (gold)
  gradientHeaderGold: {
    background: `linear-gradient(to right, ${COLORS.gold}, ${COLORS.goldLight})`,
    p: 2,
    borderBottom: `1px solid ${COLORS.border}`,
  },

  // Label text
  labelText: {
    fontSize: '0.625rem',
    fontWeight: 700,
    color: COLORS.slate,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    mb: 1,
  },

  // Mono text (for numbers, codes)
  monoText: {
    fontFamily: 'monospace',
  },

  // Value display (large numbers)
  valueDisplay: {
    fontFamily: 'monospace',
    fontWeight: 500,
    color: COLORS.navy,
  },

  // Status badge base
  statusBadge: {
    px: 1.5,
    py: 0.5,
    borderRadius: '2px',
    fontSize: '0.625rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },

  // Status badge variants
  badgeSuccess: {
    bgcolor: 'rgba(15, 109, 67, 0.1)',
    color: COLORS.green,
    border: '1px solid rgba(15, 109, 67, 0.2)',
  },

  badgeWarning: {
    bgcolor: 'rgba(180, 83, 9, 0.1)',
    color: COLORS.amber,
    border: '1px solid rgba(180, 83, 9, 0.2)',
  },

  badgeError: {
    bgcolor: 'rgba(185, 28, 28, 0.1)',
    color: COLORS.red,
    border: '1px solid rgba(185, 28, 28, 0.2)',
  },

  badgeNeutral: {
    bgcolor: 'rgba(100, 116, 139, 0.1)',
    color: COLORS.slateLight,
    border: `1px solid ${COLORS.border}`,
  },

  badgeBlue: {
    bgcolor: 'rgba(10, 35, 66, 0.05)',
    color: COLORS.navy,
    border: '1px solid rgba(10, 35, 66, 0.1)',
  },

  badgeGold: {
    bgcolor: 'rgba(197, 160, 101, 0.1)',
    color: COLORS.goldDark,
    border: '1px solid rgba(197, 160, 101, 0.3)',
  },

  // Primary button
  primaryButton: {
    bgcolor: COLORS.navy,
    color: 'white',
    fontWeight: 700,
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    px: 3,
    py: 1.5,
    borderRadius: '2px',
    '&:hover': {
      bgcolor: COLORS.navyLight,
    },
  },

  // Secondary button
  secondaryButton: {
    bgcolor: COLORS.gold,
    color: COLORS.navy,
    fontWeight: 700,
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    px: 3,
    py: 1.5,
    borderRadius: '2px',
    '&:hover': {
      bgcolor: COLORS.goldDark,
    },
  },

  // Outlined button
  outlinedButton: {
    border: `1px solid ${COLORS.border}`,
    bgcolor: 'white',
    color: COLORS.navy,
    fontWeight: 700,
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    px: 3,
    py: 1.5,
    borderRadius: '2px',
    '&:hover': {
      bgcolor: COLORS.background,
      borderColor: COLORS.navy,
    },
  },

  // Input field
  inputField: {
    '& .MuiOutlinedInput-root': {
      borderRadius: '2px',
      '& fieldset': {
        borderColor: COLORS.border,
      },
      '&:hover fieldset': {
        borderColor: COLORS.slate,
      },
      '&.Mui-focused fieldset': {
        borderColor: COLORS.gold,
      },
    },
  },

  // Table row hover
  tableRowHover: {
    '&:hover': {
      bgcolor: COLORS.background,
    },
    cursor: 'pointer',
  },

  // Card hover effect
  cardHover: {
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    '&:hover': {
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      borderColor: COLORS.gold,
    },
  },

  // Flex center
  flexCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Flex between
  flexBetween: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // Hidden on mobile, visible on desktop
  hideOnMobile: {
    display: { xs: 'none', md: 'flex' },
  },

  // Visible on mobile, hidden on desktop
  showOnMobile: {
    display: { xs: 'flex', md: 'none' },
  },
};

export default styles;
