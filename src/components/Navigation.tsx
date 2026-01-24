import { useState } from 'react';
import { AppBar, Toolbar, Box, Button, Avatar, Menu, MenuItem, Divider } from '@mui/material';
import { ChevronDown, LogOut, Settings } from 'lucide-react';
import { COLORS } from '../theme/theme';
import { mockUserProfile } from '../mockData';

interface NavigationProps {
  userRole: 'consumer' | 'worker';
  onRoleChange: (role: 'consumer' | 'worker') => void;
  onLogout: () => void;
}

export default function Navigation({ userRole, onRoleChange, onLogout }: NavigationProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const profile = userRole === 'consumer' ? mockUserProfile.consumer : mockUserProfile.worker;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRoleSwitch = (role: 'consumer' | 'worker') => {
    onRoleChange(role);
    handleClose();
  };

  const handleLogout = () => {
    handleClose();
    onLogout();
  };

  return (
    <AppBar position="sticky" sx={{ background: `linear-gradient(to right, ${COLORS.navy}, ${COLORS.navyLight})`, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 40, height: 40, bgcolor: COLORS.gold, borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: COLORS.navy, fontSize: '1.2rem' }}>J</Box>
          <Box sx={{ fontWeight: 700, fontSize: '1.1rem', color: COLORS.white, letterSpacing: '0.05em' }}>JANCTION</Box>
        </Box>

        <Box>
          <Button onClick={handleClick} endIcon={<ChevronDown size={18} />} sx={{ textTransform: 'none', color: COLORS.white, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar src={profile.avatar} sx={{ width: 32, height: 32, border: `2px solid ${COLORS.gold}` }} />
            <Box sx={{ textAlign: 'left' }}>
              <Box sx={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>{profile.name}</Box>
              <Box sx={{ fontSize: '0.625rem', opacity: 0.8 }}>{userRole === 'consumer' ? 'CONSUMER' : 'WORKER'}</Box>
            </Box>
          </Button>

          <Menu anchorEl={anchorEl} open={open} onClose={handleClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
            <MenuItem sx={{ fontSize: '0.875rem', fontWeight: 600, py: 1.5 }}>Switch to {userRole === 'consumer' ? 'Worker' : 'Consumer'}</MenuItem>
            <MenuItem onClick={() => handleRoleSwitch(userRole === 'consumer' ? 'worker' : 'consumer')} sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', bgcolor: COLORS.gold, color: COLORS.navy }}>Switch Role</MenuItem>
            <Divider />
            <MenuItem sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', gap: 1 }}><Settings size={16} />Settings</MenuItem>
            <MenuItem onClick={handleLogout} sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: COLORS.red, display: 'flex', gap: 1 }}><LogOut size={16} />Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
