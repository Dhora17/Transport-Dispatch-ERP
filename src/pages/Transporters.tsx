import React, { useState, useMemo } from 'react';
import {
  Box, Card, Typography, Grid, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Stack, TextField,
  MenuItem, Chip, Avatar, useTheme, LinearProgress, Button,
} from '@mui/material';
import {
  LocalShipping as TruckIcon, MonetizationOn as MoneyIcon,
  TrendingUp as ProfitIcon, Scale as ScaleIcon, GetApp as DownloadIcon,
  Business as CompanyIcon,
} from '@mui/icons-material';
import { useAppSelector } from '../hooks';
import { exportToExcel } from '../utils/excelHelper';

const AVATAR_COLORS = ['#6366f1','#06b6d4','#f59e0b','#10b981','#f43f5e','#8b5cf6','#ec4899'];

export const Transporters: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const dispatches = useAppSelector(state => state.dispatches.items);
  const [selected, setSelected] = useState<string>('');

  const summaries = useMemo(() => {
    const map: Record<string, {
      name: string; count: number; loadedQty: number; paidQty: number;
      paidAmount: number; revenue: number; profit: number;
    }> = {};
    dispatches.forEach(d => {
      const n = d.transporterName || 'Other';
      if (!map[n]) map[n] = { name: n, count: 0, loadedQty: 0, paidQty: 0, paidAmount: 0, revenue: 0, profit: 0 };
      map[n].count++;
      map[n].loadedQty   += d.loadedQty;
      map[n].paidQty     += d.paidQty;
      map[n].paidAmount  += d.paidAmount;
      map[n].revenue     += d.samratBillAmount;
      map[n].profit      += d.profit;
    });
    return Object.values(map).sort((a, b) => b.loadedQty - a.loadedQty);
  }, [dispatches]);

  const maxQty = summaries[0]?.loadedQty || 1;

  const filteredDispatches = useMemo(() =>
    selected ? dispatches.filter(d => d.transporterName === selected) : dispatches,
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
        background: isDark ? 'radial-gradient(circle,rgba(99,102,241,0.05),transparent 70%)' : 'radial-gradient(circle,rgba(99,102,241,0.02),transparent 70%)',
        top: -100, right: -100, filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0,
      }} />

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'flex-end', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 4 }}>
          <Button variant="outlined" startIcon={<DownloadIcon />}
            onClick={() => exportToExcel(filteredDispatches, `transporter_${selected || 'all'}`)}
            sx={{ borderRadius: 2.5, fontWeight: 700 }}>
            Export Transporters
          </Button>
        </Stack>

        {/* Overview KPIs */}
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {[
            { label: 'Active Transporters', value: summaries.length, color: '#6366f1', gradient: 'linear-gradient(135deg,#6366f1,#4f46e5)', icon: <CompanyIcon sx={{ fontSize: 20 }} /> },
            { label: 'Total Dispatches', value: totals.count, color: '#06b6d4', gradient: 'linear-gradient(135deg,#06b6d4,#0891b2)', icon: <TruckIcon sx={{ fontSize: 20 }} /> },
            { label: 'Total Weight (MT)', value: totals.qty.toLocaleString('en-IN', { maximumFractionDigits: 1 }), color: '#f59e0b', gradient: 'linear-gradient(135deg,#f59e0b,#d97706)', icon: <ScaleIcon sx={{ fontSize: 20 }} /> },
            { label: 'Net Profit Generated', value: `₹${(totals.profit/100000).toFixed(2)}L`, color: totals.profit >= 0 ? '#10b981' : '#f43f5e', gradient: totals.profit >= 0 ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#f43f5e,#e11d48)', icon: <ProfitIcon sx={{ fontSize: 20 }} /> },
          ].map((s, i) => (
            <Grid size={{ xs: 6, md: 3 }} key={i}>
              <Card sx={{
                p: 2.5,
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'}`,
                background: isDark ? 'linear-gradient(135deg,#0f172a 0%, #1e293b 100%)' : '#ffffff',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 44, height: 44, borderRadius: '12px', background: s.gradient, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px ${s.color}35`, flexShrink: 0 }}>
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
          {/* Transporter Cards */}
          <Grid size={{ xs: 12, lg: 5 }}>
            <Card sx={{ height: '100%' }}>
              <Box sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}>
                <Typography sx={{ fontWeight: 800, fontSize: 15 }}>Transporter Efficiency</Typography>
                <Typography sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 500 }}>Ranked by loaded weight volume</Typography>
              </Box>
              <Box sx={{ p: 2.5, maxHeight: 520, overflowY: 'auto',
                '&::-webkit-scrollbar': { width: 4 },
                '&::-webkit-scrollbar-track': { background: 'transparent' },
                '&::-webkit-scrollbar-thumb': { background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', borderRadius: 4 },
              }}>
                <Stack spacing={2}>
                  {summaries.map((s, i) => {
                    const isSelected = selected === s.name;
                    const pct = (s.loadedQty / maxQty) * 100;
                    const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
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
                        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.8 }}>
                          <Avatar sx={{ width: 36, height: 36, fontSize: 14, fontWeight: 800, bgcolor: color, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                            {s.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 800, fontSize: 13.5, lineHeight: 1.2, color: isDark ? '#fff' : '#1e293b' }} noWrap>{s.name}</Typography>
                            <Typography sx={{ fontSize: 11.5, color: 'text.secondary', fontWeight: 500 }}>{s.count} operations log</Typography>
                          </Box>
                          <Chip
                            label={s.profit >= 0 ? `+₹${(s.profit/1000).toFixed(0)}k` : `-₹${(Math.abs(s.profit)/1000).toFixed(0)}k`}
                            size="small"
                            sx={{ height: 22, fontSize: 11, fontWeight: 800,
                              bgcolor: s.profit >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
                              color: s.profit >= 0 ? '#10b981' : '#f43f5e',
                              border: `1px solid ${s.profit >= 0 ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)'}`
                            }}
                          />
                        </Stack>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                          <Typography sx={{ fontSize: 11.5, color: 'text.secondary', fontWeight: 600 }}>
                            {s.loadedQty.toFixed(1)} MT cargo
                          </Typography>
                          <Typography sx={{ fontSize: 11.5, fontWeight: 800, color }}>
                            {pct.toFixed(0)}% Capacity
                          </Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={pct}
                          sx={{ height: 5, borderRadius: 2.5, bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                            '& .MuiLinearProgress-bar': { background: `linear-gradient(90deg, ${color}cc, ${color})`, borderRadius: 2.5 } }} />
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
            </Card>
          </Grid>

          {/* Detail Table */}
          <Grid size={{ xs: 12, lg: 7 }}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: 15 }}>
                    {selected ? `${selected} — Manifest Log` : 'All Transporter Dispatches'}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 500 }}>
                    {filteredDispatches.length} dispatch logs {selected ? `filtered for ${selected}` : 'across all active transporters'}
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
                      <TableCell align="right">Qty (MT)</TableCell>
                      <TableCell align="right">Net Profit</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredDispatches.map(row => (
                      <TableRow key={row.id} hover>
                        <TableCell><Typography sx={{ fontWeight: 800, fontSize: 12.5, color: '#6366f1' }}>{row.lrNo}</Typography></TableCell>
                        <TableCell><Typography sx={{ fontSize: 12.5, fontWeight: 500, color: 'text.secondary' }}>{new Date(row.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</Typography></TableCell>
                        <TableCell><Typography sx={{ fontSize: 13, fontWeight: 700 }}>{row.customerName}</Typography></TableCell>
                        <TableCell>
                          <Chip label={row.destination} size="small"
                            sx={{ height: 20, fontSize: 11, fontWeight: 700, bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }} />
                        </TableCell>
                        <TableCell align="right"><Typography sx={{ fontWeight: 700, fontSize: 12.5 }}>{row.loadedQty.toFixed(1)} MT</Typography></TableCell>
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
                        <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary', fontWeight: 500 }}>
                          No dispatches found for this transporter.
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

export default Transporters;
