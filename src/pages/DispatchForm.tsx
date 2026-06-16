import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  Stack, 
  Divider,
  Breadcrumbs, 
  Link as MuiLink 
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../hooks';
import { addDispatch, updateDispatch } from '../features/dispatchSlice';
import { DispatchRecord } from '../types';

interface FormInputs {
  date: string;
  lrNo: string;
  from: string;
  customerName: string;
  destination: string;
  invoiceNo: string;
  truckNo: string;
  loadedQty: number;
  paidQty: number;
  samratBillQty: number;
  ourRate: number;
  samratRate: number;
  transporterName: string;
}

export const DispatchForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const dispatches = useAppSelector(state => state.dispatches.items);
  const currentUser = useAppSelector(state => state.auth.currentUser);

  const isEditMode = !!id;

  // Find existing record for Edit mode
  const existingRecord = isEditMode 
    ? dispatches.find(item => item.id === id) 
    : null;

  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<FormInputs>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      lrNo: '',
      from: '',
      customerName: '',
      destination: '',
      invoiceNo: '',
      truckNo: '',
      loadedQty: 0,
      paidQty: 0,
      samratBillQty: 0,
      ourRate: 0,
      samratRate: 0,
      transporterName: ''
    }
  });

  // Watch fields for live calculations
  const watchedPaidQty = watch('paidQty') || 0;
  const watchedOurRate = watch('ourRate') || 0;
  const watchedSamratBillQty = watch('samratBillQty') || 0;
  const watchedSamratRate = watch('samratRate') || 0;

  const livePaidAmount = Number(watchedPaidQty) * Number(watchedOurRate);
  const liveSamratBillAmount = Number(watchedSamratBillQty) * Number(watchedSamratRate);
  const liveProfit = liveSamratBillAmount - livePaidAmount;

  // Enforce role permission checks: only Admin and Manager can create/edit
  useEffect(() => {
    if (currentUser && currentUser.role === 'Operator') {
      navigate('/dispatches');
    }
  }, [currentUser, navigate]);

  // Load existing data when in edit mode
  useEffect(() => {
    if (isEditMode && existingRecord) {
      reset({
        date: existingRecord.date,
        lrNo: existingRecord.lrNo,
        from: existingRecord.from,
        customerName: existingRecord.customerName,
        destination: existingRecord.destination,
        invoiceNo: existingRecord.invoiceNo,
        truckNo: existingRecord.truckNo,
        loadedQty: existingRecord.loadedQty,
        paidQty: existingRecord.paidQty,
        samratBillQty: existingRecord.samratBillQty,
        ourRate: existingRecord.ourRate,
        samratRate: existingRecord.samratRate,
        transporterName: existingRecord.transporterName
      });
    }
  }, [isEditMode, existingRecord, reset]);

  const onSubmit = (data: FormInputs) => {
    if (isEditMode && id) {
      dispatch(updateDispatch({
        id,
        ...data
      }));
    } else {
      dispatch(addDispatch(data));
    }
    navigate('/dispatches');
  };

  return (
    <Box>
      {/* Breadcrumbs Navigation */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <MuiLink 
          underline="hover" 
          color="inherit" 
          href="#" 
          onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}
          sx={{ fontSize: 13, fontWeight: 500 }}
        >
          Dashboard
        </MuiLink>
        <MuiLink
          underline="hover"
          color="inherit"
          href="#"
          onClick={(e) => { e.preventDefault(); navigate('/dispatches'); }}
          sx={{ fontSize: 13, fontWeight: 500 }}
        >
          Dispatches
        </MuiLink>
        <Typography color="text.primary" sx={{ fontSize: 13, fontWeight: 600 }}>
          {isEditMode ? 'Edit Dispatch' : 'Add New Dispatch'}
        </Typography>
      </Breadcrumbs>

      {/* Header and Back Button */}
      <Stack direction="row" spacing={1.5} sx={{ mb: 4, alignItems: 'center' }}>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dispatches')}
          sx={{ borderRadius: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          {isEditMode ? 'Edit Dispatch' : 'Log New Dispatch'}
        </Typography>
      </Stack>

      <Grid container spacing={3}>
        {/* Main Form Fields */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ p: 2 }}>
            <CardContent>
              <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                <Grid container spacing={2.5}>
                  
                  {/* Row 1: Date & LR Number */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name="date"
                      control={control}
                      rules={{ required: 'Dispatch date is required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          type="date"
                          label="Dispatch Date"
                          slotProps={{ inputLabel: { shrink: true } }}
                          error={!!errors.date}
                          helperText={errors.date?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name="lrNo"
                      control={control}
                      rules={{ required: 'LR Number is required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="LR Number"
                          placeholder="e.g. LR-2026-999"
                          error={!!errors.lrNo}
                          helperText={errors.lrNo?.message}
                        />
                      )}
                    />
                  </Grid>

                  {/* Row 2: From Location & Destination */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name="from"
                      control={control}
                      rules={{ required: 'From location is required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="From Location"
                          placeholder="e.g. Mumbai Port"
                          error={!!errors.from}
                          helperText={errors.from?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name="destination"
                      control={control}
                      rules={{ required: 'Destination is required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Destination"
                          placeholder="e.g. Hyderabad"
                          error={!!errors.destination}
                          helperText={errors.destination?.message}
                        />
                      )}
                    />
                  </Grid>

                  {/* Row 3: Customer Name & Transporter Name */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name="customerName"
                      control={control}
                      rules={{ required: 'Customer name is required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Customer Name"
                          placeholder="e.g. Reliance Industries"
                          error={!!errors.customerName}
                          helperText={errors.customerName?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name="transporterName"
                      control={control}
                      rules={{ required: 'Transporter name is required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Transporter Name"
                          placeholder="e.g. Saini Logistics"
                          error={!!errors.transporterName}
                          helperText={errors.transporterName?.message}
                        />
                      )}
                    />
                  </Grid>

                  {/* Row 4: Invoice Number & Truck Number */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name="invoiceNo"
                      control={control}
                      rules={{ required: 'Invoice Number is required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Invoice Number"
                          placeholder="e.g. INV-9900"
                          error={!!errors.invoiceNo}
                          helperText={errors.invoiceNo?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name="truckNo"
                      control={control}
                      rules={{ 
                        required: 'Truck Number is required',
                        pattern: {
                          value: /^[A-Z]{2}-\d{2}-[A-Z]{1,2}-\d{4}$/,
                          message: 'Valid Indian Truck No format required (e.g. MH-43-AL-9876)'
                        }
                      }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Truck Number"
                          placeholder="e.g. MH-43-AL-9876"
                          error={!!errors.truckNo}
                          helperText={errors.truckNo?.message || "Format: MH-43-AL-9876"}
                        />
                      )}
                    />
                  </Grid>

                  {/* Row 5: Loaded, Paid and Samrat Bill Weight */}
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Controller
                      name="loadedQty"
                      control={control}
                      rules={{ required: 'Loaded weight is required', min: { value: 0.1, message: 'Must be greater than 0' } }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          type="number"
                          label="Loaded Weight (MT)"
                          error={!!errors.loadedQty}
                          helperText={errors.loadedQty?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Controller
                      name="paidQty"
                      control={control}
                      rules={{ required: 'Paid weight is required', min: { value: 0.1, message: 'Must be greater than 0' } }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          type="number"
                          label="Paid Weight (MT)"
                          error={!!errors.paidQty}
                          helperText={errors.paidQty?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Controller
                      name="samratBillQty"
                      control={control}
                      rules={{ required: 'Samrat Bill weight is required', min: { value: 0.1, message: 'Must be greater than 0' } }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          type="number"
                          label="Samrat Bill Qty (MT)"
                          error={!!errors.samratBillQty}
                          helperText={errors.samratBillQty?.message}
                        />
                      )}
                    />
                  </Grid>

                  {/* Row 6: Rates (Our Rate / Samrat Rate) */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name="ourRate"
                      control={control}
                      rules={{ required: 'Transporter rate is required', min: { value: 1, message: 'Must be positive' } }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          type="number"
                          label="Transporter Payout Rate (₹ / MT)"
                          error={!!errors.ourRate}
                          helperText={errors.ourRate?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name="samratRate"
                      control={control}
                      rules={{ required: 'Samrat rate is required', min: { value: 1, message: 'Must be positive' } }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          type="number"
                          label="Samrat Billing Rate (₹ / MT)"
                          error={!!errors.samratRate}
                          helperText={errors.samratRate?.message}
                        />
                      )}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button 
                    variant="outlined" 
                    color="inherit"
                    onClick={() => navigate('/dispatches')}
                    sx={{ borderRadius: 2 }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    startIcon={<SaveIcon />}
                    sx={{ borderRadius: 2 }}
                  >
                    {isEditMode ? 'Update Dispatch' : 'Save Dispatch'}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Live Calculation / Financial Invoice summary */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ height: '100%', border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Live Billing Preview
              </Typography>
              
              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total Paid Amount (Transporter Cost)
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'error.main', mt: 0.5 }}>
                    ₹{livePaidAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    Calculation: {watchedPaidQty} MT × ₹{watchedOurRate}
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Samrat Bill Amount (Customer Revenue)
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main', mt: 0.5 }}>
                    ₹{liveSamratBillAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    Calculation: {watchedSamratBillQty} MT × ₹{watchedSamratRate}
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Net Estimated Margin / Profit
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: liveProfit >= 0 ? 'success.main' : 'error.main', mt: 0.5 }}>
                    {liveProfit >= 0 ? '+' : ''}₹{liveProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Net profit from this single dispatch
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DispatchForm;
