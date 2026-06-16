import React, { useState, useMemo } from 'react';
import {
  Box, Card, Typography, Grid, Stack, Button, TextField,
  MenuItem, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, useTheme, Divider,
} from '@mui/material';
import {
  Assessment as ReportIcon, GetApp as DownloadIcon,
  DateRange as DateIcon, MonetizationOn as MoneyIcon,
  Scale as ScaleIcon, TrendingUp as ProfitIcon,
  FilterList as FilterIcon, LocalShipping as TruckIcon
} from '@mui/icons-material';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip as ChartTooltip, Cell,
} from 'recharts';
import { useAppSelector } from '../hooks';
import { exportToExcel } from '../utils/excelHelper';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const CustomTooltip = ({ active, payload, label }: any) => {
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
            ₹{Number(p.value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export const Reports: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const dispatches = useAppSelector(state => state.dispatches.items);

  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>(String(currentYear));

  const years = useMemo(() => {
    const ys = new Set(dispatches.map(d => new Date(d.date).getFullYear()));
    return Array.from(ys).sort((a, b) => b - a);
  }, [dispatches]);

  const filtered = useMemo(() => {
    return dispatches.filter(d => {
      const dt = new Date(d.date);
      const matchYear  = !selectedYear  || dt.getFullYear() === parseInt(selectedYear);
      const matchMonth = !selectedMonth || dt.getMonth()    === parseInt(selectedMonth);
      return matchYear && matchMonth;
    });
  }, [dispatches, selectedYear, selectedMonth]);

  // Monthly bar chart data
  const monthlyData = useMemo(() => {
    const map: Record<string, { month: string; Revenue: number; Cost: number; Profit: number }> = {};
    const src = selectedMonth ? filtered : dispatches.filter(d =>
      !selectedYear || new Date(d.date).getFullYear() === parseInt(selectedYear)
    );
    src.forEach(d => {
      const m = MONTHS[new Date(d.date).getMonth()];
      if (!map[m]) map[m] = { month: m, Revenue: 0, Cost: 0, Profit: 0 };
      map[m].Revenue += d.samratBillAmount;
      map[m].Cost    += d.paidAmount;
      map[m].Profit  += d.profit;
    });
    return MONTHS.filter(m => map[m]).map(m => map[m]);
  }, [dispatches, selectedYear, selectedMonth, filtered]);

  const totals = {
    count: filtered.length,
    qty: filtered.reduce((a, c) => a + c.loadedQty, 0),
    revenue: filtered.reduce((a, c) => a + c.samratBillAmount, 0),
    cost: filtered.reduce((a, c) => a + c.paidAmount, 0),
    profit: filtered.reduce((a, c) => a + c.profit, 0),
  };
  const margin = totals.revenue > 0 ? (totals.profit / totals.revenue) * 100 : 0;

  // Transporter summary
  const transporterSummary = useMemo(() => {
    const map: Record<string, { name: string; count: number; qty: number; profit: number }> = {};
    filtered.forEach(d => {
      const n = d.transporterName || 'Other';
      if (!map[n]) map[n] = { name: n, count: 0, qty: 0, profit: 0 };
      map[n].count++;
      map[n].qty    += d.loadedQty;
      map[n].profit += d.profit;
    });
    return Object.values(map).sort((a, b) => b.qty - a.qty);
  }, [filtered]);

  return (
    <Box sx={{ position: 'relative' }}>
      
      {/* Background glowing decorations */}
      <Box sx={{
        position: 'absolute', width: 350, height: 350, borderRadius: '50%',
        background: isDark ? 'radial-gradient(circle,rgba(99,102,241,0.05),transparent 70%)' : 'radial-gradient(circle,rgba(99,102,241,0.02),transparent 70%)',
        top: -100, right: -100, filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0,
      }} />

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4, justifyContent: 'flex-end', alignItems: { xs: 'flex-start', sm: 'center' } }}>
          <Button variant="contained" startIcon={<DownloadIcon />}
            onClick={() => exportToExcel(filtered, `report_${selectedYear}_${selectedMonth || 'all'}`)}
            sx={{
              fontWeight: 700, borderRadius: 2.5,
              background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
              boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
              '&:hover': {
                background: 'linear-gradient(135deg,#4f46e5,#3730a3)',
                boxShadow: '0 6px 20px rgba(99,102,241,0.45)',
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.2s'
            }}>
            Export Manifest Report
          </Button>
        </Stack>

        {/* Filters */}
        <Card sx={{ p: 2.5, mb: 3.5 }}>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mb: 2 }}>
            <FilterIcon sx={{ color: 'primary.main', fontSize: 20 }} />
            <Typography sx={{ fontWeight: 800, fontSize: 14.5, color: isDark ? '#fff' : '#1e293b' }}>Filter Period</Typography>
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField select fullWidth size="small" label="Year"
              value={selectedYear} onChange={e => setSelectedYear(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}>
              <MenuItem value="">All Years</MenuItem>
              {years.map(y => <MenuItem key={y} value={String(y)}>{y}</MenuItem>)}
            </TextField>
            <TextField select fullWidth size="small" label="Month"
              value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}>
              <MenuItem value="">All Months</MenuItem>
              {MONTHS.map((m, i) => <MenuItem key={m} value={String(i)}>{m}</MenuItem>)}
            </TextField>
            {(selectedYear || selectedMonth) && (
              <Button variant="outlined" color="inherit" onClick={() => { setSelectedYear(''); setSelectedMonth(''); }}
                sx={{ borderRadius: 2.5, whiteSpace: 'nowrap', fontWeight: 700, px: 3 }}>
                Clear Filters
              </Button>
            )}
          </Stack>
        </Card>

        {/* Summary KPIs */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {[
            { label: 'Dispatches Run', value: totals.count, color: '#6366f1' },
            { label: 'Tonnage Shipped (MT)', value: totals.qty.toLocaleString('en-IN', { maximumFractionDigits: 1 }), color: '#06b6d4' },
            { label: 'Invoiced Revenue', value: `₹${(totals.revenue/100000).toFixed(2)}L`, color: '#10b981' },
            { label: 'Carrier Outlay Cost', value: `₹${(totals.cost/100000).toFixed(2)}L`, color: '#f43f5e' },
            { label: 'Net Profit Margins', value: `₹${(totals.profit/100000).toFixed(2)}L`, color: '#f59e0b' },
            { label: 'Average Profit margin', value: `${margin.toFixed(1)}%`, color: '#8b5cf6' },
          ].map((s, i) => (
            <Grid size={{ xs: 6, sm: 4, md: 2 }} key={i}>
              <Card sx={{
                p: 2, textAlign: 'center',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'}`,
                background: isDark ? 'linear-gradient(135deg,rgba(255,255,255,0.01),rgba(255,255,255,0.02))' : '#ffffff',
                transition: 'transform 0.2s ease',
                '&:hover': { transform: 'translateY(-2px)' }
              }}>
                <Typography sx={{ fontWeight: 900, fontSize: 20, color: s.color, lineHeight: 1.2 }}>{s.value}</Typography>
                <Typography sx={{ fontSize: 11.5, color: 'text.secondary', mt: 0.6, fontWeight: 600 }}>{s.label}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3.5} sx={{ mb: 4 }}>
          {/* Bar Chart */}
          <Grid size={{ xs: 12, lg: 7 }}>
            <Card sx={{ p: 3 }}>
              <Box sx={{ mb: 3 }}>
                <Typography sx={{ fontWeight: 800, fontSize: 15, color: isDark ? '#fff' : '#1e293b' }}>Monthly Financial Overview</Typography>
                <Typography sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 500 }}>
                  Billing revenue, transporter payouts &amp; profit per month {selectedYear ? `— Fiscal ${selectedYear}` : ''}
                </Typography>
              </Box>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }} barSize={14}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'} vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} dy={8} />
                    <YAxis tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} dx={-8} />
                    <ChartTooltip content={<CustomTooltip />} />
                    <Bar dataKey="Revenue" name="Revenue" fill="#10b981" radius={[4,4,0,0]} />
                    <Bar dataKey="Cost"    name="Cost"    fill="#f43f5e" radius={[4,4,0,0]} />
                    <Bar dataKey="Profit"  name="Profit"  fill="#6366f1" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          </Grid>

          {/* Transporter Breakdown */}
          <Grid size={{ xs: 12, lg: 5 }}>
            <Card sx={{ p: 3, height: '100%' }}>
              <Box sx={{ mb: 2.5 }}>
                <Typography sx={{ fontWeight: 800, fontSize: 15, color: isDark ? '#fff' : '#1e293b' }}>Transporter Yield Distribution</Typography>
                <Typography sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 500 }}>Net capacity &amp; yield margins for selected period</Typography>
              </Box>
              <Stack spacing={1.2}>
                {transporterSummary.slice(0, 5).map((t, i) => {
                  const colors = ['#6366f1','#06b6d4','#f59e0b','#10b981','#f43f5e','#8b5cf6'];
                  const c = colors[i % colors.length];
                  return (
                    <Box key={t.name} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1, borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}` }}>
                      <Box sx={{ width: 34, height: 34, borderRadius: 2, background: `${c}12`, border: `1px solid ${c}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Typography sx={{ fontSize: 13, fontWeight: 900, color: c }}>{t.name.charAt(0)}</Typography>
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 13, lineHeight: 1.2, color: isDark ? '#fff' : '#1e293b' }} noWrap>{t.name}</Typography>
                        <Typography sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 500 }}>{t.count} dispatches • {t.qty.toFixed(1)} MT cargo</Typography>
                      </Box>
                      <Chip label={`${t.profit >= 0 ? '+' : ''}₹${(Math.abs(t.profit)/1000).toFixed(0)}k`} size="small"
                        sx={{ height: 22, fontSize: 11, fontWeight: 800,
                          bgcolor: t.profit >= 0 ? 'rgba(16,185,129,0.08)' : 'rgba(244,63,94,0.08)',
                          color: t.profit >= 0 ? '#10b981' : '#f43f5e',
                          border: `1px solid ${t.profit >= 0 ? 'rgba(16,185,129,0.18)' : 'rgba(244,63,94,0.18)'}`
                        }} />
                    </Box>
                  );
                })}
                {transporterSummary.length === 0 && (
                  <Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 4, fontSize: 12.5, fontWeight: 500 }}>No transporter metrics for selected period</Typography>
                )}
              </Stack>
            </Card>
          </Grid>
        </Grid>

        {/* Detailed Records Table */}
        <Card sx={{ mb: 4 }}>
          <Box sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}>
            <Typography sx={{ fontWeight: 800, fontSize: 15, color: isDark ? '#fff' : '#1e293b' }}>Detailed Auditing Log</Typography>
            <Typography sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 500 }}>Audit of {filtered.length} entries for selected filters</Typography>
          </Box>
          <TableContainer sx={{ maxHeight: 400,
            '&::-webkit-scrollbar': { width: 4 },
            '&::-webkit-scrollbar-track': { background: 'transparent' },
            '&::-webkit-scrollbar-thumb': { background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', borderRadius: 4 },
          }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>LR No.</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Destination</TableCell>
                  <TableCell>Transporter</TableCell>
                  <TableCell align="right">Qty (MT)</TableCell>
                  <TableCell align="right">Revenue</TableCell>
                  <TableCell align="right">Cost</TableCell>
                  <TableCell align="right">Net Profit</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.slice(0, 50).map(row => (
                  <TableRow key={row.id} hover>
                    <TableCell><Typography sx={{ fontSize: 12.5, fontWeight: 500, color: 'text.secondary' }}>{new Date(row.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</Typography></TableCell>
                    <TableCell><Typography sx={{ fontWeight: 800, fontSize: 12.5, color: '#6366f1' }}>{row.lrNo}</Typography></TableCell>
                    <TableCell><Typography sx={{ fontSize: 13, fontWeight: 700 }}>{row.customerName}</Typography></TableCell>
                    <TableCell><Chip label={row.destination} size="small" sx={{ height: 20, fontSize: 11, fontWeight: 700, bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }} /></TableCell>
                    <TableCell><Typography sx={{ fontSize: 12.5, color: 'text.secondary', fontWeight: 500 }}>{row.transporterName}</Typography></TableCell>
                    <TableCell align="right"><Typography sx={{ fontWeight: 700, fontSize: 12.5 }}>{row.loadedQty.toFixed(1)} MT</Typography></TableCell>
                    <TableCell align="right"><Typography sx={{ fontWeight: 800, fontSize: 12.5, color: '#10b981' }}>₹{row.samratBillAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</Typography></TableCell>
                    <TableCell align="right"><Typography sx={{ fontWeight: 800, fontSize: 12.5, color: '#f43f5e' }}>₹{row.paidAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</Typography></TableCell>
                    <TableCell align="right">
                      <Chip
                        label={`${row.profit >= 0 ? '+' : ''}₹${Math.abs(row.profit).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                        size="small"
                        sx={{
                          height: 20, fontSize: 11, fontWeight: 800,
                          backgroundColor: row.profit >= 0 ? 'rgba(16,185,129,0.08)' : 'rgba(244,63,94,0.08)',
                          color: row.profit >= 0 ? '#10b981' : '#f43f5e',
                          border: `1px solid ${row.profit >= 0 ? 'rgba(16,185,129,0.18)' : 'rgba(244,63,94,0.18)'}`
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 6, color: 'text.secondary', fontWeight: 500 }}>
                      No dispatch audits logged for selected period.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Box>
    </Box>
  );
};

export default Reports;
