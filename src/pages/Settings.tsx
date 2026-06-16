import React, { useState } from 'react';
import {
  Box, Card, Typography, Button, Stack, Divider, Alert,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Grid, Chip, useTheme, LinearProgress, Switch, FormControlLabel
} from '@mui/material';
import {
  RestartAlt as ResetIcon,
  DeleteForever as ClearIcon,
  Storage as StorageIcon,
  Shield as ShieldIcon,
  Palette as PaletteIcon,
  Info as InfoIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../hooks';
import { resetDispatches } from '../features/dispatchSlice';

const SettingRow = ({
  title, desc, action,
}: { title: string; desc: string; action: React.ReactNode }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Box sx={{
      display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' },
      flexDirection: { xs: 'column', sm: 'row' },
      justifyContent: 'space-between', gap: 2, py: 2.5,
      borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
      '&:last-child': { borderBottom: 'none' },
    }}>
      <Box sx={{ flex: 1 }}>
        <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.3 }}>{title}</Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.6 }}>{desc}</Typography>
      </Box>
      <Box sx={{ flexShrink: 0 }}>{action}</Box>
    </Box>
  );
};

export const Settings: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const dispatch = useAppDispatch();
  const dispatches = useAppSelector(state => state.dispatches.items);
  const currentUser = useAppSelector(state => state.auth.currentUser);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  const storageSizeKb = React.useMemo(() => {
    try {
      const str = localStorage.getItem('dispatch_records') || '';
      return ((str.length * 2) / 1024).toFixed(2);
    } catch { return '0.00'; }
  }, [dispatches]);

  const storagePercent = Math.min((parseFloat(storageSizeKb) / 500) * 100, 100);

  const handleReset = () => {
    dispatch(resetDispatches());
    setConfirmResetOpen(false);
    setSuccessMsg('Dispatch database reset to default mock data successfully!');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleClearAll = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <Box sx={{ maxWidth: 860 }}>
      {/* Header */}


      {successMsg && (
        <Alert icon={<CheckIcon />} severity="success"
          sx={{ mb: 3, borderRadius: 2, fontWeight: 600 }}>
          {successMsg}
        </Alert>
      )}

      {/* Storage Overview */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {[
          { label: 'Dispatch Records', value: dispatches.length, color: '#6366f1', icon: <StorageIcon sx={{ fontSize: 20 }} /> },
          { label: 'Active Role', value: currentUser?.role || 'Guest', color: '#06b6d4', icon: <ShieldIcon sx={{ fontSize: 20 }} /> },
          { label: 'Storage Used', value: `${storageSizeKb} KB`, color: '#f59e0b', icon: <InfoIcon sx={{ fontSize: 20 }} /> },
          { label: 'App Version', value: 'v1.0.0', color: '#10b981', icon: <CheckIcon sx={{ fontSize: 20 }} /> },
        ].map((s, i) => (
          <Grid size={{ xs: 6, md: 3 }} key={i}>
            <Card sx={{
              p: 2.5,
              border: `1px solid ${s.color}25`,
              background: `${s.color}10`,
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-2px)' },
            }}>
              <Box sx={{ color: s.color, mb: 1 }}>{s.icon}</Box>
              <Typography sx={{ fontWeight: 800, fontSize: 20, color: s.color, lineHeight: 1 }}>{s.value}</Typography>
              <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.5, fontWeight: 500 }}>{s.label}</Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Storage bar */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <StorageIcon sx={{ color: 'primary.main', fontSize: 22 }} />
          <Typography sx={{ fontWeight: 700, fontSize: 16 }}>Storage Diagnostics</Typography>
        </Box>
        <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>localStorage Utilization</Typography>
          <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{storageSizeKb} KB / 500 KB</Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={storagePercent}
          sx={{
            height: 8, borderRadius: 4,
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
            '& .MuiLinearProgress-bar': {
              background: storagePercent > 80
                ? 'linear-gradient(90deg, #f59e0b, #f43f5e)'
                : 'linear-gradient(90deg, #6366f1, #06b6d4)',
              borderRadius: 4,
            },
          }}
        />
        <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 1 }}>
          {storagePercent < 50 ? '✅ Storage levels healthy' : storagePercent < 80 ? '⚠️ Storage moderately used' : '🔴 Storage nearly full — consider resetting'}
        </Typography>
      </Card>

      {/* Preferences */}
      <Card sx={{ px: 3, py: 1, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 2.5, borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
          <PaletteIcon sx={{ color: 'primary.main', fontSize: 22 }} />
          <Typography sx={{ fontWeight: 700, fontSize: 16 }}>Preferences</Typography>
        </Box>
        <SettingRow
          title="Enable Notifications"
          desc="Show in-app alerts and activity notifications for dispatch events"
          action={
            <Switch checked={notifications} onChange={e => setNotifications(e.target.checked)}
              sx={{ '& .MuiSwitch-thumb': { boxShadow: 'none' } }} />
          }
        />
        <SettingRow
          title="Auto-Save Changes"
          desc="Automatically persist record changes to localStorage without manual save"
          action={
            <Switch checked={autoSave} onChange={e => setAutoSave(e.target.checked)} />
          }
        />
        <SettingRow
          title="Dark Mode"
          desc="Currently active theme — toggle via the sun/moon icon in the top navigation bar"
          action={
            <Chip
              label={isDark ? 'Dark' : 'Light'}
              size="small"
              sx={{
                fontWeight: 700,
                bgcolor: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(245,158,11,0.15)',
                color: isDark ? '#818cf8' : '#f59e0b',
              }}
            />
          }
        />
      </Card>

      {/* Data Management */}
      <Card sx={{ px: 3, py: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 2.5, borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
          <ResetIcon sx={{ color: 'warning.main', fontSize: 22 }} />
          <Typography sx={{ fontWeight: 700, fontSize: 16 }}>Data Management</Typography>
        </Box>
        <SettingRow
          title="Reset Dispatch Database"
          desc="Reverts all dispatch records back to the original 15 mock entries. Custom entries and Excel imports will be lost."
          action={
            <Button
              variant="outlined" color="warning" startIcon={<ResetIcon />}
              onClick={() => setConfirmResetOpen(true)}
              sx={{ fontWeight: 600, borderRadius: 2, whiteSpace: 'nowrap' }}
            >
              Reset Data
            </Button>
          }
        />
        <SettingRow
          title="Clear All Cache (Hard Reset)"
          desc="Purges all localStorage keys including user sessions and preferences. App will reload after clearing."
          action={
            <Button
              variant="outlined" color="error" startIcon={<ClearIcon />}
              onClick={handleClearAll}
              sx={{ fontWeight: 600, borderRadius: 2, whiteSpace: 'nowrap' }}
            >
              Clear Storage
            </Button>
          }
        />
      </Card>

      {/* About Card */}
      <Card sx={{ mt: 3, p: 3, background: isDark ? 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(6,182,212,0.06))' : 'linear-gradient(135deg, rgba(99,102,241,0.04), rgba(6,182,212,0.03))', border: '1px solid rgba(99,102,241,0.15)' }}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 2 }}>
          <Box sx={{
            width: 44, height: 44, borderRadius: 2,
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <InfoIcon sx={{ color: '#fff', fontSize: 22 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: 15 }}>Samrat Transport Dispatch ERP</Typography>
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
              Version 1.0.0 &nbsp;•&nbsp; Built with React 19 + TypeScript + MUI &nbsp;•&nbsp; Static Demo Mode
            </Typography>
          </Box>
          <Chip label="Stable" size="small"
            sx={{ ml: 'auto', fontWeight: 700, bgcolor: 'rgba(16,185,129,0.12)', color: '#10b981' }} />
        </Stack>
      </Card>

      {/* Reset Confirm Dialog */}
      <Dialog open={confirmResetOpen} onClose={() => setConfirmResetOpen(false)} maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <WarningIcon sx={{ color: 'warning.main' }} /> Confirm Data Reset
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will <strong>permanently delete</strong> all custom dispatch records and reset the database to the original 15 mock entries. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pb: 3, px: 3, gap: 1 }}>
          <Button onClick={() => setConfirmResetOpen(false)} color="inherit" variant="outlined" sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button onClick={handleReset} color="warning" variant="contained" sx={{ borderRadius: 2, fontWeight: 700 }}>
            Yes, Reset Database
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;
