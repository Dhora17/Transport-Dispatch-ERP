import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, List, Typography, Divider,
  IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Avatar, Menu, MenuItem, Tooltip, Badge, Stack, Chip, useTheme, useMediaQuery
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  LocalShipping as ShippingIcon,
  People as PeopleIcon,
  Assessment as ReportsIcon,
  BarChart as AnalyticsIcon,
  UploadFile as UploadIcon,
  Settings as SettingsIcon,
  ManageAccounts as UserMgmtIcon,
  Brightness4 as DarkIcon,
  Brightness7 as LightIcon,
  Logout as LogoutIcon,
  Business as BusinessIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  NotificationsNone as BellIcon,
  KeyboardArrowDown as ChevronDownIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../hooks';
import { logout, switchActiveRole } from '../features/authSlice';
import { UserRole } from '../types';

const DRAWER_WIDTH = 252;

interface LayoutProps {
  darkMode: boolean;
  toggleTheme: () => void;
}

const NAV_ITEMS = [
  { text: 'Dashboard',       path: '/dashboard',   icon: DashboardIcon,  group: 'main' },
  { text: 'Dispatch List',   path: '/dispatches',  icon: ShippingIcon,   group: 'main' },
  { text: 'Transporters',    path: '/transporters', icon: BusinessIcon,  group: 'main' },
  { text: 'Customers',       path: '/customers',   icon: PeopleIcon,     group: 'main' },
  { text: 'Reports',         path: '/reports',     icon: ReportsIcon,    group: 'analytics' },
  { text: 'Analytics',       path: '/analytics',   icon: AnalyticsIcon,  group: 'analytics' },
  { text: 'Excel & Entry',   path: '/upload',      icon: UploadIcon,     group: 'analytics' },
  { text: 'User Management', path: '/users',       icon: UserMgmtIcon,   group: 'admin', adminOnly: true },
  { text: 'Settings',        path: '/settings',    icon: SettingsIcon,   group: 'admin' },
];

const ROLE_COLORS: Record<UserRole, { bg: string; text: string; dot: string; gradient: string }> = {
  Admin:    { bg: 'rgba(99,102,241,0.12)',  text: '#818cf8', dot: '#6366f1', gradient: 'linear-gradient(135deg,#6366f1,#4f46e5)' },
  Manager:  { bg: 'rgba(6,182,212,0.12)',   text: '#22d3ee', dot: '#06b6d4', gradient: 'linear-gradient(135deg,#06b6d4,#0891b2)' },
  Operator: { bg: 'rgba(16,185,129,0.12)',  text: '#34d399', dot: '#10b981', gradient: 'linear-gradient(135deg,#10b981,#059669)' },
};

