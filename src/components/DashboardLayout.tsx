import { ReactNode, useState } from 'react';
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Typography, Avatar, IconButton, Badge, Menu, MenuItem, Divider } from '@mui/material';
import { Network, Bell, Settings, LogOut, ListChecks, BarChart3, User, CheckCircle2, Users, Shield } from 'lucide-react';
import { COLORS } from '../theme/theme';
import { mockUserProfile } from '../mockData';
import {useFirebaseAuth} from "../hooks/useFirebaseAuth.js"

interface MenuItemType {
  id: string;
  label: string;
  icon: any;
}

interface DashboardLayoutProps {
  children: ReactNode;
  userRole: 'consumer' | 'worker';
  activeMenuItem: string;
  onMenuItemClick: (itemId: string) => void;
  onRoleSwitch: () => void;
  onLogout: () => void;
  menuItems: MenuItemType[];
}

export default function DashboardLayout({
  children,
  userRole,
  activeMenuItem,
  onMenuItemClick,
  onRoleSwitch,
  onLogout,
  menuItems
}: DashboardLayoutProps) {
  const {user}= useFirebaseAuth()
  console.log(user)
  const profile = user;
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);

  const consumerNotifications = [
    {
      icon: CheckCircle2,
      text: 'Congrats. Your Task 22333 has been completed in 48 hours.',
      color: COLORS.green
    },
    {
      icon: Users,
      text: 'This week 10 new workers have join the network. View current stats',
      color: COLORS.blue
    },
    {
      icon: Shield,
      text: 'Always keep your account secure. Try adding 2FA by going to Settings',
      color: COLORS.gold
    }
  ];

  const workerNotifications = [
    {
      icon: CheckCircle2,
      text: 'You have been awarded $123 for your work in tasks 22344. Congratulations',
      color: COLORS.green
    },
    {
      icon: Settings,
      text: 'There is a new Docker image available to render with Unreal Engine. Configure it and increase your chances of winning more tasks.',
      color: COLORS.blue
    },
    {
      icon: Shield,
      text: 'Always keep your account secure. Try adding 2FA by going to Settings',
      color: COLORS.gold
    }
  ];

  const notifications = userRole === 'consumer' ? consumerNotifications : workerNotifications;

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F5F7FA' }}>
      <Box sx={{ width: 270, bgcolor: COLORS.navy, display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', zIndex: 1200 }}>
        <Box sx={{ p: 3, borderBottom: `1px solid rgba(255,255,255,0.1)` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 36, height: 36, bgcolor: COLORS.gold, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Network size={20} color={COLORS.navy} strokeWidth={2.5} />
            </Box>
            <Typography sx={{ fontFamily: '"Playfair Display", serif', fontSize: '1.5rem', fontWeight: 700, color: COLORS.white, letterSpacing: '0.02em' }}>
              JANCTION
            </Typography>
          </Box>
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto', py: 3 }}>
          <Typography sx={{ px: 3, mb: 2, fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>
            Main Navigation
          </Typography>

          <List sx={{ px: 2 }}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenuItem === item.id;
              return (
                <ListItemButton
                  key={item.id}
                  onClick={() => onMenuItemClick(item.id)}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    bgcolor: isActive ? 'rgba(197, 160, 101, 0.15)' : 'transparent',
                    color: isActive ? COLORS.gold : 'rgba(255,255,255,0.7)',
                    '&:hover': {
                      bgcolor: isActive ? 'rgba(197, 160, 101, 0.2)' : 'rgba(255,255,255,0.05)',
                      color: COLORS.white
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                    <Icon size={20} />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 600 : 500
                    }}
                  />
                </ListItemButton>
              );
            })}
          </List>
        </Box>

        <Box sx={{ p: 2, borderTop: `1px solid rgba(255,255,255,0.1)` }}>
          <Typography sx={{ px: 1, mb: 1.5, fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>
            Role Switcher
          </Typography>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Box
              onClick={() => userRole !== 'consumer' && onRoleSwitch()}
              sx={{
                flex: 1,
                py: 1.25,
                px: 2,
                textAlign: 'center',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                bgcolor: userRole === 'consumer' ? COLORS.gold : 'rgba(255,255,255,0.1)',
                color: userRole === 'consumer' ? COLORS.navy : 'rgba(255,255,255,0.6)',
                borderRadius: 1,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: userRole === 'consumer' ? COLORS.gold : 'rgba(255,255,255,0.15)',
                }
              }}
            >
              Consumer
            </Box>
            <Box
              onClick={() => userRole !== 'worker' && onRoleSwitch()}
              sx={{
                flex: 1,
                py: 1.25,
                px: 2,
                textAlign: 'center',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                bgcolor: userRole === 'worker' ? COLORS.gold : 'rgba(255,255,255,0.1)',
                color: userRole === 'worker' ? COLORS.navy : 'rgba(255,255,255,0.6)',
                borderRadius: 1,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: userRole === 'worker' ? COLORS.gold : 'rgba(255,255,255,0.15)',
                }
              }}
            >
              Worker
            </Box>
          </Box>
        </Box>
      </Box>

      <Box sx={{ flex: 1, ml: '270px', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ bgcolor: COLORS.white, borderBottom: `1px solid ${COLORS.border}`, px: 4, py: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLORS.green }} />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: COLORS.slate }}>
              System Operational
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: COLORS.slate, ml: 2 }}>
              v1.2 INSTITUTIONAL
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <IconButton onClick={handleNotificationClick} sx={{ color: COLORS.slate }}>
              <Badge badgeContent={3} color="error">
                <Bell size={20} />
              </Badge>
            </IconButton>

            <Menu
              anchorEl={notificationAnchor}
              open={Boolean(notificationAnchor)}
              onClose={handleNotificationClose}
              PaperProps={{
                sx: {
                  width: 400,
                  mt: 1,
                  maxHeight: 500
                }
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <Box sx={{ p: 2, borderBottom: `1px solid ${COLORS.border}` }}>
                <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: COLORS.navy }}>
                  Notifications
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: COLORS.slate, mt: 0.5 }}>
                  You have {notifications.length} new notifications
                </Typography>
              </Box>

              {notifications.map((notification, index) => {
                const NotificationIcon = notification.icon;
                return (
                  <Box key={index}>
                    <MenuItem
                      onClick={handleNotificationClose}
                      sx={{
                        py: 2,
                        px: 2.5,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 2,
                        whiteSpace: 'normal',
                        '&:hover': { bgcolor: '#F8F9FA' }
                      }}
                    >
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: `${notification.color}15`,
                          flexShrink: 0
                        }}
                      >
                        <NotificationIcon size={18} color={notification.color} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontSize: '0.875rem', color: COLORS.navy, lineHeight: 1.5 }}>
                          {notification.text}
                        </Typography>
                      </Box>
                    </MenuItem>
                    {index < notifications.length - 1 && <Divider />}
                  </Box>
                );
              })}
            </Menu>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: COLORS.navy }}>
                  {profile.displayName}
                </Typography>
                <Typography sx={{ fontSize: '0.6875rem', color: COLORS.slate }}>
                  {profile.email}
                </Typography>
              </Box>
              <Avatar src={profile.photoURL} sx={{ width: 40, height: 40, border: `2px solid ${COLORS.border}` }} />
            </Box>
          </Box>
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto', p: 4 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
