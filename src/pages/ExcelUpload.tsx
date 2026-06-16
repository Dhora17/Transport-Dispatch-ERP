import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Stack, Alert, Grid, Chip,
  IconButton, Tooltip, useTheme, Tabs, Tab, TextField, Divider,
  LinearProgress, InputAdornment
} from '@mui/material';
import {
  UploadFile as UploadIcon,
  CheckCircle as SuccessIcon,
  Cancel as ErrorIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Edit as ManualIcon,
  CloudUpload as CloudUploadIcon,
  TableChart as TableIcon,
  CalendarToday as DateIcon,
  LocalShipping as TruckIcon,
  Business as CompanyIcon,
  AttachMoney as MoneyIcon,
  LocationOn as LocIcon,
  Receipt as InvIcon,
  Scale as ScaleIcon,
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import confetti from 'canvas-confetti';
import { useAppDispatch } from '../hooks';
import { bulkImportDispatches } from '../features/dispatchSlice';

interface ParsedRow {
  date: string; lrNo: string; from: string; customerName: string;
  destination: string; invoiceNo: string; truckNo: string;
  loadedQty: number; paidQty: number; samratBillQty: number;
  ourRate: number; samratRate: number; transporterName: string;
  isValid: boolean; errors: string[];
}

export const ExcelUpload: React.FC = () => {
  const navigate  = useNavigate();
  const dispatch  = useAppDispatch();
  const fileRef   = useRef<HTMLInputElement>(null);
  const theme     = useTheme();
  const isDark    = theme.palette.mode === 'dark';

  const [tab, setTab] = useState(0);  // 0 = Excel Import, 1 = Manual Entry
  const [dragOver, setDragOver] = useState(false);

  // Excel upload state
  const [fileName, setFileName]         = useState('');
  const [parsedData, setParsedData]     = useState<ParsedRow[]>([]);
  const [summary, setSummary]           = useState<{ total: number; valid: number; invalid: number } | null>(null);
  const [errorMsg, setErrorMsg]         = useState<string | null>(null);
  const [saving, setSaving]             = useState(false);

  // Manual entry form state
  const [manualForm, setManualForm] = useState<Record<string, any>>({
    date: new Date().toISOString().split('T')[0],
    lrNo: '', from: '', customerName: '', destination: '',
    invoiceNo: '', truckNo: '', transporterName: '',
    loadedQty: '', paidQty: '', samratBillQty: '',
    ourRate: '', samratRate: '',
  });
  const [manualErrors, setManualErrors] = useState<string[]>([]);
  const [manualSuccess, setManualSuccess] = useState(false);

  // ── Validation ──────────────────────────────────────────────────────────────
  const validateRow = (row: any): { isValid: boolean; errors: string[]; validatedData: any } => {
    const errors: string[] = [];
    const rawDate      = row.date || row.Date || row['Dispatch Date'];
    const lrNo         = String(row.lrNo || row['LR Number'] || row['LR No'] || '').trim();
    const from         = String(row.from || row.From || row['From Location'] || '').trim();
    const customerName = String(row.customerName || row.Customer || row['Customer Name'] || row['To Customer'] || '').trim();
    const destination  = String(row.destination || row.Destination || '').trim();
    const invoiceNo    = String(row.invoiceNo || row['Invoice Number'] || row['Invoice No'] || '').trim();
    const truckNo      = String(row.truckNo || row['Truck Number'] || row['Truck No'] || '').trim().toUpperCase();
    const loadedQty    = Number(row.loadedQty || row['Loaded Quantity'] || row['Loaded Qty'] || 0);
    const paidQty      = Number(row.paidQty || row['Paid Quantity'] || row['Paid Qty'] || 0);
    const samratBillQty = Number(row.samratBillQty || row['Samrat Bill Quantity'] || row['Samrat Bill Qty'] || 0);
    const ourRate      = Number(row.ourRate || row['Our Rate'] || 0);
    const samratRate   = Number(row.samratRate || row['Samrat Rate'] || 0);
    const transporterName = String(row.transporterName || row['Transporter Name'] || row.transporter || '').trim();

    let dateStr = '';
    if (rawDate) {
      if (typeof rawDate === 'number') {
        const d = XLSX.SSF.parse_date_code(rawDate);
        dateStr = `${d.y}-${String(d.m).padStart(2,'0')}-${String(d.d).padStart(2,'0')}`;
      } else {
        const p = new Date(rawDate);
        if (!isNaN(p.getTime())) dateStr = p.toISOString().split('T')[0];
        else errors.push('Invalid date format (YYYY-MM-DD)');
      }
    } else {
      errors.push('Dispatch Date is required');
    }

    if (!lrNo) errors.push('LR Number is required');
    if (!customerName) errors.push('Customer Name is required');
    if (!transporterName) errors.push('Transporter Name is required');
    if (!truckNo) errors.push('Truck Number is required');
    if (truckNo && !/^[A-Z]{2}-\d{2}-[A-Z]{1,2}-\d{4}$/.test(truckNo)) errors.push('Invalid Truck format (e.g. MH-43-AL-9876)');
    if (isNaN(loadedQty) || loadedQty <= 0) errors.push('Loaded Weight must be > 0');
    if (isNaN(paidQty)   || paidQty <= 0)   errors.push('Paid Weight must be > 0');
    if (isNaN(samratBillQty) || samratBillQty <= 0) errors.push('Samrat Bill Weight must be > 0');
    if (isNaN(ourRate)   || ourRate <= 0)   errors.push('Transporter Rate must be > 0');
    if (isNaN(samratRate) || samratRate <= 0) errors.push('Samrat Rate must be > 0');

    return {
      isValid: errors.length === 0,
      errors,
      validatedData: { date: dateStr || rawDate || '', lrNo, from, customerName, destination, invoiceNo, truckNo, loadedQty, paidQty, samratBillQty, ourRate, samratRate, transporterName },
    };
  };

  const recalc = (data: ParsedRow[]) => {
    let valid = 0, invalid = 0;
    data.forEach(r => r.isValid ? valid++ : invalid++);
    setSummary({ total: data.length, valid, invalid });
  };

  // ── Excel file parse ────────────────────────────────────────────────────────
  const parseFile = (file: File) => {
    setFileName(file.name);
    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target?.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws);
        if (!data.length) { setErrorMsg('The uploaded file appears to be empty.'); return; }
        const rows: ParsedRow[] = data.map((row: any) => {
          const v = validateRow(row);
          return { ...v.validatedData, isValid: v.isValid, errors: v.errors };
        });
        setParsedData(rows);
        recalc(rows);
      } catch {
        setErrorMsg('Failed to parse file. Please use a valid .xlsx or .xls spreadsheet.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) parseFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f && (f.name.endsWith('.xlsx') || f.name.endsWith('.xls'))) parseFile(f);
    else setErrorMsg('Please drop a valid Excel file (.xlsx or .xls).');
  };

  const handleClear = () => {
    setFileName(''); setParsedData([]); setSummary(null); setErrorMsg(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  // ── Inline cell editing ─────────────────────────────────────────────────────
  const handleCellChange = (idx: number, field: keyof ParsedRow, value: any) => {
    const updated = [...parsedData];
    const v = validateRow({ ...updated[idx], [field]: value });
    updated[idx] = { ...v.validatedData, isValid: v.isValid, errors: v.errors };
    setParsedData(updated);
    recalc(updated);
  };

  const handleDeleteRow = (idx: number) => {
    const updated = parsedData.filter((_, i) => i !== idx);
    if (!updated.length) { handleClear(); return; }
    setParsedData(updated); recalc(updated);
  };

  // ── Save to store ────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const valid = parsedData.filter(d => d.isValid).map(({ isValid, errors, ...d }) => d);
    if (!valid.length) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    dispatch(bulkImportDispatches(valid));
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    setSaving(false);
    handleClear();
    navigate('/dispatches');
  };

  // ── Download template ────────────────────────────────────────────────────────
  const handleTemplate = () => {
    const sample = [{
      'Dispatch Date': '2026-06-16', 'LR Number': 'LR-2026-001',
      'From Location': 'Mumbai Port', 'To Customer': 'Samrat Industries',
      'Destination': 'Delhi Hub', 'Invoice Number': 'INV-9001',
      'Truck Number': 'MH-43-AL-9876', 'Loaded Quantity': 25.5,
      'Paid Quantity': 25.0, 'Samrat Bill Quantity': 25.2,
      'Our Rate': 1800, 'Samrat Rate': 2100, 'Transporter Name': 'Saini Logistics',
    }];
    const ws = XLSX.utils.json_to_sheet(sample);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'Samrat_Dispatch_Template.xlsx');
  };

  // ── Manual Entry ─────────────────────────────────────────────────────────────
  const validateManual = (form: Record<string, any>): string[] => {
    const errs: string[] = [];
    if (!form.date) errs.push('Date is required');
    if (!form.lrNo) errs.push('LR Number is required');
    if (!form.customerName) errs.push('Customer Name is required');
    if (!form.transporterName) errs.push('Transporter Name is required');
    if (!form.truckNo) errs.push('Truck Number is required');
    if (form.truckNo && !/^[A-Z]{2}-\d{2}-[A-Z]{1,2}-\d{4}$/i.test(form.truckNo))
      errs.push('Invalid Truck format (e.g. MH-43-AL-9876)');
    if (!form.loadedQty || Number(form.loadedQty) <= 0) errs.push('Loaded Qty must be > 0');
    if (!form.paidQty || Number(form.paidQty) <= 0) errs.push('Paid Qty must be > 0');
    if (!form.samratBillQty || Number(form.samratBillQty) <= 0) errs.push('Samrat Bill Qty must be > 0');
    if (!form.ourRate || Number(form.ourRate) <= 0) errs.push('Our Rate must be > 0');
    if (!form.samratRate || Number(form.samratRate) <= 0) errs.push('Samrat Rate must be > 0');
    return errs;
  };

  const handleManualChange = (field: string, value: any) => {
    const updated = { ...manualForm, [field]: value };
    setManualForm(updated);
    setManualErrors(validateManual(updated));
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateManual(manualForm);
    if (errs.length) { setManualErrors(errs); return; }
    dispatch(bulkImportDispatches([{
      date: manualForm.date, lrNo: manualForm.lrNo,
      from: manualForm.from, customerName: manualForm.customerName,
      destination: manualForm.destination, invoiceNo: manualForm.invoiceNo,
      truckNo: manualForm.truckNo.toUpperCase(),
      loadedQty: Number(manualForm.loadedQty), paidQty: Number(manualForm.paidQty),
      samratBillQty: Number(manualForm.samratBillQty),
      ourRate: Number(manualForm.ourRate), samratRate: Number(manualForm.samratRate),
      transporterName: manualForm.transporterName,
    }]));
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    setManualSuccess(true);
    setManualForm({
      date: new Date().toISOString().split('T')[0],
      lrNo: '', from: '', customerName: '', destination: '',
      invoiceNo: '', truckNo: '', transporterName: '',
      loadedQty: '', paidQty: '', samratBillQty: '',
      ourRate: '', samratRate: '',
    });
    setManualErrors([]);
    setTimeout(() => setManualSuccess(false), 4000);
  };

  // ── Field helper ────────────────────────────────────────────────────────────
  const F = ({
    label, field, type = 'text', xs = 12, sm = 6, md = 4, required = false, placeholder = '', icon
  }: {
    label: string; field: string; type?: string;
    xs?: number; sm?: number; md?: number; required?: boolean; placeholder?: string;
    icon?: React.ReactNode;
  }) => (
    <Grid size={{ xs, sm, md }}>
      <TextField
        fullWidth required={required}
        label={label} type={type}
        placeholder={placeholder}
        value={manualForm[field]}
        onChange={e => handleManualChange(field, e.target.value)}
        size="small"
        slotProps={{
          input: {
            startAdornment: icon ? <InputAdornment position="start">{icon}</InputAdornment> : undefined
          }
        }}
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
      />
    </Grid>
  );

  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const validPct = summary ? Math.round((summary.valid / summary.total) * 100) : 0;

  return (
    <Box sx={{ position: 'relative' }}>
      
      {/* Background glowing decorations */}
      <Box sx={{
        position: 'absolute', width: 350, height: 350, borderRadius: '50%',
        background: isDark ? 'radial-gradient(circle,rgba(6,182,212,0.04),transparent 70%)' : 'radial-gradient(circle,rgba(6,182,212,0.02),transparent 70%)',
        top: -100, right: -100, filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0,
      }} />

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}


        {/* Mode Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
          <Tabs
            value={tab}
            onChange={(_, v) => { setTab(v); handleClear(); setManualSuccess(false); }}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab
              icon={<CloudUploadIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label="Excel Bulk Import"
              sx={{ fontWeight: 700, textTransform: 'none', px: 3, minHeight: 48, fontSize: 13.5 }}
            />
            <Tab
              icon={<ManualIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label="Manual Entry Ledger"
              sx={{ fontWeight: 700, textTransform: 'none', px: 3, minHeight: 48, fontSize: 13.5 }}
            />
          </Tabs>
        </Box>

        {/* ── TAB 0: EXCEL IMPORT ───────────────────────────────────────────────── */}
        {tab === 0 && (
          <Box>
            {!fileName ? (
              <Grid container spacing={3.5}>
                {/* Drop Zone */}
                <Grid size={{ xs: 12, md: 8 }}>
                  <Box
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileRef.current?.click()}
                    sx={{
                      minHeight: 280, border: '2.5px dashed',
                      borderColor: dragOver ? 'primary.main' : (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)'),
                      borderRadius: 4,
                      background: dragOver
                        ? (isDark ? 'rgba(99,102,241,0.06)' : 'rgba(99,102,241,0.03)')
                        : (isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.005)'),
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', p: 4, gap: 1.2,
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        borderColor: 'primary.main',
                        background: isDark ? 'rgba(99,102,241,0.04)' : 'rgba(99,102,241,0.02)',
                        boxShadow: isDark ? 'inset 0 0 16px rgba(99,102,241,0.05)' : 'none',
                      },
                    }}
                  >
                    <input type="file" ref={fileRef} onChange={handleFileChange} accept=".xlsx,.xls" style={{ display: 'none' }} />
                    <Box sx={{
                      width: 60, height: 60, borderRadius: '14px', mb: 1,
                      background: 'linear-gradient(135deg,#6366f1,#06b6d4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 8px 20px rgba(99,102,241,0.35)',
                      animation: dragOver ? 'pulse 1.5s infinite' : 'none',
                      '@keyframes pulse': {
                        '0%, 100%': { transform: 'scale(1)' },
                        '50%': { transform: 'scale(1.08)' }
                      }
                    }}>
                      <UploadIcon sx={{ fontSize: 28, color: '#fff' }} />
                    </Box>
                    <Typography sx={{ fontWeight: 800, fontSize: 16 }}>
                      {dragOver ? 'Drop the manifest Excel here' : 'Drag & drop dispatch manifests'}
                    </Typography>
                    <Typography sx={{ color: 'text.secondary', fontSize: 13, fontWeight: 500 }}>
                      or click to explore storage — supports .xlsx and .xls formats
                    </Typography>
                    <Chip label="Supported format: .xlsx / .xls" size="small" sx={{ mt: 1, fontWeight: 700, bgcolor: 'rgba(99,102,241,0.08)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.15)' }} />
                  </Box>
                </Grid>

                {/* Side panel */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <Stack spacing={2} sx={{ height: '100%' }}>
                    <Card sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <Typography sx={{ fontWeight: 800, fontSize: 14, mb: 2, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'text.disabled' }}>Quick Integration Guide</Typography>
                      <Stack spacing={1.5}>
                        {[
                          'Retrieve columns naming convention from the Excel template.',
                          'Verify date is string format: YYYY-MM-DD.',
                          'Verify truck format matches standard format (e.g. MH-43-AL-9876).',
                          'Verify weight outputs (Loaded/Paid/Samrat) are above 0 MT.',
                          'You can audit and modify errors directly inside the preview grids.',
                        ].map((tip, i) => (
                          <Box key={i} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                            <Box sx={{
                              width: 20, height: 20, borderRadius: '6px', flexShrink: 0,
                              background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 10.5, fontWeight: 800,
                            }}>{i + 1}</Box>
                            <Typography sx={{ fontSize: 12.5, color: 'text.secondary', lineHeight: 1.5, fontWeight: 500 }}>{tip}</Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Card>
                    <Button
                      fullWidth variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={handleTemplate}
                      sx={{ borderRadius: 2.5, fontWeight: 700, py: 1.2 }}
                    >
                      Download Excel Template
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Summary bar */}
                <Card sx={{ p: 3 }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between', mb: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8 }}>
                      <Box sx={{
                        width: 44, height: 44, borderRadius: 2.5,
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', boxShadow: '0 4px 12px rgba(16,185,129,0.25)'
                      }}>
                        <TableIcon sx={{ fontSize: 22 }} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: 15, color: isDark ? '#fff' : '#1e293b' }}>{fileName}</Typography>
                        <Typography sx={{ fontSize: 12.5, color: 'text.secondary', fontWeight: 600 }}>
                          {summary?.total} manifest entries parsed
                        </Typography>
                      </Box>
                    </Box>
                    <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
                      {summary && (
                        <>
                          <Chip icon={<SuccessIcon sx={{ fontSize: '15px !important' }} />} label={`${summary.valid} Valid`} size="small"
                            sx={{ fontWeight: 700, bgcolor: 'rgba(16,185,129,0.08)', color: '#10b981', border: '1px solid rgba(16,185,129,0.18)', height: 26 }} />
                          <Chip icon={<ErrorIcon sx={{ fontSize: '15px !important' }} />} label={`${summary.invalid} Errors`} size="small"
                            sx={{ fontWeight: 700, bgcolor: 'rgba(244,63,94,0.08)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.18)', height: 26 }} />
                        </>
                      )}
                      <Button size="small" variant="outlined" color="error" startIcon={<DeleteIcon />}
                        onClick={handleClear} sx={{ borderRadius: 2, fontWeight: 700, height: 32, px: 2 }}>
                        Discard
                      </Button>
                      <Button size="small" variant="contained" startIcon={<SaveIcon />}
                        onClick={handleSave}
                        disabled={!summary || summary.valid === 0 || saving}
                        sx={{
                          borderRadius: 2, fontWeight: 700, height: 32, px: 2.5,
                          background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
                          boxShadow: '0 4px 12px rgba(99,102,241,0.25)'
                        }}>
                        {saving ? 'Ingesting...' : `Ingest ${summary?.valid || 0} Records`}
                      </Button>
                    </Stack>
                  </Stack>
                  {summary && (
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                        <Typography sx={{ fontSize: 11.5, color: 'text.secondary', fontWeight: 700 }}>Data Cleanliness Index</Typography>
                        <Typography sx={{ fontSize: 11.5, fontWeight: 800, color: validPct === 100 ? '#10b981' : validPct > 50 ? '#f59e0b' : '#f43f5e' }}>
                          {validPct}% Clean
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate" value={validPct}
                        sx={{
                          height: 6, borderRadius: 3,
                          bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                          '& .MuiLinearProgress-bar': {
                            background: validPct === 100
                              ? 'linear-gradient(90deg,#10b981,#059669)'
                              : validPct > 50
                                ? 'linear-gradient(90deg,#f59e0b,#d97706)'
                                : 'linear-gradient(90deg,#f43f5e,#e11d48)',
                            borderRadius: 3,
                          },
                        }}
                      />
                    </Box>
                  )}
                </Card>

                {errorMsg && <Alert severity="error" sx={{ mb: 2, borderRadius: 2.5 }}>{errorMsg}</Alert>}

                {/* Data Table */}
                <Card sx={{ overflow: 'hidden' }}>
                  <Box sx={{ overflowX: 'auto' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ width: 36 }}>#</TableCell>
                          <TableCell sx={{ minWidth: 100 }}>Date</TableCell>
                          <TableCell sx={{ minWidth: 120 }}>LR Number*</TableCell>
                          <TableCell sx={{ minWidth: 140 }}>Customer*</TableCell>
                          <TableCell sx={{ minWidth: 110 }}>Destination</TableCell>
                          <TableCell sx={{ minWidth: 110 }}>Truck No.*</TableCell>
                          <TableCell sx={{ minWidth: 135 }}>Transporter*</TableCell>
                          <TableCell sx={{ minWidth: 80 }}>Loaded Qty</TableCell>
                          <TableCell sx={{ minWidth: 80 }}>Our Rate</TableCell>
                          <TableCell sx={{ minWidth: 80 }}>Samrat Rate</TableCell>
                          <TableCell sx={{ width: 60 }}>Status</TableCell>
                          <TableCell sx={{ width: 44 }}></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {parsedData.map((row, idx) => {
                          const hasErr = !row.isValid;
                          const errBg = hasErr ? (isDark ? 'rgba(244,63,94,0.04)' : 'rgba(244,63,94,0.02)') : 'transparent';
                          const inp = (field: keyof ParsedRow, isNum = false) => (
                            <input
                              value={row[field] as string}
                              onChange={e => handleCellChange(idx, field, isNum ? e.target.value : e.target.value)}
                              style={{
                                width: '100%', border: 'none',
                                borderBottom: `1.5px dashed ${borderColor}`,
                                background: 'transparent',
                                padding: '3px 4px', fontSize: 12,
                                color: hasErr && (field === 'lrNo' || field === 'customerName' || field === 'transporterName' || field === 'truckNo') && !row[field] ? '#f43f5e' : 'inherit',
                                fontFamily: 'inherit', fontWeight: 600,
                                outline: 'none', borderRadius: 3,
                              }}
                            />
                          );
                          return (
                            <TableRow key={idx} sx={{ bgcolor: errBg, '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' } }}>
                              <TableCell>
                                <Typography sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 700 }}>{idx + 1}</Typography>
                              </TableCell>
                              <TableCell>{inp('date')}</TableCell>
                              <TableCell>{inp('lrNo')}</TableCell>
                              <TableCell>{inp('customerName')}</TableCell>
                              <TableCell>{inp('destination')}</TableCell>
                              <TableCell>{inp('truckNo')}</TableCell>
                              <TableCell>{inp('transporterName')}</TableCell>
                              <TableCell>{inp('loadedQty', true)}</TableCell>
                              <TableCell>{inp('ourRate', true)}</TableCell>
                              <TableCell>{inp('samratRate', true)}</TableCell>
                              <TableCell>
                                <Tooltip title={hasErr ? row.errors.join('\n') : 'Valid Row'}>
                                  {hasErr
                                    ? <ErrorIcon sx={{ fontSize: 18, color: '#f43f5e' }} />
                                    : <SuccessIcon sx={{ fontSize: 18, color: '#10b981' }} />
                                  }
                                </Tooltip>
                              </TableCell>
                              <TableCell>
                                <IconButton size="small" onClick={() => handleDeleteRow(idx)}
                                  sx={{ color: 'error.light', '&:hover': { bgcolor: 'rgba(244,63,94,0.08)' } }}>
                                  <DeleteIcon sx={{ fontSize: 15 }} />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </Box>
                </Card>
              </Box>
            )}
          </Box>
        )}

        {/* ── TAB 1: MANUAL ENTRY ───────────────────────────────────────────────── */}
        {tab === 1 && (
          <Box>
            {manualSuccess && (
              <Alert severity="success" icon={<SuccessIcon />} sx={{ mb: 3.5, borderRadius: 2.5, fontWeight: 700 }}>
                Dispatch ledger record logged successfully! Ready for next manual entry.
              </Alert>
            )}

            <Card sx={{ p: { xs: 2.5, sm: 4 } }}>
              <Box sx={{ mb: 3.5 }}>
                <Typography sx={{ fontWeight: 800, fontSize: 16, color: isDark ? '#fff' : '#0f172a' }}>Enter Dispatch Details</Typography>
                <Typography sx={{ fontSize: 12.5, color: 'text.secondary', fontWeight: 500 }}>
                  Manually fill in the manifest details below. All fields marked with * are strictly required.
                </Typography>
              </Box>

              {manualErrors.length > 0 && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2.5 }}>
                  <Typography sx={{ fontWeight: 800, mb: 0.5, fontSize: 13.5 }}>Please address validation errors:</Typography>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {manualErrors.map((e, i) => <li key={i} style={{ fontSize: 12.5, fontWeight: 600 }}>{e}</li>)}
                  </ul>
                </Alert>
              )}

              <Box component="form" onSubmit={handleManualSubmit}>
                {/* Section 1: Shipment Info */}
                <Typography sx={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'text.disabled', mb: 2 }}>
                  Shipment &amp; Destination Info
                </Typography>
                <Grid container spacing={2.5} sx={{ mb: 4 }}>
                  <F label="Dispatch Date *" field="date" type="date" xs={12} sm={6} md={4} required icon={<DateIcon sx={{ fontSize: 16, color: 'text.secondary' }} />} />
                  <F label="LR Number *" field="lrNo" xs={12} sm={6} md={4} required placeholder="e.g. LR-2026-001" icon={<InvIcon sx={{ fontSize: 16, color: 'text.secondary' }} />} />
                  <F label="Invoice Number" field="invoiceNo" xs={12} sm={6} md={4} placeholder="e.g. INV-9001" icon={<InvIcon sx={{ fontSize: 16, color: 'text.secondary' }} />} />
                  <F label="From Location" field="from" xs={12} sm={6} md={4} placeholder="e.g. Mumbai Port" icon={<LocIcon sx={{ fontSize: 16, color: 'text.secondary' }} />} />
                  <F label="Destination" field="destination" xs={12} sm={6} md={4} placeholder="e.g. Delhi Hub" icon={<LocIcon sx={{ fontSize: 16, color: 'text.secondary' }} />} />
                  <F label="Truck Number *" field="truckNo" xs={12} sm={6} md={4} required placeholder="MH-43-AL-9876" icon={<TruckIcon sx={{ fontSize: 16, color: 'text.secondary' }} />} />
                </Grid>

                <Divider sx={{ my: 3.5 }} />

                {/* Section 2: Parties */}
                <Typography sx={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'text.disabled', mb: 2 }}>
                  Carrier &amp; Consignee
                </Typography>
                <Grid container spacing={2.5} sx={{ mb: 4 }}>
                  <F label="Customer Name *" field="customerName" xs={12} sm={6} required placeholder="e.g. Samrat Industries" icon={<CompanyIcon sx={{ fontSize: 16, color: 'text.secondary' }} />} />
                  <F label="Transporter Name *" field="transporterName" xs={12} sm={6} required placeholder="e.g. Saini Logistics" icon={<CompanyIcon sx={{ fontSize: 16, color: 'text.secondary' }} />} />
                </Grid>

                <Divider sx={{ my: 3.5 }} />

                {/* Section 3: Quantities & Rates */}
                <Typography sx={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'text.disabled', mb: 2 }}>
                  Cargo Quantities &amp; Pricing
                </Typography>
                <Grid container spacing={2.5} sx={{ mb: 4 }}>
                  <F label="Loaded Qty (MT) *" field="loadedQty" type="number" xs={12} sm={6} md={4} required icon={<ScaleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />} />
                  <F label="Paid Qty (MT) *" field="paidQty" type="number" xs={12} sm={6} md={4} required icon={<ScaleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />} />
                  <F label="Samrat Bill Qty (MT) *" field="samratBillQty" type="number" xs={12} sm={6} md={4} required icon={<ScaleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />} />
                  <F label="Transporter Rate (₹/MT) *" field="ourRate" type="number" xs={12} sm={6} md={6} required icon={<Typography sx={{ fontSize: 13, fontWeight: 800, color: 'text.secondary' }}>₹</Typography>} />
                  <F label="Samrat Billing Rate (₹/MT) *" field="samratRate" type="number" xs={12} sm={6} md={6} required icon={<Typography sx={{ fontSize: 13, fontWeight: 800, color: 'text.secondary' }}>₹</Typography>} />
                </Grid>

                {/* Computed preview */}
                {Number(manualForm.loadedQty) > 0 && Number(manualForm.ourRate) > 0 && Number(manualForm.samratRate) > 0 && (
                  <Card sx={{
                    p: 2.5, mb: 4, border: '1px solid', borderColor: 'divider',
                    bgcolor: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(99,102,241,0.01)',
                    boxShadow: 'none', borderRadius: 3
                  }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 800, color: 'text.disabled', mb: 2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Calculated Financial Forecast
                    </Typography>
                    <Grid container spacing={2.5}>
                      {[
                        { label: 'Outward Carrier Cost', val: `₹${(Number(manualForm.paidQty || manualForm.loadedQty) * Number(manualForm.ourRate)).toLocaleString('en-IN')}`, color: '#f43f5e' },
                        { label: 'Samrat Invoice Revenue', val: `₹${(Number(manualForm.samratBillQty || manualForm.loadedQty) * Number(manualForm.samratRate)).toLocaleString('en-IN')}`, color: '#10b981' },
                        { label: 'Estimated net Profit', val: `₹${((Number(manualForm.samratBillQty || manualForm.loadedQty) * Number(manualForm.samratRate)) - (Number(manualForm.paidQty || manualForm.loadedQty) * Number(manualForm.ourRate))).toLocaleString('en-IN')}`, color: '#6366f1' },
                      ].map(c => (
                        <Grid size={{ xs: 12, sm: 4 }} key={c.label}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography sx={{ fontSize: 11.5, color: 'text.secondary', fontWeight: 700, mb: 0.5 }}>{c.label}</Typography>
                            <Typography sx={{ fontSize: 20, fontWeight: 900, color: c.color }}>{c.val}</Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Card>
                )}

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
                  <Button
                    type="button" variant="outlined"
                    onClick={() => {
                      setManualForm({
                        date: new Date().toISOString().split('T')[0],
                        lrNo: '', from: '', customerName: '', destination: '',
                        invoiceNo: '', truckNo: '', transporterName: '',
                        loadedQty: '', paidQty: '', samratBillQty: '',
                        ourRate: '', samratRate: '',
                      });
                      setManualErrors([]);
                    }}
                    sx={{ borderRadius: 2.5, fontWeight: 700 }}
                  >
                    Reset Form
                  </Button>
                  <Button
                    type="submit" variant="contained"
                    startIcon={<SaveIcon />}
                    sx={{
                      borderRadius: 2.5, fontWeight: 700, px: 3.5,
                      background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
                      boxShadow: '0 4px 14px rgba(99,102,241,0.25)',
                      '&:hover': {
                        background: 'linear-gradient(135deg,#4f46e5,#3730a3)',
                        boxShadow: '0 6px 18px rgba(99,102,241,0.35)',
                      },
                    }}
                  >
                    Save Dispatch Record
                  </Button>
                </Stack>
              </Box>
            </Card>

            {/* Navigate hint */}
            <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: 13, color: 'text.secondary', fontWeight: 500 }}>
                Audited records immediately sync to the
              </Typography>
              <Button size="small" onClick={() => navigate('/dispatches')} sx={{ fontSize: 13, fontWeight: 800, color: 'primary.main', p: 0, minWidth: 0, textTransform: 'none' }}>
                Ledger List →
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ExcelUpload;
