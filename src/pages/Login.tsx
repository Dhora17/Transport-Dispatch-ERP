import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Alert, Stack,
  InputAdornment, IconButton, CircularProgress, useTheme, useMediaQuery
} from '@mui/material';
import {
  LocalShipping as TruckIcon,
  PersonOutlined as UserIcon,
  LockOutlined as LockIcon,
  Visibility, VisibilityOff,
  AdminPanelSettings as AdminIcon,
  ManageAccounts as ManagerIcon,
  SupportAgent as OperatorIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../hooks';
import { performLogin } from '../features/authSlice';

const DEMO_ROLES = [
  {
    role: 'admin',
    label: 'Admin',
    sub: 'Full system access',
    icon: AdminIcon,
    gradient: 'linear-gradient(135deg,#6366f1,#4f46e5)',
    glow: 'rgba(99,102,241,0.35)',
    border: 'rgba(99,102,241,0.3)',
    bg: 'rgba(99,102,241,0.07)',
  },
  {
    role: 'manager',
    label: 'Manager',
    sub: 'Operations access',
    icon: ManagerIcon,
    gradient: 'linear-gradient(135deg,#06b6d4,#0891b2)',
    glow: 'rgba(6,182,212,0.35)',
    border: 'rgba(6,182,212,0.3)',
    bg: 'rgba(6,182,212,0.07)',
  },
  {
    role: 'operator',
    label: 'Operator',
    sub: 'Data entry access',
    icon: OperatorIcon,
    gradient: 'linear-gradient(135deg,#10b981,#059669)',
    glow: 'rgba(16,185,129,0.35)',
    border: 'rgba(16,185,129,0.3)',
    bg: 'rgba(16,185,129,0.07)',
  },
];

export const Login: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMd = useMediaQuery(theme.breakpoints.up('md'));

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeRole, setActiveRole] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { error, isAuthenticated } = useAppSelector(state => state.auth);

  React.useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const success = dispatch(performLogin(username));
    setLoading(false);
    if (success) navigate('/dashboard');
  };

  const handleQuickLogin = async (roleUser: string) => {
    setActiveRole(roleUser);
    setLoading(true);
    setUsername(roleUser);
    setPassword('••••••••');
    await new Promise(r => setTimeout(r, 500));
    const success = dispatch(performLogin(roleUser));
    setLoading(false);
    setActiveRole(null);
    if (success) navigate('/dashboard');
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      backgroundColor: isDark ? '#0b0f1a' : '#f8fafc',
    }}>
      {/* Left Branding Panel — visible on md+ */}
      {isMd && (
        <Box sx={{
          width: '45%',
          flexShrink: 0,
          background: 'linear-gradient(145deg, #4f46e5 0%, #06b6d4 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 6,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative circles */}
          {[
            { size: 300, top: '-80px', left: '-80px', op: 0.12 },
            { size: 200, bottom: '-50px', right: '-50px', op: 0.1 },
            { size: 120, top: '40%', right: '8%', op: 0.08 },
          ].map((c, i) => (
            <Box key={i} sx={{
              position: 'absolute',
              width: c.size,
              height: c.size,
              borderRadius: '50%',
              background: 'rgba(255,255,255,' + c.op + ')',
              top: c.top,
              left: c.left,
              bottom: (c as any).bottom,
              right: (c as any).right,
            }} />
          ))}

          <Box sx={{ position: 'relative', textAlign: 'center' }}>
            <Box sx={{
              width: 72, height: 72, borderRadius: 3,
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              mx: 'auto', mb: 3,
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            }}>
              <TruckIcon sx={{ color: '#fff', fontSize: 38 }} />
            </Box>
            <Typography sx={{
              fontSize: 32, fontWeight: 900, color: '#fff',
              letterSpacing: '-0.03em', lineHeight: 1,
            }}>
              SAMRAT ERP
            </Typography>
            <Typography sx={{
              fontSize: 12, fontWeight: 700, letterSpacing: '0.2em',
              color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', mt: 0.8,
            }}>
              Logistics & Dispatch Portal
            </Typography>

            <Box sx={{ mt: 5, display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'left' }}>
              {[
                { label: 'Real-time Dispatch Tracking', desc: 'Monitor all logistics in one dashboard' },
                { label: 'Smart Excel Import', desc: 'Bulk upload dispatch manifests instantly' },
                { label: 'Role-Based Access Control', desc: 'Admin, Manager & Operator permissions' },
              ].map((f, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Box sx={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: '#fff', mt: 0.6, flexShrink: 0,
                    boxShadow: '0 0 8px rgba(255,255,255,0.6)',
                  }} />
                  <Box>
                    <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#fff' }}>{f.label}</Typography>
                    <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>{f.desc}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      )}

      {/* Right Form Panel */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 4 },
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle glow blobs */}
        <Box sx={{
          position: 'absolute', width: 350, height: 350, borderRadius: '50%',
          background: isDark ? 'radial-gradient(circle,rgba(99,102,241,0.08),transparent 70%)' : 'radial-gradient(circle,rgba(99,102,241,0.04),transparent 70%)',
          top: '5%', right: '5%', filter: 'blur(40px)', pointerEvents: 'none',
        }} />

        <Box sx={{ width: '100%', maxWidth: 420 }}>
          {/* Header for mobile */}
          {!isMd && (
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box sx={{
                width: 54, height: 54, borderRadius: 2.5,
                background: 'linear-gradient(135deg,#6366f1,#06b6d4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                mx: 'auto', mb: 1.5,
                boxShadow: '0 6px 18px rgba(99,102,241,0.35)',
              }}>
                <TruckIcon sx={{ color: '#fff', fontSize: 28 }} />
              </Box>
              <Typography sx={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em' }}>SAMRAT ERP</Typography>
              <Typography sx={{ fontSize: 11, color: 'text.secondary', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>
                Logistics Portal
              </Typography>
            </Box>
          )}

          <Typography sx={{ fontSize: 22, fontWeight: 800, mb: 0.5, letterSpacing: '-0.02em' }}>
            Welcome back 👋
          </Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 3 }}>
            Sign in to your account to continue
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2, fontSize: 13 }}>{error}</Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={2}>
              <TextField
                required fullWidth label="Username" id="username"
                placeholder="admin / manager / operator"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                slotProps={{ input: { startAdornment: (
                  <InputAdornment position="start">
                    <UserIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  </InputAdornment>
                )}}}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <TextField
                required fullWidth label="Password" id="password"
                placeholder="Any password works"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                slotProps={{ input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                        {showPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <Button
                type="submit" fullWidth variant="contained" size="large"
                disabled={loading}
                endIcon={loading ? <CircularProgress size={16} sx={{ color: 'inherit' }} /> : <ArrowIcon />}
                sx={{
                  py: 1.3, fontSize: 14, fontWeight: 700, borderRadius: 2,
                  background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
                  boxShadow: '0 4px 14px rgba(99,102,241,0.25)',
                  '&:hover': {
                    background: 'linear-gradient(135deg,#4f46e5,#3730a3)',
                    boxShadow: '0 6px 18px rgba(99,102,241,0.35)',
                  },
                }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </Stack>
          </Box>

          {/* Quick Login */}
          <Box sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
              <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                Quick Demo Login
              </Typography>
              <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
            </Box>

            <Stack spacing={1.5}>
              {DEMO_ROLES.map(r => {
                const Icon = r.icon;
                const isThis = activeRole === r.role;
                return (
                  <Box
                    key={r.role}
                    id={`quick-login-${r.role}`}
                    onClick={() => !loading && handleQuickLogin(r.role)}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 2,
                      p: 1.5, borderRadius: 2.5, cursor: loading ? 'not-allowed' : 'pointer',
                      border: `1px solid ${r.border}`,
                      background: r.bg,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                        transform: 'translateY(-1px)',
                        boxShadow: `0 6px 16px ${r.glow}`,
                      },
                    }}
                  >
                    <Box sx={{
                      width: 38, height: 38, borderRadius: 2, flexShrink: 0,
                      background: r.gradient,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: `0 4px 12px ${r.glow}`,
                    }}>
                      {isThis
                        ? <CircularProgress size={18} sx={{ color: '#fff' }} />
                        : <Icon sx={{ color: '#fff', fontSize: 20 }} />
                      }
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: 13.5, fontWeight: 700 }}>{r.label}</Typography>
                      <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{r.sub}</Typography>
                    </Box>
                    <ArrowIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                  </Box>
                );
              })}
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
