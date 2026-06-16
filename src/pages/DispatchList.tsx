import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, Typography, Button, TextField, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, IconButton, Stack,
  MenuItem, Grid, Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, Chip, Tooltip, TablePagination, InputAdornment,
  Collapse, useTheme, Avatar, Badge,
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Search as SearchIcon, FilterList as FilterIcon, Clear as ClearIcon,
  KeyboardArrowDown as ExpandIcon, KeyboardArrowUp as CollapseIcon,
  GetApp as DownloadIcon, LocalShipping as TruckIcon,
  MonetizationOn as MoneyIcon, Scale as ScaleIcon, TrendingUp as ProfitIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../hooks';
import { deleteDispatch } from '../features/dispatchSlice';
import { DispatchRecord } from '../types';
import { exportToExcel } from '../utils/excelHelper';

const PROFIT_COLORS = {
  positive: { bg: 'rgba(16,185,129,0.08)', text: '#10b981', border: 'rgba(16,185,129,0.18)' },
  negative: { bg: 'rgba(244,63,94,0.08)',  text: '#f43f5e', border: 'rgba(244,63,94,0.18)' },
};

const ExpandableRow: React.FC<{
  row: DispatchRecord;
  userRole?: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ row, userRole, onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const canEdit = userRole === 'Admin' || userRole === 'Manager';
  const canDelete = userRole === 'Admin';
  const profit = row.profit;
  const pc = profit >= 0 ? PROFIT_COLORS.positive : PROFIT_COLORS.negative;

  return (
    <>
      <TableRow
        hover
        onClick={() => setOpen(!open)}
        sx={{
          cursor: 'pointer',
          '& > *': { borderBottom: open ? 'none !important' : undefined },
          backgroundColor: open ? (isDark ? 'rgba(99,102,241,0.04)' : 'rgba(99,102,241,0.02)') : 'inherit',
          transition: 'all 0.2s ease',
        }}
      >
        <TableCell sx={{ width: 48, pl: 2 }} onClick={(e) => e.stopPropagation()}>
          <IconButton size="small" onClick={() => setOpen(!open)}
            sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: 'rgba(99,102,241,0.08)' } }}>
            {open ? <CollapseIcon sx={{ fontSize: 18 }} /> : <ExpandIcon sx={{ fontSize: 18 }} />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Typography sx={{ fontWeight: 800, fontSize: 13, color: '#6366f1' }}>{row.lrNo}</Typography>
        </TableCell>
        <TableCell>
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: 'text.secondary' }}>
            {new Date(row.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </Typography>
        </TableCell>
        <TableCell>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: 13.5, color: isDark ? '#f8fafc' : '#1e293b' }}>{row.customerName}</Typography>
            <Typography sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 500 }}>{row.from}</Typography>
          </Box>
        </TableCell>
        <TableCell>
          <Chip label={row.destination} size="small"
            sx={{ height: 22, fontSize: 11, fontWeight: 700,
              bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', color: 'text.primary' }} />
        </TableCell>
        <TableCell>
          <Typography sx={{ fontFamily: 'monospace', fontSize: 12.5, fontWeight: 700,
            bgcolor: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.05)',
            border: `1px solid ${isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)'}`,
            px: 1, py: 0.3, borderRadius: 1.5, display: 'inline-block', color: isDark ? '#c8d2f6' : '#312e81',
          }}>{row.truckNo}</Typography>
        </TableCell>
        <TableCell align="right">
          <Typography sx={{ fontWeight: 700, fontSize: 13 }}>{row.loadedQty.toFixed(1)} MT</Typography>
        </TableCell>
        <TableCell align="right">
          <Typography sx={{ fontWeight: 800, fontSize: 13.5, color: '#10b981' }}>
            ₹{row.samratBillAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </Typography>
        </TableCell>
        <TableCell align="right">
          <Chip
            label={`${profit >= 0 ? '+' : ''}₹${Math.abs(profit).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
            size="small"
            sx={{ height: 22, fontSize: 11.5, fontWeight: 800,
              backgroundColor: pc.bg, color: pc.text, border: `1px solid ${pc.border}` }}
          />
        </TableCell>
        <TableCell align="center" onClick={(e) => e.stopPropagation()}>
          <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'center' }}>
            {canEdit && (
              <Tooltip title="Edit">
                <IconButton size="small" onClick={() => onEdit(row.id)}
                  sx={{ color: 'primary.main', '&:hover': { bgcolor: 'rgba(99,102,241,0.08)' } }}>
                  <EditIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            )}
            {canDelete && (
              <Tooltip title="Delete">
                <IconButton size="small" onClick={() => onDelete(row.id)}
                  sx={{ color: 'error.main', '&:hover': { bgcolor: 'rgba(244,63,94,0.08)' } }}>
                  <DeleteIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </TableCell>
      </TableRow>

      {/* Expanded detail row */}
      <TableRow onClick={() => setOpen(!open)} sx={{ backgroundColor: open ? (isDark ? 'rgba(99,102,241,0.04)' : 'rgba(99,102,241,0.02)') : 'inherit' }}>
        <TableCell colSpan={10} sx={{ p: 0, border: 'none' }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{
              px: 3, py: 2.5, mx: 3, mb: 2.5, borderRadius: 3,
              background: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(99,102,241,0.01)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(99,102,241,0.08)'}`,
              boxShadow: isDark ? 'inset 0 0 12px rgba(0,0,0,0.2)' : 'inset 0 0 12px rgba(99,102,241,0.02)',
            }}>
              <Typography sx={{ fontWeight: 800, fontSize: 11, mb: 2.5, color: 'text.disabled', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Invoice Details — LR {row.lrNo}
              </Typography>
              <Grid container spacing={3}>
                {[
                  { label: 'Invoice No.', value: row.invoiceNo || 'N/A' },
                  { label: 'Transporter', value: row.transporterName },
                  { label: 'From Location', value: row.from },
                  { label: 'Destination', value: row.destination },
                  { label: 'Loaded Qty', value: `${row.loadedQty} MT` },
                  { label: 'Paid Qty', value: `${row.paidQty} MT` },
                  { label: 'Samrat Bill Qty', value: `${row.samratBillQty} MT` },
                  { label: 'Our Rate', value: `₹${row.ourRate}/MT` },
                  { label: 'Samrat Rate', value: `₹${row.samratRate}/MT` },
                  { label: 'Paid Amount', value: `₹${row.paidAmount.toLocaleString('en-IN')}` },
                  { label: 'Samrat Bill Amt', value: `₹${row.samratBillAmount.toLocaleString('en-IN')}` },
                  { label: 'Net Profit', value: `₹${row.profit.toLocaleString('en-IN')}`, highlight: true },
                ].map((item, i) => (
                  <Grid size={{ xs: 6, sm: 4, md: 3 }} key={i}>
                    <Typography sx={{ fontSize: 10.5, color: 'text.disabled', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', mb: 0.6 }}>
                      {item.label}
                    </Typography>
                    <Typography sx={{
                      fontSize: 13.5, fontWeight: 700,
                      color: item.highlight ? (profit >= 0 ? '#10b981' : '#f43f5e') : 'text.primary',
                    }}>
                      {item.value}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export const DispatchList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const dispatches = useAppSelector(state => state.dispatches.items);
  const currentUser = useAppSelector(state => state.auth.currentUser);

  const [search, setSearch] = useState('');
  const [filterTransporter, setFilterTransporter] = useState('');
  const [filterDestination, setFilterDestination] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const transporters = useMemo(() => [...new Set(dispatches.map(d => d.transporterName).filter(Boolean))].sort(), [dispatches]);
  const destinations = useMemo(() => [...new Set(dispatches.map(d => d.destination).filter(Boolean))].sort(), [dispatches]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return dispatches.filter(d => {
      const matchSearch = !q || [d.lrNo, d.customerName, d.destination, d.truckNo, d.transporterName, d.invoiceNo]
        .some(f => f?.toLowerCase().includes(q));
      const matchTransporter = !filterTransporter || d.transporterName === filterTransporter;
      const matchDest = !filterDestination || d.destination === filterDestination;
      return matchSearch && matchTransporter && matchDest;
    });
  }, [dispatches, search, filterTransporter, filterDestination]);

  const totalQty    = filtered.reduce((a, c) => a + c.loadedQty, 0);
  const totalRev    = filtered.reduce((a, c) => a + c.samratBillAmount, 0);
  const totalProfit = filtered.reduce((a, c) => a + c.profit, 0);

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const canAdd = currentUser?.role === 'Admin' || currentUser?.role === 'Manager';

  const handleDelete = () => {
    if (deleteId) { dispatch(deleteDispatch(deleteId)); setDeleteId(null); }
  };

  const clearFilters = () => { setSearch(''); setFilterTransporter(''); setFilterDestination(''); };
  const hasFilters = search || filterTransporter || filterDestination;

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
          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" startIcon={<DownloadIcon />}
              onClick={() => exportToExcel(filtered, 'dispatch_records')}
              sx={{ fontWeight: 700, borderRadius: 2.5 }}>
              Export Excel
            </Button>
            {canAdd && (
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/dispatches/add')}
                sx={{
                  fontWeight: 700, borderRadius: 2.5,
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
                  '&:hover': { boxShadow: '0 6px 20px rgba(99,102,241,0.45)', transform: 'translateY(-1px)' },
                  transition: 'all 0.2s ease',
                }}>
                Add Dispatch
              </Button>
            )}
          </Stack>
        </Stack>

        {/* Summary Cards */}
        <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
          {[
            { label: 'Matched Records', value: filtered.length, icon: <TruckIcon sx={{ fontSize: 20 }} />, color: '#6366f1', gradient: 'linear-gradient(135deg,#6366f1,#4f46e5)' },
            { label: 'Loaded Qty (MT)', value: `${totalQty.toLocaleString('en-IN', { maximumFractionDigits: 1 })}`, icon: <ScaleIcon sx={{ fontSize: 20 }} />, color: '#06b6d4', gradient: 'linear-gradient(135deg,#06b6d4,#0891b2)' },
            { label: 'Total Revenue', value: `₹${(totalRev/100000).toFixed(2)}L`, icon: <MoneyIcon sx={{ fontSize: 20 }} />, color: '#10b981', gradient: 'linear-gradient(135deg,#10b981,#059669)' },
            { label: 'Net Profit', value: `₹${(totalProfit/100000).toFixed(2)}L`, icon: <ProfitIcon sx={{ fontSize: 20 }} />, color: totalProfit >= 0 ? '#f59e0b' : '#f43f5e', gradient: totalProfit >= 0 ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'linear-gradient(135deg,#f43f5e,#e11d48)' },
          ].map((s, i) => (
            <Grid size={{ xs: 6, md: 3 }} key={i}>
              <Card sx={{
                p: 2, display: 'flex', alignItems: 'center', gap: 2,
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'}`,
                background: isDark ? 'linear-gradient(135deg,#0f172a 0%, #1e293b 100%)' : '#ffffff',
              }}>
                <Box sx={{
                  width: 40, height: 40, borderRadius: '10px',
                  background: s.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', flexShrink: 0, boxShadow: `0 4px 12px ${s.color}35`
                }}>
                  {s.icon}
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 900, fontSize: 18, color: s.color, lineHeight: 1.1 }}>{s.value}</Typography>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.3, fontWeight: 600 }}>{s.label}</Typography>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Search & Filter Bar */}
        <Card sx={{ p: 2.5, mb: 3 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: 'center' }}>
            <TextField
              fullWidth
              placeholder="Search by LR Number, customer name, truck number, destination, transporter..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
              size="small"
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment>,
                  endAdornment: search && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearch('')}><ClearIcon sx={{ fontSize: 16 }} /></IconButton>
                    </InputAdornment>
                  ),
                }
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />
            <Button
              variant={showFilters ? 'contained' : 'outlined'}
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
              sx={{
                whiteSpace: 'nowrap', borderRadius: 2.5, fontWeight: 700, minWidth: 120, height: 40,
                boxShadow: showFilters && !isDark ? '0 2px 8px rgba(99,102,241,0.25)' : 'none'
              }}
            >
              {showFilters ? 'Hide Filters' : 'Filters'}
              {hasFilters && <Badge badgeContent="!" color="error" sx={{ ml: 1, '& .MuiBadge-badge': { fontWeight: 800 } }} />}
            </Button>
            {hasFilters && (
              <Button variant="text" startIcon={<ClearIcon />} onClick={clearFilters}
                sx={{ color: 'error.main', whiteSpace: 'nowrap', fontWeight: 700 }}>
                Reset
              </Button>
            )}
          </Stack>

          <Collapse in={showFilters}>
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField select fullWidth size="small" label="Filter by Transporter"
                  value={filterTransporter} onChange={e => { setFilterTransporter(e.target.value); setPage(0); }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}>
                  <MenuItem value="">All Transporters</MenuItem>
                  {transporters.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField select fullWidth size="small" label="Filter by Destination"
                  value={filterDestination} onChange={e => { setFilterDestination(e.target.value); setPage(0); }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}>
                  <MenuItem value="">All Destinations</MenuItem>
                  {destinations.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                </TextField>
              </Grid>
            </Grid>
          </Collapse>
        </Card>

        {/* Table */}
        <Card sx={{ overflow: 'hidden' }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 48 }} />
                  <TableCell>LR Number</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Customer / From</TableCell>
                  <TableCell>Destination</TableCell>
                  <TableCell>Truck No.</TableCell>
                  <TableCell align="right">Qty (MT)</TableCell>
                  <TableCell align="right">Revenue</TableCell>
                  <TableCell align="right">Profit</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 8 }}>
                      <TruckIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1.5 }} />
                      <Typography sx={{ color: 'text.secondary', fontWeight: 600, fontSize: 14.5 }}>
                        {hasFilters ? 'No records match your search query' : 'No dispatch ledger records found'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map(row => (
                    <ExpandableRow
                      key={row.id}
                      row={row}
                      userRole={currentUser?.role}
                      onEdit={id => navigate(`/dispatches/edit/${id}`)}
                      onDelete={id => setDeleteId(id)}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={filtered.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            sx={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}
          />
        </Card>

        {/* Delete Dialog */}
        <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5, pt: 3 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: 2.5, bgcolor: 'rgba(244,63,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DeleteIcon sx={{ color: 'error.main', fontSize: 20 }} />
            </Box>
            Delete Dispatch Record
          </DialogTitle>
          <DialogContent sx={{ py: 1.5 }}>
            <DialogContentText sx={{ fontSize: 14, fontWeight: 500, color: 'text.secondary', lineHeight: 1.6 }}>
              Are you sure you want to permanently delete this dispatch record? This will remove all associated invoice and profit calculation metrics. This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
            <Button onClick={() => setDeleteId(null)} variant="outlined" color="inherit" sx={{ borderRadius: 2.5 }}>Cancel</Button>
            <Button onClick={handleDelete} variant="contained" color="error" sx={{ borderRadius: 2.5, fontWeight: 700, boxShadow: '0 4px 12px rgba(244,63,94,0.3)' }}>Delete Record</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default DispatchList;
