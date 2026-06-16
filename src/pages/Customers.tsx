import React, { useState, useMemo } from 'react';
import {
  Box, Card, Typography, Grid, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Stack, Chip, Avatar,
  useTheme, LinearProgress, Button, InputAdornment, TextField,
} from '@mui/material';
import {
  People as PeopleIcon, MonetizationOn as MoneyIcon,
  TrendingUp as ProfitIcon, Scale as ScaleIcon,
  GetApp as DownloadIcon, Search as SearchIcon,
} from '@mui/icons-material';
import { useAppSelector } from '../hooks';
import { exportToExcel } from '../utils/excelHelper';

const AVATAR_COLORS = ['#6366f1','#f59e0b','#10b981','#f43f5e','#06b6d4','#8b5cf6','#ec4899','#14b8a6'];

export const Customers: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const dispatches = useAppSelector(state => state.dispatches.items);
  const [selected, setSelected] = useState<string>('');
  const [search, setSearch] = useState('');

  const summaries = useMemo(() => {
    const map: Record<string, {
      name: string; count: number; loadedQty: number;
      paidAmount: number; revenue: number; profit: number;
      destinations: string[];
    }> = {};
    dispatches.forEach(d => {
      const n = d.customerName || 'Other';
      if (!map[n]) map[n] = { name: n, count: 0, loadedQty: 0, paidAmount: 0, revenue: 0, profit: 0, destinations: [] };
      map[n].count++;
      map[n].loadedQty  += d.loadedQty;
      map[n].paidAmount += d.paidAmount;
      map[n].revenue    += d.samratBillAmount;
      map[n].profit     += d.profit;
      if (!map[n].destinations.includes(d.destination)) map[n].destinations.push(d.destination);
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [dispatches]);

  const filteredSummaries = summaries.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase())
  );

  const maxRevenue = summaries[0]?.revenue || 1;

  const filteredDispatches = useMemo(() =>
    selected ? dispatches.filter(d => d.customerName === selected) : dispatches,
    [dispatches, selected]
  );

  const totals = {
    count: summaries.reduce((a, c) => a + c.count, 0),
    qty: summaries.reduce((a, c) => a + c.loadedQty, 0),
    revenue: summaries.reduce((a, c) => a + c.revenue, 0),
    profit: summaries.reduce((a, c) => a + c.profit, 0),
  };

  return (
    <Box sx={{ position: 'relative' }}>
      
      {/* Background glowing decorations */}
      <Box sx={{
        position: 'absolute', width: 350, height: 350, borderRadius: '50%',
        background: isDark ? 'radial-gradient(circle,rgba(6,182,212,0.05),transparent 70%)' : 'radial-gradient(circle,rgba(6,182,212,0.02),transparent 70%)',
        top: -100, right: -100, filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0,
      }} />

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4, justifyContent: 'flex-end', alignItems: { xs: 'flex-start', sm: 'center' } }}>
          <Button variant="outlined" startIcon={<DownloadIcon />}
            onClick={() => exportToExcel(filteredDispatches, `customer_${selected || 'all'}`)}
            sx={{ borderRadius: 2.5, fontWeight: 700 }}>
            Export Customers
          </Button>
        </Stack>

        {/* Overview KPIs */}
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {[
            { label: 'Active Customers', value: summaries.length, color: '#6366f1', gradient: 'linear-gradient(135deg,#6366f1,#4f46e5)', icon: <PeopleIcon sx={{ fontSize: 20 }} /> },
            { label: 'Total Operations Log', value: totals.count, color: '#06b6d4', gradient: 'linear-gradient(135deg,#06b6d4,#0891b2)', icon: <ScaleIcon sx={{ fontSize: 20 }} /> },
            { label: 'Gross Revenue', value: `₹${(totals.revenue/100000).toFixed(2)}L`, color: '#10b981', gradient: 'linear-gradient(135deg,#10b981,#059669)', icon: <MoneyIcon sx={{ fontSize: 20 }} /> },
            { label: 'Net Profit Margins', value: `₹${(totals.profit/100000).toFixed(2)}L`, color: '#f59e0b', gradient: 'linear-gradient(135deg,#f59e0b,#d97706)', icon: <ProfitIcon sx={{ fontSize: 20 }} /> },
          ].map((s, i) => (
            <Grid size={{ xs: 6, md: 3 }} key={i}>
              <Card sx={{
                p: 2.5,
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'}`,
                background: isDark ? 'linear-gradient(135deg,#0f172a 0%, #1e293b 100%)' : '#ffffff',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 44, height: 44, borderRadius: '12px', background: s.gradient, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 4px 12px ${s.color}35` }}>
                    {s.icon}
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 900, fontSize: 20, color: s.color, lineHeight: 1.1 }}>{s.value}</Typography>
                    <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.3, fontWeight: 600 }}>{s.label}</Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3.5}>
          {/* Customer List */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Card sx={{ height: '100%' }}>
              <Box sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}>
                <Typography sx={{ fontWeight: 800, fontSize: 15, mb: 1.8 }}>Customer Directory</Typography>
                <TextField fullWidth size="small" placeholder="Search customer records..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment> } }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
                />
              </Box>
              <Box sx={{ maxHeight: 520, overflowY: 'auto', p: 2.5,
                '&::-webkit-scrollbar': { width: 4 },
                '&::-webkit-scrollbar-track': { background: 'transparent' },
                '&::-webkit-scrollbar-thumb': { background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', borderRadius: 4 },
              }}>
                <Stack spacing={1.5}>
                  {filteredSummaries.map((s, i) => {
                    const isSelected = selected === s.name;
                    const color = AVATAR_COLORS[summaries.indexOf(s) % AVATAR_COLORS.length];
                    const pct = (s.revenue / maxRevenue) * 100;
                    return (
                      <Box
                        key={s.name}
                        onClick={() => setSelected(isSelected ? '' : s.name)}
                        sx={{
                          p: 2, borderRadius: 3, cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          border: `1px solid ${isSelected ? `${color}50` : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)')}`,
                          background: isSelected ? `${color}12` : (isDark ? 'rgba(255,255,255,0.01)' : 'rgba(99,102,241,0.01)'),
                          boxShadow: isSelected ? `0 4px 20px ${color}10` : 'none',
                          '&:hover': {
                            border: `1px solid ${color}40`,
                            background: isSelected ? `${color}16` : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(99,102,241,0.02)'),
                            transform: 'translateY(-1px)',
                          },
                        }}
                      >
                        <Stack direction="row" sx={{ mb: 1.5, alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 34, height: 34, fontSize: 13, fontWeight: 800, bgcolor: color, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                            {s.name.charAt(0)}
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 800, fontSize: 13.5, lineHeight: 1.2, color: isDark ? '#fff' : '#1e293b' }} noWrap>{s.name}</Typography>
                            <Typography sx={{ fontSize: 11.5, color: 'text.secondary', fontWeight: 500 }}>{s.count} shipments ledger</Typography>
                          </Box>
                          <Typography sx={{ fontSize: 12.5, fontWeight: 800, color, flexShrink: 0 }}>
                            ₹{(s.revenue/100000).toFixed(1)}L
                          </Typography>
                        </Stack>
                        <LinearProgress variant="determinate" value={pct}
                          sx={{ height: 4, borderRadius: 2, bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                            '& .MuiLinearProgress-bar': { background: `linear-gradient(90deg, ${color}cc, ${color})`, borderRadius: 2 } }} />
                      </Box>
                    );
                  })}
                  {filteredSummaries.length === 0 && (
                    <Typography sx={{ py: 3, textAlign: 'center', color: 'text.secondary', fontSize: 13, fontWeight: 500 }}>
                      No customers match search term.
                    </Typography>
                  )}
                </Stack>
              </Box>
            </Card>
          </Grid>

          {/* Detail Table */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: 15 }}>
                    {selected ? `${selected} — Dispatch History` : 'All Client Shipment Logs'}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 500 }}>
                    {filteredDispatches.length} dispatch logs {selected ? `filtered for ${selected}` : 'across all clients'}
                  </Typography>
                </Box>
                {selected && (
                  <Chip label="Clear Filter" size="small" onClick={() => setSelected('')}
                    sx={{ cursor: 'pointer', fontWeight: 700, bgcolor: 'rgba(99,102,241,0.08)', color: '#818cf8', '&:hover': { bgcolor: 'rgba(99,102,241,0.15)' } }} />
                )}
              </Box>
              <TableContainer sx={{ flexGrow: 1, maxHeight: 480,
                '&::-webkit-scrollbar': { width: 4 },
                '&::-webkit-scrollbar-track': { background: 'transparent' },
                '&::-webkit-scrollbar-thumb': { background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', borderRadius: 4 },
              }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>LR No.</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Destination</TableCell>
                      <TableCell>Transporter</TableCell>
                      <TableCell align="right">Qty (MT)</TableCell>
                      <TableCell align="right">Revenue</TableCell>
                      <TableCell align="right">Net Profit</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredDispatches.map(row => (
                      <TableRow key={row.id} hover>
                        <TableCell><Typography sx={{ fontWeight: 800, fontSize: 12.5, color: '#6366f1' }}>{row.lrNo}</Typography></TableCell>
                        <TableCell><Typography sx={{ fontSize: 12.5, fontWeight: 500, color: 'text.secondary' }}>{new Date(row.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</Typography></TableCell>
                        <TableCell><Typography sx={{ fontWeight: 700, fontSize: 13 }}>{row.customerName}</Typography></TableCell>
                        <TableCell>
                          <Chip label={row.destination} size="small"
                            sx={{ height: 20, fontSize: 11, fontWeight: 700, bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }} />
                        </TableCell>
                        <TableCell><Typography sx={{ fontSize: 12.5, color: 'text.secondary', fontWeight: 500 }}>{row.transporterName}</Typography></TableCell>
                        <TableCell align="right"><Typography sx={{ fontWeight: 700, fontSize: 12.5 }}>{row.loadedQty.toFixed(1)} MT</Typography></TableCell>
                        <TableCell align="right"><Typography sx={{ fontWeight: 800, fontSize: 12.5, color: '#10b981' }}>₹{row.samratBillAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</Typography></TableCell>
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
                    {filteredDispatches.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 6, color: 'text.secondary', fontWeight: 500 }}>
                          No dispatch records found for this client.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Customers;
