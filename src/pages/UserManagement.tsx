import React, { useState } from 'react';
import {
  Box, Typography, Stack, Button, Avatar, Chip, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Card, Grid, Tooltip, Alert, useTheme,
  Switch, Paper, Divider, Tabs, Tab
} from '@mui/material';
import {
  Add as AddIcon,
  SupervisedUserCircle as AdminIcon,
  ManageAccounts as ManagerIcon,
  SupportAgent as OperatorIcon,
  Delete as DeleteIcon,
  ShieldOutlined as ShieldIcon,
  Group as GroupIcon,
  PersonAdd as PersonAddIcon,
  CheckCircle as CheckIcon,
  Key as KeyIcon,
  Dashboard as DashboardIcon,
  LocalShipping as ShippingIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  Assessment as ReportsIcon,
  BarChart as AnalyticsIcon,
  UploadFile as UploadIcon,
  Settings as SettingsIcon,
  LockReset as LockResetIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../hooks';
import { updateUserRole, updateRolePermissions } from '../features/authSlice';
import { UserRole } from '../types';

const ROLE_META: Record<UserRole, {
  icon: React.ReactNode; color: string; bg: string;
  border: string; label: string; desc: string; gradient: string;
}> = {
  Admin: {
    icon: <AdminIcon />,
    color: '#6366f1', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)',
    gradient: 'linear-gradient(135deg,#6366f1,#4f46e5)',
    label: 'Administrator',
    desc: 'Unrestricted access to all modules & settings',
  },
  Manager: {
    icon: <ManagerIcon />,
    color: '#06b6d4', bg: 'rgba(6,182,212,0.08)', border: 'rgba(6,182,212,0.2)',
    gradient: 'linear-gradient(135deg,#06b6d4,#0891b2)',
    label: 'Operations Manager',
    desc: 'Record editor, invoices & logistics cost reviewer',
  },
  Operator: {
    icon: <OperatorIcon />,
    color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)',
    gradient: 'linear-gradient(135deg,#10b981,#059669)',
    label: 'Data Entry Operator',
    desc: 'Data entry & bulk Excel sheet parser access',
  },
};

interface ModuleConfig {
  key: string;
  label: string;
  icon: React.ReactNode;
  alwaysAdmin?: boolean;
}

const MODULES: ModuleConfig[] = [
  { key: 'dashboard',   label: 'Dashboard',        icon: <DashboardIcon sx={{ fontSize: 16 }} /> },
  { key: 'dispatches',  label: 'Dispatch List',    icon: <ShippingIcon  sx={{ fontSize: 16 }} /> },
  { key: 'transporters',label: 'Transporters',     icon: <BusinessIcon  sx={{ fontSize: 16 }} /> },
  { key: 'customers',   label: 'Customers',        icon: <PeopleIcon    sx={{ fontSize: 16 }} /> },
  { key: 'reports',     label: 'Reports',          icon: <ReportsIcon   sx={{ fontSize: 16 }} /> },
  { key: 'analytics',   label: 'Analytics',        icon: <AnalyticsIcon sx={{ fontSize: 16 }} /> },
  { key: 'upload',      label: 'Excel & Entry',    icon: <UploadIcon    sx={{ fontSize: 16 }} /> },
  { key: 'users',       label: 'User Management',  icon: <AdminIcon     sx={{ fontSize: 16 }} />, alwaysAdmin: true },
  { key: 'settings',    label: 'Settings',         icon: <SettingsIcon  sx={{ fontSize: 16 }} />, alwaysAdmin: true },
];

const ROLES: UserRole[] = ['Admin', 'Manager', 'Operator'];

