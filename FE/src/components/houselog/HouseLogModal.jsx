// src/components/houselog/HouseLogModal.jsx
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Grid, MenuItem, CircularProgress,
  Typography, Box, Divider, Alert, InputAdornment, Paper
} from '@mui/material'
import { Receipt, Close, Bolt, Calculate } from '@mui/icons-material'
import { toast } from 'react-toastify'
import { createHouseLog, updateHouseLog } from '../../api/actions'
import { addHouseLog, updateHouseLogInList } from '../../redux/slices/houseLogSlice'

const EMPTY = {
  house: '',
  previous_unit: '',
  current_month_unit: '',
  balance: '0',
  status: 'pending',
}

export default function HouseLogModal({ open, onClose, editData, houses, onSuccess }) {
  const dispatch = useDispatch()
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [calc, setCalc] = useState(null)

  useEffect(() => {
    if (open) {
      setForm(editData
        ? {
            house: editData.house || '',
            previous_unit: editData.previous_unit || '',
            current_month_unit: editData.current_month_unit || '',
            balance: editData.balance || '0',
            status: editData.status || 'pending',
          }
        : EMPTY
      )
      setCalc(null)
    }
  }, [open, editData])

  // Auto-fill previous_unit from house's last_current_unit when house changes
  useEffect(() => {
    if (form.house && !editData) {
      const house = houses.find((h) => h.id === Number(form.house) || h.id === form.house)
      if (house) {
        setForm((prev) => ({ ...prev, previous_unit: String(house.last_current_unit || 0) }))
      }
    }
  }, [form.house])

  // Auto calculate whenever values change
  useEffect(() => {
    const selectedHouse = houses.find((h) => h.id === Number(form.house) || h.id === form.house)
    if (!selectedHouse) { setCalc(null); return }

    const prev = parseFloat(form.previous_unit) || 0
    const curr = parseFloat(form.current_month_unit) || 0
    const balance = parseFloat(form.balance) || 0
    const unitCost = parseFloat(selectedHouse.unit_per_cost) || 7
    const rent = parseFloat(selectedHouse.rent) || 0
    const water = parseFloat(selectedHouse.water_charge) || 0

    if (curr < prev) { setCalc(null); return }

    const unitsUsed = curr - prev
    const currentBill = unitsUsed * unitCost
    const total = rent + water + currentBill + balance

    setCalc({ rent, water, unitsUsed, unitCost, currentBill, balance, total })
  }, [form.house, form.previous_unit, form.current_month_unit, form.balance, houses])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    if (!form.house || !form.current_month_unit) {
      toast.error('House and current unit are required')
      return
    }
    if (!calc) {
      toast.error('Please check current unit (must be ≥ previous unit)')
      return
    }
    setLoading(true)
    try {
      const payload = {
        house: form.house,
        previous_unit: parseFloat(form.previous_unit) || 0,
        current_month_unit: parseFloat(form.current_month_unit),
        current_cost: calc.currentBill,
        balance: calc.balance,
        total: calc.total,
        status: form.status,
      }
      if (editData) {
        const { data } = await updateHouseLog(editData.id, payload)
        dispatch(updateHouseLogInList(data))
        toast.success('Rent log updated ✅')
      } else {
        const { data } = await createHouseLog(payload)
        dispatch(addHouseLog(data))
        toast.success('Rent log created 📋')
      }
      onSuccess?.()
      onClose()
    } catch (err) {
      const errors = err.response?.data
      if (errors && typeof errors === 'object') {
        Object.values(errors).flat().forEach((msg) => toast.error(msg))
      } else {
        toast.error('Operation failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 38, height: 38, borderRadius: '10px',
              bgcolor: 'rgba(229,57,53,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Receipt sx={{ color: '#E53935', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {editData ? 'Edit Rent Log' : 'New Rent Log'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#9E9E9E' }}>
                Monthly billing with auto calculation
              </Typography>
            </Box>
          </Box>
          <Button onClick={onClose} sx={{ minWidth: 0, color: '#9E9E9E' }}><Close /></Button>
        </Box>
      </DialogTitle>

      <Divider sx={{ borderColor: 'rgba(229,57,53,0.15)' }} />

      <DialogContent sx={{ pt: 3 }}>
        <Grid container spacing={2.5}>
          {/* House Select */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Select House *"
              name="house"
              value={form.house}
              onChange={handleChange}
              select
              fullWidth
            >
              {houses.map((h) => (
                <MenuItem key={h.id} value={h.id}>
                  House #{h.house_number} — {h.status}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Status */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Payment Status"
              name="status"
              value={form.status}
              onChange={handleChange}
              select
              fullWidth
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="paid">Paid</MenuItem>
              <MenuItem value="overdue">Overdue</MenuItem>
            </TextField>
          </Grid>

          {/* Units */}
          <Grid item xs={12} sm={4}>
            <TextField
              label="Previous Unit"
              name="previous_unit"
              type="number"
              value={form.previous_unit}
              onChange={handleChange}
              fullWidth
              InputProps={{
                endAdornment: <InputAdornment position="end"><Bolt sx={{ color: '#FFD600', fontSize: 18 }} /></InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Current Month Unit *"
              name="current_month_unit"
              type="number"
              value={form.current_month_unit}
              onChange={handleChange}
              fullWidth
              InputProps={{
                endAdornment: <InputAdornment position="end"><Bolt sx={{ color: '#FFD600', fontSize: 18 }} /></InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Carry-forward Balance (₹)"
              name="balance"
              type="number"
              value={form.balance}
              onChange={handleChange}
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
              helperText="From previous month"
            />
          </Grid>

          {/* Calculation Preview */}
          {calc && (
            <Grid item xs={12}>
              <Paper sx={{
                p: 2.5, borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(229,57,53,0.08) 0%, rgba(255,214,0,0.05) 100%)',
                border: '1px solid rgba(229,57,53,0.2)',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Calculate sx={{ color: '#FFD600', fontSize: 20 }} />
                  <Typography sx={{ fontWeight: 700, color: '#FFD600' }}>Bill Calculation</Typography>
                </Box>
                <Grid container spacing={1.5}>
                  {[
                    { label: 'Rent', value: `₹${calc.rent.toLocaleString()}`, color: '#E53935' },
                    { label: 'Water', value: `₹${calc.water.toLocaleString()}`, color: '#42A5F5' },
                    { label: `Electricity (${calc.unitsUsed} × ₹${calc.unitCost})`, value: `₹${calc.currentBill.toFixed(2)}`, color: '#FFD600' },
                    { label: 'Balance B/F', value: `₹${calc.balance.toLocaleString()}`, color: calc.balance > 0 ? '#FF7043' : '#9E9E9E' },
                  ].map((item) => (
                    <Grid item xs={6} sm={3} key={item.label}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ color: '#9E9E9E', display: 'block' }}>{item.label}</Typography>
                        <Typography sx={{ fontWeight: 700, color: item.color, fontSize: '0.95rem' }}>{item.value}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                <Divider sx={{ my: 2, borderColor: 'rgba(229,57,53,0.2)' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontWeight: 700, color: '#FAFAFA' }}>Total Amount Due</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#E53935' }}>
                    ₹{calc.total.toFixed(2)}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          )}

          {form.house && form.current_month_unit && parseFloat(form.current_month_unit) < parseFloat(form.previous_unit) && (
            <Grid item xs={12}>
              <Alert severity="error">
                Current unit cannot be less than previous unit!
              </Alert>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderColor: 'rgba(255,255,255,0.15)', color: '#9E9E9E' }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading || !calc}
          sx={{ minWidth: 140 }}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : editData ? 'Save Changes' : 'Create Log'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
