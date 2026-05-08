// src/components/house/HouseModal.jsx
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Grid, MenuItem, CircularProgress,
  Typography, Box, Divider, InputAdornment
} from '@mui/material'
import { HomeWork, Close } from '@mui/icons-material'
import { toast } from 'react-toastify'
import { createHouse, updateHouse, getUsers } from '../../api/actions'
import { addHouse, updateHouseInList } from '../../redux/slices/houseSlice'

const EMPTY = {
  house_number: '',
  address: '',
  rent: '',
  water_charge: '',
  last_current_unit: '',
  unit_per_cost: '7.00',
  advance_amount: '',
  status: 'vacant',
  tenant: '',
  description: '',
}

export default function HouseModal({ open, onClose, editData, onSuccess }) {
  const dispatch = useDispatch()
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [tenants, setTenants] = useState([])

  useEffect(() => {
    if (open) {
      setForm(editData
        ? {
            house_number: editData.house_number || '',
            address: editData.address || '',
            rent: editData.rent || '',
            water_charge: editData.water_charge || '',
            last_current_unit: editData.last_current_unit || '',
            unit_per_cost: editData.unit_per_cost || '7.00',
            advance_amount: editData.advance_amount || '',
            status: editData.status || 'vacant',
            tenant: editData.tenant || '',
            description: editData.description || '',
          }
        : EMPTY
      )
      fetchTenants()
    }
  }, [open, editData])

  const fetchTenants = async () => {
    try {
      const { data } = await getUsers()
      setTenants(Array.isArray(data) ? data.filter((u) => !u.is_staff && !u.is_superuser) : [])
    } catch { /* silently fail */ }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    if (!form.house_number || !form.rent) {
      toast.error('House number and rent are required')
      return
    }
    setLoading(true)
    try {
      const payload = {
        ...form,
        rent: parseFloat(form.rent),
        water_charge: parseFloat(form.water_charge) || 0,
        last_current_unit: parseFloat(form.last_current_unit) || 0,
        unit_per_cost: parseFloat(form.unit_per_cost) || 7,
        advance_amount: parseFloat(form.advance_amount) || 0,
        tenant: form.tenant || null,
      }

      if (editData) {
        const { data } = await updateHouse(editData.id, payload)
        dispatch(updateHouseInList(data))
        toast.success('House updated successfully ✅')
      } else {
        const { data } = await createHouse(payload)
        dispatch(addHouse(data))
        toast.success('House created successfully 🏠')
      }
      onSuccess?.()
      onClose()
    } catch (err) {
      const errors = err.response?.data
      if (errors && typeof errors === 'object') {
        Object.values(errors).flat().forEach((msg) => toast.error(msg))
      } else {
        toast.error('Operation failed. Please try again.')
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
              <HomeWork sx={{ color: '#E53935', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {editData ? 'Edit House' : 'Add New House'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#9E9E9E' }}>
                {editData ? 'Update property details' : 'Register a new rental property'}
              </Typography>
            </Box>
          </Box>
          <Button onClick={onClose} sx={{ minWidth: 0, color: '#9E9E9E' }}>
            <Close />
          </Button>
        </Box>
      </DialogTitle>

      <Divider sx={{ borderColor: 'rgba(229,57,53,0.15)' }} />

      <DialogContent sx={{ pt: 3 }}>
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="House Number *"
              name="house_number"
              value={form.house_number}
              onChange={handleChange}
              fullWidth
              placeholder="e.g. A-101"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Status"
              name="status"
              value={form.status}
              onChange={handleChange}
              select
              fullWidth
            >
              <MenuItem value="vacant">Vacant</MenuItem>
              <MenuItem value="occupied">Occupied</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Address"
              name="address"
              value={form.address}
              onChange={handleChange}
              fullWidth
              multiline
              rows={2}
              placeholder="Full address of the property"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Monthly Rent (₹) *"
              name="rent"
              type="number"
              value={form.rent}
              onChange={handleChange}
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Water Charge (₹)"
              name="water_charge"
              type="number"
              value={form.water_charge}
              onChange={handleChange}
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Advance Amount (₹)"
              name="advance_amount"
              type="number"
              value={form.advance_amount}
              onChange={handleChange}
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Last Current Unit (units)"
              name="last_current_unit"
              type="number"
              value={form.last_current_unit}
              onChange={handleChange}
              fullWidth
              placeholder="Previous electricity meter reading"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Unit Per Cost (₹)"
              name="unit_per_cost"
              type="number"
              value={form.unit_per_cost}
              onChange={handleChange}
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
              helperText="Cost per electricity unit"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Assign Tenant"
              name="tenant"
              value={form.tenant}
              onChange={handleChange}
              select
              fullWidth
            >
              <MenuItem value="">— No Tenant (Vacant) —</MenuItem>
              {tenants.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.username} ({t.email})
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Description / Notes"
              name="description"
              value={form.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={2}
              placeholder="Any additional notes about the property"
            />
          </Grid>
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
          disabled={loading}
          sx={{ minWidth: 120 }}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : editData ? 'Save Changes' : 'Create House'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
