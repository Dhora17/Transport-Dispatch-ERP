import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, Typography, Stack, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Avatar, useTheme, LinearProgress
} from '@mui/material';
import {
  LocalShipping as TruckIcon,
  MonetizationOn as MoneyIcon,
  Scale as ScaleIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ArrowForward as ArrowIcon,
  Add as AddIcon,
  UploadFile as UploadIcon,
  Assessment as ReportsIcon,
  ManageAccounts as UsersIcon,
  People as PeopleIcon,
  BarChart as AnalyticsIcon,
} from '@mui/icons-material';
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, Tooltip as ChartTooltip, CartesianGrid,
  PieChart, Pie, Cell,
} from 'recharts';
import { useAppSelector } from '../hooks';

// ─── KPI Card ────────────────────────────────────────────────────────────────
const KpiCard = ({
  title, value, sub, icon, color, gradient, trend, trendValue, progress
}: {
  title: string; value: string; sub: string;
  icon: React.ReactNode; color: string; gradient: string;
  trend?: 'up' | 'down'; trendValue?: string; progress?: number;
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Card sx={{
      p: 0, overflow: 'hidden', height: '100%',
      position: 'relative',
      background: isDark ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' : '#ffffff',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'}`,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: `0 12px 30px ${color}15, 0 0 0 1px ${color}30`,
        '& .icon-wrapper': {
          transform: 'scale(1.1) rotate(5deg)',
          boxShadow: `0 6px 18px ${color}50`,
        }
      },
    }}>
      <Box sx={{ p: 2.5 }}>
        <Stack direction="row" sx={{ mb: 2, justifyContent: 'space-between', alignItems: 'center' }}>
          <Box
            className="icon-wrapper"
            sx={{
              width: 44, height: 44, borderRadius: '12px',
              background: gradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 4px 14px ${color}35`,
              color: '#fff', flexShrink: 0,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {icon}
          </Box>
          {trend && trendValue && (
            <Chip
              icon={trend === 'up'
                ? <TrendingUpIcon sx={{ fontSize: '13px !important' }} />
                : <TrendingDownIcon sx={{ fontSize: '13px !important' }} />}
              label={trendValue}
              size="small"
              sx={{
                height: 22, fontSize: 11, fontWeight: 700,
                backgroundColor: trend === 'up' ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
                color: trend === 'up' ? '#10b981' : '#f43f5e',
                border: `1px solid ${trend === 'up' ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)'}`,
              }}
            />
          )}
        </Stack>
        <Typography sx={{ fontSize: 24, fontWeight: 900, lineHeight: 1.1, mb: 0.5, letterSpacing: '-0.02em', color: isDark ? '#fff' : '#0f172a' }}>
          {value}
        </Typography>
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'text.secondary', mb: 0.5 }}>
          {title}
        </Typography>
        <Typography sx={{ fontSize: 11.5, color: 'text.disabled', fontWeight: 500, mb: progress !== undefined ? 1.5 : 0 }}>{sub}</Typography>
        
        {progress !== undefined && (
          <Box sx={{ width: '100%', mt: 1 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 4, borderRadius: 2,
                bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                '& .MuiLinearProgress-bar': { background: gradient, borderRadius: 2 }
              }}
            />
          </Box>
        )}
      </Box>
    </Card>
  );
};

