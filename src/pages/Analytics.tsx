import React, { useMemo } from 'react';
import { 
  Box, 
  Card, 
  Typography, 
  Grid, 
  useTheme, 
  Stack 
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { useAppSelector } from '../hooks';

// ─── Custom Tooltip ──────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, prefix = '', suffix = '' }: any) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{
      p: 2, borderRadius: 3,
      background: isDark ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(10px)',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
      boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
      minWidth: 160,
    }}>
      <Typography sx={{ fontSize: 11.5, fontWeight: 800, mb: 1, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </Typography>
      {payload.map((p: any, i: number) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: i !== payload.length - 1 ? 0.6 : 0 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: p.color }} />
          <Typography sx={{ fontSize: 12.5, color: 'text.secondary', flex: 1, fontWeight: 500 }}>{p.name}</Typography>
          <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: p.color }}>
            {prefix}{Number(p.value).toLocaleString('en-IN', { maximumFractionDigits: 1 })}{suffix}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export const Analytics: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const dispatches = useAppSelector(state => state.dispatches.items);

  // 1. Calculate Monthly Performance aggregates
  const monthlyData = useMemo(() => {
    const monthlyMap: { 
      [key: string]: { 
        monthKey: string; 
        monthName: string;
        loadedQty: number; 
        paidQty: number;
        samratBillQty: number;
        revenue: number; 
        cost: number; 
        profit: number; 
      } 
    } = {};

    dispatches.forEach(d => {
      const dateObj = new Date(d.date);
      const year = dateObj.getFullYear();
      const monthIdx = dateObj.getMonth();
      const monthKey = `${year}-${String(monthIdx + 1).padStart(2, '0')}`;
      const monthName = dateObj.toLocaleString('default', { month: 'short', year: '2-digit' });

      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = {
          monthKey,
          monthName,
          loadedQty: 0,
          paidQty: 0,
          samratBillQty: 0,
          revenue: 0,
          cost: 0,
          profit: 0
        };
      }

      monthlyMap[monthKey].loadedQty += d.loadedQty;
      monthlyMap[monthKey].paidQty += d.paidQty;
      monthlyMap[monthKey].samratBillQty += d.samratBillQty;
      monthlyMap[monthKey].revenue += d.samratBillAmount;
      monthlyMap[monthKey].cost += d.paidAmount;
      monthlyMap[monthKey].profit += d.profit;
    });

    return Object.values(monthlyMap).sort((a, b) => a.monthKey.localeCompare(b.monthKey));
  }, [dispatches]);

  // 2. Transporter Rates & Yields comparison
  const transporterAverages = useMemo(() => {
    const tMap: { 
      [key: string]: { 
        name: string; 
        totalLoaded: number;
        avgOurRate: number; 
        avgSamratRate: number; 
        count: number; 
      } 
    } = {};

    dispatches.forEach(d => {
      const name = d.transporterName;
      if (!tMap[name]) {
        tMap[name] = { name, totalLoaded: 0, avgOurRate: 0, avgSamratRate: 0, count: 0 };
      }
      tMap[name].totalLoaded += d.loadedQty;
      tMap[name].avgOurRate += d.ourRate;
      tMap[name].avgSamratRate += d.samratRate;
      tMap[name].count += 1;
    });

    return Object.values(tMap).map(item => ({
      name: item.name,
      loadedQty: Number(item.totalLoaded.toFixed(1)),
      avgOurRate: Number((item.avgOurRate / item.count).toFixed(0)),
      avgSamratRate: Number((item.avgSamratRate / item.count).toFixed(0)),
      margin: Number(((item.avgSamratRate - item.avgOurRate) / item.count).toFixed(0))
    }));
  }, [dispatches]);

  // 3. Customer Quantity Contribution
  const customerQuantityContribution = useMemo(() => {
    const cMap: { [key: string]: { name: string; loadedQty: number; revenue: number } } = {};

    dispatches.forEach(d => {
      const name = d.customerName;
      if (!cMap[name]) {
        cMap[name] = { name, loadedQty: 0, revenue: 0 };
      }
      cMap[name].loadedQty += d.loadedQty;
      cMap[name].revenue += d.samratBillAmount;
    });

    return Object.values(cMap).sort((a, b) => b.loadedQty - a.loadedQty);
  }, [dispatches]);

  return (
    <Box sx={{ position: 'relative' }}>
      
      {/* Background glowing decorations */}
      <Box sx={{
        position: 'absolute', width: 400, height: 400, borderRadius: '50%',
        background: isDark ? 'radial-gradient(circle,rgba(99,102,241,0.05),transparent 70%)' : 'radial-gradient(circle,rgba(99,102,241,0.02),transparent 70%)',
        top: -150, right: -100, filter: 'blur(50px)', pointerEvents: 'none', zIndex: 0,
      }} />

      <Box sx={{ position: 'relative', zIndex: 1 }}>

        {/* Grid Row 1: Revenue & Cost Area Chart & Quantity Trend Chart */}
        <Grid container spacing={3.5} sx={{ mb: 3.5 }}>
          {/* Revenue & Cost Area Chart */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Card sx={{ p: 3 }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: isDark ? '#fff' : '#1e293b', fontSize: 15 }}>
                  Billing Revenue vs Transporter Cost
                </Typography>
                <Typography sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 500 }}>Monthly cumulative financials comparison</Typography>
              </Box>
              <Box sx={{ height: 320, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={monthlyData}
                    margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.22}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.16}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'} />
                    <XAxis dataKey="monthName" tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} dy={8} />
                    <YAxis tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} dx={-8} />
                    <ChartTooltip content={<CustomTooltip prefix="₹" />} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: 10 }} />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" name="Billing Revenue" />
                    <Area type="monotone" dataKey="cost" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCost)" name="Transporter Cost" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          </Grid>

          {/* Monthly Quantity & Tonnage trends */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Card sx={{ p: 3 }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: isDark ? '#fff' : '#1e293b', fontSize: 15 }}>
                  Cargo Tonnage Trends (MT)
                </Typography>
                <Typography sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 500 }}>Audit of loaded weight, paid weight &amp; samrat billed weight</Typography>
              </Box>
              <Box sx={{ height: 320, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={monthlyData}
                    margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'} />
                    <XAxis dataKey="monthName" tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} dy={8} />
                    <YAxis tickFormatter={(val) => `${val} MT`} tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} dx={-8} />
                    <ChartTooltip content={<CustomTooltip suffix=" MT" />} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: 10 }} />
                    <Line type="monotone" dataKey="loadedQty" stroke="#3b82f6" activeDot={{ r: 6 }} strokeWidth={3} name="Loaded Quantity" />
                    <Line type="monotone" dataKey="paidQty" stroke="#f59e0b" strokeWidth={2.5} name="Paid Quantity" />
                    <Line type="monotone" dataKey="samratBillQty" stroke="#10b981" strokeWidth={2.5} name="Samrat Billed Qty" />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Grid Row 2: Profit Margin Trends & Transporter Rates Comparison */}
        <Grid container spacing={3.5} sx={{ mb: 3.5 }}>
          {/* Profit Margin Trends */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Card sx={{ p: 3, height: '100%' }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: isDark ? '#fff' : '#1e293b', fontSize: 15 }}>
                  Net Profit Margin (%)
                </Typography>
                <Typography sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 500 }}>Margin percentage tracking over time</Typography>
              </Box>
              <Box sx={{ height: 300, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={monthlyData.map(item => ({
                      ...item,
                      margin: Number(((item.profit / item.revenue) * 100).toFixed(1))
                    }))}
                    margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'} />
                    <XAxis dataKey="monthName" tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} dy={8} />
                    <YAxis tickFormatter={(val) => `${val}%`} tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} dx={-8} />
                    <ChartTooltip content={<CustomTooltip suffix="%" />} />
                    <Line type="monotone" dataKey="margin" stroke="#6366f1" strokeWidth={3.5} dot={{ r: 4, fill: '#6366f1', strokeWidth: 2 }} activeDot={{ r: 6 }} name="Margin" />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          </Grid>

          {/* Transporter performance & rates */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card sx={{ p: 3 }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: isDark ? '#fff' : '#1e293b', fontSize: 15 }}>
                  Transporter Rate Spread Comparison
                </Typography>
                <Typography sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 500 }}>Customer billing vs transporter payout rates (₹/MT)</Typography>
              </Box>
              <Box sx={{ height: 300, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={transporterAverages}
                    margin={{ top: 10, right: 10, left: -15, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} dy={8} />
                    <YAxis tickFormatter={(val) => `₹${val}`} tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} dx={-8} />
                    <ChartTooltip content={<CustomTooltip prefix="₹" suffix=" / MT" />} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: 10 }} />
                    <Bar dataKey="avgSamratRate" fill="#06b6d4" name="Avg Customer Billing Rate" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="avgOurRate" fill="#f43f5e" name="Avg Transporter Payout Rate" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Grid Row 3: Customer volume contributions */}
        <Card sx={{ p: 3, mb: 4 }}>
          <Box sx={{ mb: 3.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: isDark ? '#fff' : '#1e293b', fontSize: 15 }}>
              Customer Volume Share (MT Shipped)
            </Typography>
            <Typography sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 500 }}>Total billing weight contribution across active clients</Typography>
          </Box>
          <Box sx={{ height: 350, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={customerQuantityContribution}
                margin={{ top: 5, right: 10, left: 30, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'} />
                <XAxis type="number" tickFormatter={(val) => `${val} MT`} tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11.5, fill: isDark ? '#94a3b8' : '#64748b', fontWeight: 700 }} axisLine={false} tickLine={false} />
                <ChartTooltip content={<CustomTooltip suffix=" MT" />} />
                <Bar dataKey="loadedQty" fill="#6366f1" name="Shipped Cargo Tonnage" radius={[0, 6, 6, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Card>
      </Box>
    </Box>
  );
};

export default Analytics;