export const Layout: React.FC<LayoutProps> = ({ darkMode, toggleTheme }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, rolePermissions } = useAppSelector(state => state.auth);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);
  const [roleAnchor, setRoleAnchor] = useState<null | HTMLElement>(null);

  const isDark = theme.palette.mode === 'dark';
  const userPermissions = currentUser ? (rolePermissions[currentUser.role] || []) : [];
  const filteredNav = NAV_ITEMS.filter(item => {
    const moduleKey = item.path.replace('/', '') || 'dashboard';
    return userPermissions.includes(moduleKey);
  });

  const mainItems      = filteredNav.filter(i => i.group === 'main');
  const analyticsItems = filteredNav.filter(i => i.group === 'analytics');
  const adminItems     = filteredNav.filter(i => i.group === 'admin');

  const currentPage = filteredNav.find(item =>
    location.pathname === item.path ||
    (item.path !== '/' && location.pathname.startsWith(item.path))
  );

  const roleStyle = currentUser ? ROLE_COLORS[currentUser.role] : ROLE_COLORS['Operator'];

  const NavGroup = ({ label, items }: { label: string; items: typeof NAV_ITEMS }) => {
    if (!items.length) return null;
    return (
      <Box sx={{ mb: 1.5 }}>
        <Typography sx={{
          px: 2.5, pb: 1, pt: 2,
          fontSize: 10, fontWeight: 800, letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.32)',
        }}>
          {label}
        </Typography>
        {items.map(item => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          return (
            <ListItem key={item.text} disablePadding sx={{ px: 1.5, mb: 0.5 }}>
              <ListItemButton
                onClick={() => { navigate(item.path); setMobileOpen(false); }}
                sx={{
                  borderRadius: '6px',
                  py: 0.8,
                  px: 1.5,
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  backgroundColor: isActive
                    ? (isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)')
                    : 'transparent',
                  border: isActive
                    ? `1px solid ${isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.12)'}`
                    : '1px solid transparent',
                  '&:hover': {
                    backgroundColor: isActive
                      ? (isDark ? 'rgba(99,102,241,0.16)' : 'rgba(99,102,241,0.11)')
                      : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.035)'),
                  },
                  // Left accent indicator line
                  '&::before': isActive ? {
                    content: '""',
                    position: 'absolute',
                    left: 0, top: '15%', bottom: '15%',
                    width: 3, borderRadius: '0 3px 3px 0',
                    background: 'linear-gradient(180deg, #6366f1 0%, #06b6d4 100%)',
                    boxShadow: '0 0 8px rgba(99,102,241,0.6)',
                  } : {},
                }}
              >
                <ListItemIcon sx={{
                  minWidth: 32,
                  color: isActive ? '#6366f1' : (isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.42)'),
                }}>
                  <Icon sx={{ fontSize: 20 }} />
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  slotProps={{
                    primary: {
                      sx: {
                        fontSize: 13.5,
                        fontWeight: isActive ? 700 : 600,
                        color: isActive
                          ? (isDark ? '#c7d2fe' : '#4338ca')
                          : (isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.65)'),
                      },
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </Box>
    );
  };

  const sidebarContent = (
    <Box sx={{
      height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      background: isDark
        ? 'linear-gradient(180deg, #0b0f19 0%, #05080f 100%)'
        : '#ffffff',
      borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'}`,
    }}>

      {/* Logo area */}
      <Box sx={{
        px: 3, py: 2.5,
        display: 'flex', alignItems: 'center', gap: 1.5,
        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
      }}>
        <Box sx={{
          width: 38, height: 38, borderRadius: '12px', flexShrink: 0,
          background: 'linear-gradient(135deg,#6366f1,#06b6d4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
        }}>
          <ShippingIcon sx={{ color: '#fff', fontSize: 20 }} />
        </Box>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography sx={{
            fontWeight: 900, fontSize: 14.5, lineHeight: 1.1,
            color: isDark ? '#f8fafc' : '#0f172a',
            letterSpacing: '-0.02em',
          }}>
            SAMRAT ERP
          </Typography>
          <Typography sx={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.14em',
            color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)',
            textTransform: 'uppercase', mt: 0.2
          }}>
            Dispatch System
          </Typography>
        </Box>
        {isMobile && (
          <IconButton size="small" onClick={() => setMobileOpen(false)}
            sx={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', ml: 'auto' }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        )}
      </Box>

      {/* User Profile pill in sidebar removed */}

      {/* Navigation */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', overflowX: 'hidden', pt: 1, pb: 2,
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-track': { background: 'transparent' },
        '&::-webkit-scrollbar-thumb': { background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', borderRadius: 4 },
      }}>
        <List disablePadding>
          <NavGroup label="Main" items={mainItems} />
          <NavGroup label="Analytics" items={analyticsItems} />
          {adminItems.length > 0 && <NavGroup label="Admin" items={adminItems} />}
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{
        px: 2.5, py: 2,
        borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
      }}>
        <Box sx={{
          px: 1.5, py: 1.2, borderRadius: 2.5,
          background: isDark ? 'linear-gradient(135deg,rgba(99,102,241,0.08),rgba(6,182,212,0.04))' : 'linear-gradient(135deg,rgba(99,102,241,0.04),rgba(6,182,212,0.02))',
          border: `1px solid ${isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.08)'}`,
          display: 'flex', alignItems: 'center', gap: 1.2,
        }}>
          <Box sx={{
            width: 7, height: 7, borderRadius: '50%',
            backgroundColor: '#10b981', flexShrink: 0,
            boxShadow: '0 0 8px #10b981',
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%,100%': { opacity: 1 },
              '50%': { opacity: 0.4 },
            },
          }} />
          <Typography sx={{ fontSize: 11, color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontWeight: 600 }}>
            System Operational
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>

      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          backgroundColor: isDark ? 'rgba(8,12,20,0.75)' : 'rgba(248,250,252,0.75)',
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'}`,
          color: 'text.primary',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2.5, sm: 3.5 }, minHeight: 64 }}>
          {/* Left */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              onClick={() => setMobileOpen(true)}
              sx={{ display: { md: 'none' }, color: 'text.secondary' }}
            >
              <MenuIcon />
            </IconButton>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: 16, lineHeight: 1.2, color: isDark ? '#f8fafc' : '#0f172a', letterSpacing: '-0.01em' }}>
                {currentPage?.text || 'Dashboard'}
              </Typography>
              <Typography sx={{ fontSize: 11, color: 'text.secondary', display: { xs: 'none', sm: 'block' }, fontWeight: 500 }}>
                Transport Dispatch Management System
              </Typography>
            </Box>
          </Box>

          {/* Right actions */}
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            {/* Role switcher */}
            {currentUser && (
              <>
                <Box
                  onClick={(e) => setRoleAnchor(e.currentTarget)}
                  sx={{
                    display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1,
                    px: 1.8, py: 0.8, borderRadius: 2.5, cursor: 'pointer',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`,
                    background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                    '&:hover': { background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' },
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: roleStyle.dot }} />
                  <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: roleStyle.text }}>
                    {currentUser.role}
                  </Typography>
                  <ChevronDownIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                </Box>
                <Menu
                  anchorEl={roleAnchor}
                  open={Boolean(roleAnchor)}
                  onClose={() => setRoleAnchor(null)}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  slotProps={{ paper: { sx: { mt: 1, borderRadius: 3, minWidth: 200 } } }}
                >
                  <Box sx={{ px: 2, py: 1.2, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography sx={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'text.disabled' }}>
                      Switch Role (Demo)
                    </Typography>
                  </Box>
                  {(['Admin', 'Manager', 'Operator'] as UserRole[]).map(role => (
                    <MenuItem key={role} onClick={() => { dispatch(switchActiveRole(role)); setRoleAnchor(null); }}
                      sx={{ py: 1.2, gap: 1.5 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: ROLE_COLORS[role].dot }} />
                      <Typography sx={{ fontSize: 13.5, fontWeight: currentUser.role === role ? 700 : 500 }}>
                        {role}
                      </Typography>
                      {currentUser.role === role && (
                        <Chip label="Active" size="small" sx={{ ml: 'auto', height: 18, fontSize: 10, fontWeight: 700, bgcolor: ROLE_COLORS[role].bg, color: ROLE_COLORS[role].text }} />
                      )}
                    </MenuItem>
                  ))}
                </Menu>
              </>
            )}

            {/* Theme toggle */}
            <Tooltip title={darkMode ? 'Light Mode' : 'Dark Mode'}>
              <IconButton onClick={toggleTheme} size="small"
                sx={{
                  color: 'text.secondary', width: 36, height: 36, borderRadius: 2,
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`,
                  '&:hover': { color: '#6366f1', borderColor: '#6366f1', background: 'rgba(99,102,241,0.06)' },
                  transition: 'all 0.15s ease',
                }}>
                {darkMode ? <LightIcon sx={{ fontSize: 18 }} /> : <DarkIcon sx={{ fontSize: 18 }} />}
              </IconButton>
            </Tooltip>

            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton size="small"
                sx={{
                  color: 'text.secondary', width: 36, height: 36, borderRadius: 2,
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`,
                  '&:hover': { color: '#6366f1', borderColor: '#6366f1', background: 'rgba(99,102,241,0.06)' },
                  transition: 'all 0.15s ease',
                }}>
                <Badge badgeContent={3} color="error" sx={{ '& .MuiBadge-badge': { fontSize: 9.5, minWidth: 16, height: 16, fontWeight: 800 } }}>
                  <BellIcon sx={{ fontSize: 18 }} />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Profile Avatar */}
            <Tooltip title={currentUser?.name || 'Profile'}>
              <Avatar
                onClick={(e) => setProfileAnchor(e.currentTarget)}
                sx={{
                  width: 36, height: 36, fontSize: 14, fontWeight: 800, cursor: 'pointer',
                  background: roleStyle.gradient,
                  boxShadow: '0 2px 8px rgba(99,102,241,0.25)',
                  transition: 'all 0.2s',
                  '&:hover': { boxShadow: '0 4px 14px rgba(99,102,241,0.45)', transform: 'scale(1.05)' },
                }}
              >
                {currentUser?.name.charAt(0) || 'U'}
              </Avatar>
            </Tooltip>

            <Menu
              anchorEl={profileAnchor}
              open={Boolean(profileAnchor)}
              onClose={() => setProfileAnchor(null)}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              slotProps={{ paper: { sx: { mt: 1, borderRadius: 3, minWidth: 220 } } }}
            >
              <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography sx={{ fontWeight: 800, fontSize: 14.5 }}>{currentUser?.name}</Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 500 }}>{currentUser?.email}</Typography>
                <Chip
                  label={currentUser?.role}
                  size="small"
                  sx={{ mt: 1, height: 20, fontSize: 11, fontWeight: 700, backgroundColor: roleStyle.bg, color: roleStyle.text }}
                />
              </Box>
              <MenuItem onClick={() => { setProfileAnchor(null); navigate('/settings'); }}
                sx={{ py: 1.2, gap: 1.5, mx: 1, my: 0.5, borderRadius: 2 }}>
                <SettingsIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>Settings</Typography>
              </MenuItem>
              <Divider sx={{ my: 0.5 }} />
              <MenuItem
                onClick={() => { setProfileAnchor(null); dispatch(logout()); navigate('/login'); }}
                sx={{ py: 1.2, gap: 1.5, mx: 1, my: 0.5, borderRadius: 2, color: 'error.main' }}
              >
                <LogoutIcon sx={{ fontSize: 18 }} />
                <Typography sx={{ fontSize: 13.5, fontWeight: 700 }}>Sign Out</Typography>
              </MenuItem>
            </Menu>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', border: 'none' },
          }}
        >
          {sidebarContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', border: 'none' },
          }}
          open
        >
          {sidebarContent}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          pt: { xs: '64px', md: '64px' },
          px: { xs: 2, sm: 3.5, md: 4 },
          py: { xs: 2.5, sm: 3.5 },
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