// ─── Chart Tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{
      p: 2, borderRadius: 3,
      background: isDark ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(12px)',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
      boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
      minWidth: 170,
    }}>
      <Typography sx={{ fontSize: 11.5, fontWeight: 800, mb: 1.2, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </Typography>
      {payload.map((p: any, i: number) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: i !== payload.length - 1 ? 0.8 : 0 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: p.color }} />
          <Typography sx={{ fontSize: 12.5, color: 'text.secondary', flex: 1, fontWeight: 500 }}>{p.name}</Typography>
          <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: p.color }}>
            {typeof p.value === 'number' && p.name?.toLowerCase().includes('qty')
              ? `${Number(p.value).toFixed(1)} MT`
              : `₹${Number(p.value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

// ─── Shortcut Card ────────────────────────────────────────────────────────────
const ShortcutCard = ({
  label, sub, icon, gradient, glow, onClick
}: {
  label: string; sub: string; icon: React.ReactNode;
  gradient: string; glow: string; onClick: () => void;
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Card
      onClick={onClick}
      sx={{
        p: 2.5, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
        height: '100%', minHeight: 120,
        background: isDark ? 'rgba(255,255,255,0.01)' : '#ffffff',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.08)'}`,
        borderRadius: 2, // Sharper corners for SAP feel
        transition: 'all 0.22s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 24px ${glow}`,
          borderColor: 'primary.main',
        },
      }}
    >
      <Box sx={{
        width: 38, height: 38, borderRadius: '8px', flexShrink: 0,
        background: gradient,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff',
        boxShadow: `0 4px 12px ${glow}`,
      }}>
        {icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0, mt: 1.5 }}>
        <Typography sx={{ fontSize: 13.5, fontWeight: 700, lineHeight: 1.2, mb: 0.5 }}>{label}</Typography>
        <Typography sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 500, lineHeight: 1.3 }}>{sub}</Typography>
      </Box>
    </Card>
  );
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const Dashboard: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();
  const dispatches = useAppSelector(state => state.dispatches.items);
  const { currentUser, rolePermissions } = useAppSelector(state => state.auth);

  const [period, setPeriod] = useState<'all' | 'month' | '30days' | '7days'>('all');

  const userPermissions = currentUser ? (rolePermissions[currentUser.role] || []) : [];

  const filteredDispatches = useMemo(() => {
    if (period === 'all') return dispatches;
    const now = new Date();
    const cutoff = new Date();
    if (period === 'month') {
      return dispatches.filter(d => {
        const dDate = new Date(d.date);
        return dDate.getMonth() === now.getMonth() && dDate.getFullYear() === now.getFullYear();
      });
    } else if (period === '30days') {
      cutoff.setDate(now.getDate() - 30);
    } else if (period === '7days') {
      cutoff.setDate(now.getDate() - 7);
    }
    cutoff.setHours(0, 0, 0, 0);
    return dispatches.filter(d => new Date(d.date) >= cutoff);
  }, [dispatches, period]);

  const totalDispatches = filteredDispatches.length;
  const totalLoadedQty  = filteredDispatches.reduce((a, c) => a + c.loadedQty, 0);
  const totalPaidAmount = filteredDispatches.reduce((a, c) => a + c.paidAmount, 0);
  const totalRevenue    = filteredDispatches.reduce((a, c) => a + c.samratBillAmount, 0);
  const totalProfit     = totalRevenue - totalPaidAmount;
  const profitMargin    = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  // Monthly chart data
  const monthlyMap: Record<string, { month: string; Revenue: number; Cost: number; Profit: number; Qty: number }> = {};
  filteredDispatches.forEach(d => {
    const key = new Date(d.date).toLocaleString('default', { month: 'short', year: '2-digit' });
    if (!monthlyMap[key]) monthlyMap[key] = { month: key, Revenue: 0, Cost: 0, Profit: 0, Qty: 0 };
    monthlyMap[key].Revenue += d.samratBillAmount;
    monthlyMap[key].Cost    += d.paidAmount;
    monthlyMap[key].Profit  += d.profit;
    monthlyMap[key].Qty     += d.loadedQty;
  });
  const monthlyData = Object.values(monthlyMap).sort((a, b) => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const [am, ay] = a.month.split(' ');
    const [bm, by] = b.month.split(' ');
    return (+by !== +ay) ? +ay - +by : months.indexOf(am) - months.indexOf(bm);
  });

  // Transporter breakdown
  const transporterMap: Record<string, { name: string; value: number; profit: number }> = {};
  filteredDispatches.forEach(d => {
    const n = d.transporterName || 'Unknown';
    if (!transporterMap[n]) transporterMap[n] = { name: n, value: 0, profit: 0 };
    transporterMap[n].value  += d.loadedQty;
    transporterMap[n].profit += d.profit;
  });
  const transporterData = Object.values(transporterMap).sort((a, b) => b.value - a.value).slice(0, 5);
  const totalTransQty = transporterData.reduce((a, c) => a + c.value, 0);

  // Customer breakdown
  const customerMap: Record<string, { name: string; value: number; profit: number }> = {};
  filteredDispatches.forEach(d => {
    const n = d.customerName || 'Unknown';
    if (!customerMap[n]) customerMap[n] = { name: n, value: 0, profit: 0 };
    customerMap[n].value  += d.loadedQty;
    customerMap[n].profit += d.profit;
  });
  const customerData = Object.values(customerMap).sort((a, b) => b.value - a.value).slice(0, 5);
  const totalCustomerQty = customerData.reduce((a, c) => a + c.value, 0);

  const PIE_COLORS = ['#6366f1', '#06b6d4', '#f59e0b', '#f43f5e', '#10b981'];

  const recentDispatches = [...filteredDispatches]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  // Quick shortcuts — only show accessible ones
  const SHORTCUTS = [
    {
      key: 'dispatches',
      label: 'New Dispatch',
      sub: 'Add a dispatch record',
      icon: <AddIcon sx={{ fontSize: 20 }} />,
      gradient: 'linear-gradient(135deg,#6366f1,#4f46e5)',
      glow: 'rgba(99,102,241,0.2)',
      action: () => navigate('/dispatches/add'),
    },
    {
      key: 'upload',
      label: 'Excel Import',
      sub: 'Upload or manually enter data',
      icon: <UploadIcon sx={{ fontSize: 20 }} />,
      gradient: 'linear-gradient(135deg,#10b981,#059669)',
      glow: 'rgba(16,185,129,0.2)',
      action: () => navigate('/upload'),
    },
    {
      key: 'reports',
      label: 'View Reports',
      sub: 'Financial & cargo reports',
      icon: <ReportsIcon sx={{ fontSize: 20 }} />,
      gradient: 'linear-gradient(135deg,#f59e0b,#d97706)',
      glow: 'rgba(245,158,11,0.2)',
      action: () => navigate('/reports'),
    },
    {
      key: 'analytics',
      label: 'Analytics',
      sub: 'Trends & performance',
      icon: <AnalyticsIcon sx={{ fontSize: 20 }} />,
      gradient: 'linear-gradient(135deg,#06b6d4,#0891b2)',
      glow: 'rgba(6,182,212,0.2)',
      action: () => navigate('/analytics'),
    },
    {
      key: 'customers',
      label: 'Customers',
      sub: 'Customer directory',
      icon: <PeopleIcon sx={{ fontSize: 20 }} />,
      gradient: 'linear-gradient(135deg,#ec4899,#db2777)',
      glow: 'rgba(236,72,153,0.2)',
      action: () => navigate('/customers'),
    },
    {
      key: 'users',
      label: 'User Management',
      sub: 'Roles & permissions',
      icon: <UsersIcon sx={{ fontSize: 20 }} />,
      gradient: 'linear-gradient(135deg,#8b5cf6,#7c3aed)',
      glow: 'rgba(139,92,246,0.2)',
      action: () => navigate('/users'),
    },
  ].filter(s => userPermissions.includes(s.key));

  return (
    <Box sx={{ position: 'relative' }}>
      
      {/* Background glowing decorations */}
      <Box sx={{
        position: 'absolute', width: 400, height: 400, borderRadius: '50%',
        background: isDark ? 'radial-gradient(circle,rgba(99,102,241,0.06),transparent 70%)' : 'radial-gradient(circle,rgba(99,102,241,0.03),transparent 70%)',
        top: -150, right: -100, filter: 'blur(50px)', pointerEvents: 'none', zIndex: 0,
      }} />
      <Box sx={{
        position: 'absolute', width: 350, height: 350, borderRadius: '50%',
        background: isDark ? 'radial-gradient(circle,rgba(6,182,212,0.04),transparent 70%)' : 'radial-gradient(circle,rgba(6,182,212,0.02),transparent 70%)',
        bottom: 100, left: -150, filter: 'blur(50px)', pointerEvents: 'none', zIndex: 0,
      }} />

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {/* Page Header (Filters only now, removed duplicate screen name) */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ mb: 4, justifyContent: 'flex-end', alignItems: { xs: 'flex-end', md: 'center' } }}
        >

          {/* Period filter */}
          <Stack direction="row" spacing={0.5} sx={{
            bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
            p: 0.6, borderRadius: 3,
            border: '1px solid', borderColor: 'divider',
          }}>
            {[
              { key: 'all', label: 'All Time' },
              { key: 'month', label: 'This Month' },
              { key: '30days', label: '30 Days' },
              { key: '7days', label: '7 Days' },
            ].map(p => (
              <Button
                key={p.key}
                size="small"
                onClick={() => setPeriod(p.key as any)}
                sx={{
                  px: 2, py: 0.6, fontSize: 12, borderRadius: 2.5,
                  fontWeight: 700, textTransform: 'none', minWidth: 60,
                  bgcolor: period === p.key ? (isDark ? 'rgba(99,102,241,0.15)' : '#6366f1') : 'transparent',
                  color: period === p.key ? (isDark ? '#c7d2fe' : '#fff') : 'text.secondary',
                  boxShadow: period === p.key && !isDark ? '0 2px 8px rgba(99,102,241,0.3)' : 'none',
                  '&:hover': {
                    bgcolor: period === p.key
                      ? (isDark ? 'rgba(99,102,241,0.2)' : '#4f46e5')
                      : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)')
                  }
                }}
              >
                {p.label}
              </Button>
            ))}
          </Stack>
        </Stack>

        {/* Quick Shortcuts */}
        {SHORTCUTS.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography sx={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'text.disabled', mb: 1.8 }}>
              Quick Operations
            </Typography>
            <Grid container spacing={2}>
              {SHORTCUTS.map(s => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={s.key}>
                  <ShortcutCard
                    label={s.label}
                    sub={s.sub}
                    icon={s.icon}
                    gradient={s.gradient}
                    glow={s.glow}
                    onClick={s.action}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* KPI Cards */}
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          <Grid size={{ xs: 6, sm: 6, md: 4, lg: 'auto' }} sx={{ flex: { lg: 1 } }}>
            <KpiCard
              title="Total Dispatches" value={`${totalDispatches}`}
              sub="Shipments completed" icon={<TruckIcon sx={{ fontSize: 22 }} />}
              color="#6366f1" gradient="linear-gradient(135deg,#6366f1,#4f46e5)"
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 6, md: 4, lg: 'auto' }} sx={{ flex: { lg: 1 } }}>
            <KpiCard
              title="Loaded Weight" value={`${totalLoadedQty.toLocaleString('en-IN', { maximumFractionDigits: 1 })} MT`}
              sub="Total cargo moved" icon={<ScaleIcon sx={{ fontSize: 22 }} />}
              color="#06b6d4" gradient="linear-gradient(135deg,#06b6d4,#0891b2)"
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 6, md: 4, lg: 'auto' }} sx={{ flex: { lg: 1 } }}>
            <KpiCard
              title="Transporter Cost" value={`₹${(totalPaidAmount / 100000).toFixed(2)}L`}
              sub={`₹${totalPaidAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
              icon={<MoneyIcon sx={{ fontSize: 22 }} />}
              color="#f43f5e" gradient="linear-gradient(135deg,#f43f5e,#e11d48)"
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 6, md: 4, lg: 'auto' }} sx={{ flex: { lg: 1 } }}>
            <KpiCard
              title="Samrat Revenue" value={`₹${(totalRevenue / 100000).toFixed(2)}L`}
              sub={`₹${totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
              icon={<MoneyIcon sx={{ fontSize: 22 }} />}
              color="#10b981" gradient="linear-gradient(135deg,#10b981,#059669)"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 'auto' }} sx={{ flex: { lg: 1 } }}>
            <KpiCard
              title="Net Profit" value={`₹${(totalProfit / 100000).toFixed(2)}L`}
              sub={`${profitMargin.toFixed(1)}% profit margin`}
              icon={totalProfit >= 0 ? <TrendingUpIcon sx={{ fontSize: 22 }} /> : <TrendingDownIcon sx={{ fontSize: 22 }} />}
              color={totalProfit >= 0 ? '#f59e0b' : '#f43f5e'}
              gradient={totalProfit >= 0
                ? 'linear-gradient(135deg,#f59e0b,#d97706)'
                : 'linear-gradient(135deg,#f43f5e,#e11d48)'}
              progress={Math.min(Math.max(profitMargin, 0), 100)}
            />
          </Grid>
        </Grid>

        {/* Financial Chart */}
        <Card sx={{ p: 3, mb: 4 }}>
          <Stack direction="row" sx={{ mb: 3.5, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: 16, color: isDark ? '#fff' : '#0f172a' }}>Financial Performance Trends</Typography>
              <Typography sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 500 }}>Tracking revenue, cost structures & profit margins</Typography>
            </Box>
            <Stack direction="row" spacing={2.5}>
              {[
                { label: 'Revenue', color: '#10b981' },
                { label: 'Cost', color: '#f43f5e' },
                { label: 'Profit', color: '#6366f1' },
              ].map(l => (
                <Box key={l.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: l.color }} />
                  <Typography sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 700 }}>{l.label}</Typography>
                </Box>
              ))}
            </Stack>
          </Stack>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f43f5e" stopOpacity={0.16} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} dy={8} />
                <YAxis tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} dx={-8} />
                <ChartTooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="Revenue" name="Revenue" stroke="#10b981" strokeWidth={3} fill="url(#gradRevenue)" dot={false} />
                <Area type="monotone" dataKey="Cost"    name="Cost"    stroke="#f43f5e" strokeWidth={3} fill="url(#gradCost)"    dot={false} />
                <Area type="monotone" dataKey="Profit"  name="Profit"  stroke="#6366f1" strokeWidth={3} fill="url(#gradProfit)"  dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </Card>

        {/* Distribution Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ p: 3, height: '100%' }}>
              <Box sx={{ mb: 2.5 }}>
                <Typography sx={{ fontWeight: 800, fontSize: 16, color: isDark ? '#fff' : '#0f172a' }}>Transporter Cargo Distribution</Typography>
                <Typography sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 500 }}>Share of loaded volume (MT) by carrier</Typography>
              </Box>
              <Box sx={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={transporterData} cx="50%" cy="50%"
                      innerRadius={52} outerRadius={76}
                      paddingAngle={3} dataKey="value" nameKey="name">
                      {transporterData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke={isDark ? '#0f172a' : '#fff'} strokeWidth={2} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      formatter={(v: any) => [`${Number(v).toFixed(1)} MT`, 'Cargo Weight']}
                      contentStyle={{
                        borderRadius: 12,
                        backgroundColor: isDark ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(8px)',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                        fontWeight: 600,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Stack spacing={1.2} sx={{ mt: 2 }}>
                {transporterData.map((item, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                    <Typography sx={{ fontSize: 12.5, flex: 1, color: 'text.secondary', fontWeight: 600 }} noWrap>{item.name}</Typography>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 800, color: PIE_COLORS[i % PIE_COLORS.length] }}>
                      {totalTransQty > 0 ? ((item.value / totalTransQty) * 100).toFixed(1) : 0}%
                    </Typography>
                  </Box>
                ))}
                {transporterData.length === 0 && (
                  <Typography sx={{ py: 2, textAlign: 'center', color: 'text.secondary', fontSize: 12.5, fontWeight: 500 }}>No transporter data for this period.</Typography>
                )}
              </Stack>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ p: 3, height: '100%' }}>
              <Box sx={{ mb: 2.5 }}>
                <Typography sx={{ fontWeight: 800, fontSize: 16, color: isDark ? '#fff' : '#0f172a' }}>Top Customers by Weight</Typography>
                <Typography sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 500 }}>Ranked by loaded cargo weight (MT)</Typography>
              </Box>
              <Stack spacing={2.2} sx={{ mt: 1.5 }}>
                {customerData.map((item, i) => {
                  const pct = totalCustomerQty > 0 ? (item.value / totalCustomerQty) * 100 : 0;
                  const color = PIE_COLORS[i % PIE_COLORS.length];
                  return (
                    <Box key={i}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.8 }}>
                        <Typography sx={{ fontSize: 13, fontWeight: 800, color: isDark ? '#fff' : '#1e293b' }}>{item.name}</Typography>
                        <Typography sx={{ fontSize: 12, fontWeight: 800, color }}>
                          {item.value.toFixed(1)} MT ({pct.toFixed(1)}%)
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{
                          height: 6, borderRadius: 3,
                          bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                          '& .MuiLinearProgress-bar': { background: `linear-gradient(90deg,${color}aa,${color})`, borderRadius: 3 }
                        }}
                      />
                    </Box>
                  );
                })}
                {customerData.length === 0 && (
                  <Typography sx={{ py: 3, textAlign: 'center', color: 'text.secondary', fontSize: 13, fontWeight: 500 }}>
                    No customer data for this period.
                  </Typography>
                )}
              </Stack>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Dispatches */}
        <Card>
          <Box sx={{
            px: 3, py: 2.5,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
          }}>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: 16, color: isDark ? '#fff' : '#0f172a' }}>Recent Shipments</Typography>
              <Typography sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 500 }}>Latest 6 dispatch actions</Typography>
            </Box>
            <Button endIcon={<ArrowIcon />} onClick={() => navigate('/dispatches')}
              sx={{ fontWeight: 700, fontSize: 12.5, color: '#6366f1' }}>
              View Dispatch Ledger
            </Button>
          </Box>
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>LR No.</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Destination</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Truck</TableCell>
                  <TableCell align="right">Qty</TableCell>
                  <TableCell align="right">Revenue</TableCell>
                  <TableCell align="right">Profit</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentDispatches.map(row => (
                  <TableRow key={row.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate('/dispatches')}>
                    <TableCell>
                      <Typography sx={{ fontWeight: 800, fontSize: 13, color: '#6366f1' }}>{row.lrNo}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: 12.5, fontWeight: 500, color: 'text.secondary' }}>
                        {new Date(row.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{row.customerName}</Typography>
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      <Chip label={row.destination} size="small"
                        sx={{ height: 22, fontSize: 11, fontWeight: 700,
                          bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(99,102,241,0.06)',
                          color: isDark ? '#94a3b8' : '#4f46e5',
                          border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(99,102,241,0.1)'}`
                        }} />
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      <Typography sx={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700,
                        color: isDark ? '#c8d2f6' : '#312e81',
                        bgcolor: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.05)',
                        border: `1px solid ${isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)'}`,
                        px: 1, py: 0.3, borderRadius: 1.5, display: 'inline-block',
                      }}>{row.truckNo}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{row.loadedQty.toFixed(1)} MT</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#10b981' }}>
                        ₹{row.samratBillAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={`${row.profit >= 0 ? '+' : ''}₹${Math.abs(row.profit).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                        size="small"
                        sx={{
                          height: 22, fontSize: 11.5, fontWeight: 800,
                          backgroundColor: row.profit >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
                          color: row.profit >= 0 ? '#10b981' : '#f43f5e',
                          border: `1px solid ${row.profit >= 0 ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)'}`,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {recentDispatches.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6, color: 'text.secondary', fontWeight: 500 }}>
                      No dispatches found for the selected period.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        </Card>
      </Box>
    </Box>
  );
};

export default Dashboard;