export const UserManagement: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const dispatch = useAppDispatch();
  const { allUsers, currentUser, rolePermissions } = useAppSelector(state => state.auth);
  const isAdmin = currentUser?.role === 'Admin';

  const [activeSubTab, setActiveSubTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('Operator');
  const [customUsers, setCustomUsers] = useState<any[]>([]);
  const [successMsg, setSuccessMsg] = useState('');

  const allCombined = [...allUsers, ...customUsers];
  const adminCount    = allCombined.filter(u => u.role === 'Admin').length;
  const managerCount  = allCombined.filter(u => u.role === 'Manager').length;
  const operatorCount = allCombined.filter(u => u.role === 'Operator').length;

  const handleRoleChange = (userId: string, role: UserRole) => {
    if (allUsers.some(u => u.id === userId)) {
      dispatch(updateUserRole({ userId, newRole: role }));
    } else {
      setCustomUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
    }
  };

  const handleDeleteCustom = (userId: string) => {
    setCustomUsers(prev => prev.filter(u => u.id !== userId));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newUsername || !newEmail) return;
    setCustomUsers(prev => [...prev, {
      id: `usr-${Date.now()}`,
      name: newName.trim(),
      username: newUsername.toLowerCase().trim(),
      email: newEmail.trim(),
      role: newRole,
    }]);
    setDialogOpen(false);
    setSuccessMsg(`User "${newName}" has been successfully created.`);
    setTimeout(() => setSuccessMsg(''), 4000);
    setNewName(''); setNewUsername(''); setNewEmail(''); setNewRole('Operator');
  };

  const handlePermissionToggle = (role: UserRole, moduleKey: string) => {
    if (role === 'Admin' && (moduleKey === 'users' || moduleKey === 'settings')) return;
    const currentPerms = rolePermissions[role] || [];
    const newPerms = currentPerms.includes(moduleKey)
      ? currentPerms.filter(k => k !== moduleKey)
      : [...currentPerms, moduleKey];
    dispatch(updateRolePermissions({ role, permissions: newPerms }));
  };

  const SUMMARY_CARDS = [
    { role: 'Admin' as UserRole,    count: adminCount },
    { role: 'Manager' as UserRole,  count: managerCount },
    { role: 'Operator' as UserRole, count: operatorCount },
    { role: null, count: allCombined.length, label: 'Total', icon: <GroupIcon />, color: '#ec4899', bg: 'rgba(236,72,153,0.08)', border: 'rgba(236,72,153,0.2)' },
  ];

  return (
    <Box>
      {/* Header */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'flex-end' }}>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => setDialogOpen(true)}
            sx={{
              px: 2.5, py: 1, fontWeight: 700, borderRadius: 2,
              background: 'linear-gradient(135deg,#4f46e5,#3730a3)',
              boxShadow: '0 4px 14px rgba(79,70,229,0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
                boxShadow: '0 6px 18px rgba(79,70,229,0.4)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s ease',
              flexShrink: 0,
            }}
          >
            Add User
          </Button>
        )}
      </Stack>

      {/* Alerts */}
      {successMsg && (
        <Alert icon={<CheckIcon />} severity="success" sx={{ mb: 2.5, borderRadius: 2, fontWeight: 600 }}>
          {successMsg}
        </Alert>
      )}
      {!isAdmin && (
        <Alert icon={<ShieldIcon />} severity="warning" sx={{ mb: 3, borderRadius: 2, border: '1px solid', borderColor: 'warning.light' }}>
          <Typography sx={{ fontWeight: 700, mb: 0.2 }}>Read-Only View</Typography>
          <Typography variant="body2">Only Administrators can modify roles or permissions. Switch to Admin in the top bar to make changes.</Typography>
        </Alert>
      )}

      {/* Role Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {SUMMARY_CARDS.map((item, idx) => {
          const meta = item.role ? ROLE_META[item.role] : null;
          const color  = meta ? meta.color  : (item as any).color;
          const bg     = meta ? meta.bg     : (item as any).bg;
          const border = meta ? meta.border : (item as any).border;
          const icon   = meta ? meta.icon   : (item as any).icon;
          const label  = meta ? meta.label  : (item as any).label;
          return (
            <Grid size={{ xs: 6, md: 3 }} key={idx}>
              <Card sx={{
                p: 2, height: '100%',
                border: `1px solid ${border}`,
                background: bg,
                boxShadow: 'none',
                '&:hover': { transform: 'translateY(-2px)', transition: 'transform 0.2s' },
              }}>
                <Box sx={{
                  width: 36, height: 36, borderRadius: 1.8, mb: 1.2,
                  background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color,
                }}>
                  {icon}
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 900, color, lineHeight: 1 }}>
                  {item.count}
                </Typography>
                <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: 'text.secondary', mt: 0.4 }}>
                  {label}
                </Typography>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeSubTab} onChange={(_, val) => setActiveSubTab(val)} textColor="primary" indicatorColor="primary">
          <Tab label="Users & Roles" sx={{ fontWeight: 700, textTransform: 'none', px: 2.5 }} />
          <Tab label="Access Permissions" sx={{ fontWeight: 700, textTransform: 'none', px: 2.5 }} />
        </Tabs>
      </Box>

      {/* ── TAB 1: Users Directory ─────────────────────────────────────────────── */}
      {activeSubTab === 0 && (
        <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{
            px: 2.5, py: 2,
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
            display: 'flex', alignItems: 'center', gap: 1.5,
          }}>
            <KeyIcon sx={{ color: 'primary.main', fontSize: 18 }} />
            <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Registered Accounts</Typography>
            <Chip label={`${allCombined.length} Users`} size="small"
              sx={{ ml: 'auto', fontWeight: 700, height: 22, fontSize: 11,
                bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }} />
          </Box>

          <Box sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Username</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Email</TableCell>
                  <TableCell>Role</TableCell>
                  {isAdmin && <TableCell>Change Role</TableCell>}
                  {isAdmin && <TableCell align="center">Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {allCombined.map(row => {
                  const meta = ROLE_META[row.role as UserRole];
                  const isSelf   = row.id === currentUser?.id;
                  const isCustom = customUsers.some(u => u.id === row.id);
                  return (
                    <TableRow key={row.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{
                            width: 34, height: 34, fontSize: 13, fontWeight: 800, flexShrink: 0,
                            background: meta.gradient, color: '#fff',
                          }}>
                            {row.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: 13 }}>{row.name}</Typography>
                            {isSelf && (
                              <Chip label="You" size="small" sx={{ height: 14, fontSize: 9, fontWeight: 700,
                                bgcolor: 'rgba(99,102,241,0.1)', color: '#818cf8' }} />
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                        <Typography sx={{
                          fontFamily: 'monospace', fontSize: 12, color: 'text.secondary',
                          bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                          px: 0.8, py: 0.3, borderRadius: 1.2, display: 'inline-block',
                        }}>
                          @{row.username}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                        <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>{row.email}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={row.role}
                          size="small"
                          sx={{
                            fontWeight: 700, fontSize: 11.5, height: 22,
                            backgroundColor: meta.bg, color: meta.color,
                            border: `1px solid ${meta.border}`,
                          }}
                        />
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <TextField
                            select size="small"
                            value={row.role}
                            disabled={isSelf}
                            onChange={e => handleRoleChange(row.id, e.target.value as UserRole)}
                            sx={{ width: 130, '& .MuiOutlinedInput-root': { fontSize: 12.5, borderRadius: 1.8 } }}
                          >
                            <MenuItem value="Admin">Admin</MenuItem>
                            <MenuItem value="Manager">Manager</MenuItem>
                            <MenuItem value="Operator">Operator</MenuItem>
                          </TextField>
                        </TableCell>
                      )}
                      {isAdmin && (
                        <TableCell align="center">
                          {isCustom ? (
                            <Tooltip title="Delete user">
                              <IconButton size="small" onClick={() => handleDeleteCustom(row.id)}
                                sx={{ color: 'error.main', '&:hover': { bgcolor: 'rgba(244,63,94,0.08)' } }}>
                                <DeleteIcon sx={{ fontSize: 17 }} />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Tooltip title="Default user (cannot delete)">
                              <IconButton size="small" disabled>
                                <LockResetIcon sx={{ fontSize: 17 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
        </Card>
      )}

      {/* ── TAB 2: Permissions Matrix ──────────────────────────────────────────── */}
      {activeSubTab === 1 && (
        <Box>
          <Alert severity="info" icon={<ShieldIcon />} sx={{ mb: 2.5, borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.3 }}>Live Permission Control</Typography>
            <Typography variant="body2">
              Toggle access for each role. Changes apply instantly — the navigation and routes update in real time.
              {!isAdmin && ' Switch to Admin role to edit permissions.'}
            </Typography>
          </Alert>

          <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: 13, minWidth: 180 }}>Module</TableCell>
                    {ROLES.map(role => {
                      const meta = ROLE_META[role];
                      return (
                        <TableCell key={role} align="center" sx={{ minWidth: 130 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{
                              width: 32, height: 32, borderRadius: '50%',
                              background: meta.gradient,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#fff', mb: 0.3,
                            }}>
                              <Box sx={{ fontSize: 16, display: 'flex', alignItems: 'center' }}>{meta.icon}</Box>
                            </Box>
                            <Typography sx={{ fontSize: 12.5, fontWeight: 800, color: meta.color }}>{role}</Typography>
                            <Typography sx={{ fontSize: 10, color: 'text.secondary', textAlign: 'center', lineHeight: 1.2 }}>
                              {meta.label}
                            </Typography>
                          </Box>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {MODULES.map((module, idx) => (
                    <TableRow
                      key={module.key}
                      sx={{
                        bgcolor: idx % 2 === 0
                          ? 'transparent'
                          : (isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)'),
                        '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' },
                      }}
                    >
                      {/* Module Label */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                          <Box sx={{
                            width: 28, height: 28, borderRadius: 1.2,
                            bgcolor: isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.06)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'primary.main', flexShrink: 0,
                          }}>
                            {module.icon}
                          </Box>
                          <Box>
                            <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{module.label}</Typography>
                            {module.alwaysAdmin && (
                              <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>Admin locked</Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Toggle per role */}
                      {ROLES.map(role => {
                        const hasAccess = (rolePermissions[role] || []).includes(module.key);
                        const isLocked = role === 'Admin' && !!module.alwaysAdmin;
                        const canToggle = isAdmin && !isLocked;
                        const meta = ROLE_META[role];

                        return (
                          <TableCell key={role} align="center">
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.4 }}>
                              {isLocked ? (
                                <Tooltip title="Admin always has access">
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <LockIcon sx={{ fontSize: 15, color: meta.color }} />
                                    <Typography sx={{ fontSize: 10.5, color: meta.color, fontWeight: 700 }}>Locked</Typography>
                                  </Box>
                                </Tooltip>
                              ) : (
                                <Tooltip title={
                                  !isAdmin
                                    ? 'Admin access required to change permissions'
                                    : hasAccess
                                      ? `Remove ${module.label} from ${role}`
                                      : `Give ${role} access to ${module.label}`
                                }>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <Switch
                                      size="small"
                                      checked={hasAccess}
                                      disabled={!canToggle}
                                      onChange={() => canToggle && handlePermissionToggle(role, module.key)}
                                      sx={{
                                        '& .MuiSwitch-thumb': {
                                          boxShadow: hasAccess ? `0 0 6px ${meta.color}` : 'none',
                                        },
                                        '& .MuiSwitch-track': {
                                          backgroundColor: hasAccess ? `${meta.color} !important` : undefined,
                                          opacity: hasAccess ? '0.5 !important' : undefined,
                                        },
                                        '& .Mui-checked .MuiSwitch-thumb': {
                                          color: meta.color,
                                        },
                                      }}
                                    />
                                    <Typography sx={{
                                      fontSize: 9.5, fontWeight: 700,
                                      color: hasAccess ? meta.color : 'text.disabled',
                                    }}>
                                      {hasAccess ? 'ON' : 'OFF'}
                                    </Typography>
                                  </Box>
                                </Tooltip>
                              )}
                            </Box>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Card>

          {/* Legend */}
          <Box sx={{ mt: 2, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {[
              { label: 'Access Granted', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
              { label: 'No Access', color: 'text.disabled', bg: 'transparent' },
              { label: 'Admin Locked', icon: <LockIcon sx={{ fontSize: 13 }} />, color: '#6366f1', bg: 'rgba(99,102,241,0.05)' },
            ].map((l, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                {l.icon && <Box sx={{ color: l.color, display: 'flex' }}>{l.icon}</Box>}
                <Typography sx={{ fontSize: 11.5, color: 'text.secondary', fontWeight: 600 }}>{l.label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Add User Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, fontSize: 17, pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 36, height: 36, borderRadius: 2,
              background: 'linear-gradient(135deg,#4f46e5,#3730a3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <PersonAddIcon sx={{ color: '#fff', fontSize: 18 }} />
            </Box>
            Add New User
          </Box>
        </DialogTitle>
        <Box component="form" onSubmit={handleCreate}>
          <DialogContent sx={{ pt: 2 }}>
            <Stack spacing={2.5}>
              <TextField required fullWidth label="Full Name" placeholder="e.g. Rajesh Malhotra"
                value={newName} onChange={e => setNewName(e.target.value)} />
              <TextField required fullWidth label="Username" placeholder="e.g. rajesh_m"
                value={newUsername} onChange={e => setNewUsername(e.target.value)}
                slotProps={{ input: { startAdornment: <Typography sx={{ color: 'text.secondary', mr: 0.5, fontSize: 14 }}>@</Typography> } }} />
              <TextField required fullWidth type="email" label="Email Address"
                placeholder="e.g. rajesh@samratlogistics.com"
                value={newEmail} onChange={e => setNewEmail(e.target.value)} />
              <TextField select fullWidth label="Assign Role" value={newRole}
                onChange={e => setNewRole(e.target.value as UserRole)}>
                {(Object.keys(ROLE_META) as UserRole[]).map(role => (
                  <MenuItem key={role} value={role}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.4 }}>
                      <Box sx={{ color: ROLE_META[role].color, display: 'flex' }}>{ROLE_META[role].icon}</Box>
                      <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{ROLE_META[role].label}</Typography>
                        <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{ROLE_META[role].desc}</Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
            <Button onClick={() => setDialogOpen(false)} color="inherit" variant="outlined" sx={{ borderRadius: 2, textTransform: 'none' }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained"
              sx={{
                px: 3, fontWeight: 700, borderRadius: 2, textTransform: 'none',
                background: 'linear-gradient(135deg,#4f46e5,#3730a3)',
                boxShadow: '0 4px 14px rgba(79,70,229,0.3)',
              }}>
              Create User
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
