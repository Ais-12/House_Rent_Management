// src/pages/TenantPage.jsx
import { useEffect, useState } from 'react'
import {
  Box, Button, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton,
  Chip, Tooltip, TextField, InputAdornment, Skeleton,
  Avatar, Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, CircularProgress, Divider
} from '@mui/material'
import { Add, Edit, Delete, Search, Refresh, People, Close, Person } from '@mui/icons-material'
import { toast } from 'react-toastify'
import { getUsers, createUser, updateUser, deleteUser } from '../api/actions'
import ConfirmDialog from '../components/common/ConfirmDialog'

const EMPTY = { username: '', email: '', password: '', phone_number: '', aadhar_number: '' }

function TenantModal({ open, onClose, editData, onSuccess }) {
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(editData
        ? { username: editData.username || '', email: editData.email || '', password: '', phone_number: editData.phone_number || '', aadhar_number: editData.aadhar_number || '' }
        : EMPTY
      )
    }
  }, [open, editData])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async () => {
    if (!form.username || !form.email || (!editData && !form.password)) {
      toast.error('Username, email and password are required')
      return
    }
    setLoading(true)
    try {
      const payload = { ...form , role: 'tenant'}
      if (editData && !payload.password) delete payload.password
      if (editData) {
        await updateUser(editData.id, payload)
        toast.success('Tenant updated ✅')
      } else {
        await createUser(payload)
        toast.success('Tenant created 👤')
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 , bgcolor:'#0B2E33' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 38, height: 38, borderRadius: '10px', bgcolor: 'rgba(229,57,53,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Person sx={{ color: '#E53935', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{editData ? 'Edit Tenant' : 'Add Tenant'}</Typography>
              <Typography variant="caption" sx={{ color: '#9E9E9E' }}>Manage tenant account</Typography>
            </Box>
          </Box>
          <Button onClick={onClose} sx={{ minWidth: 0, color: '#9E9E9E' }}><Close /></Button>
        </Box>
      </DialogTitle>
      <Divider sx={{ borderColor: 'rgba(229,57,53,0.15)' }} />
      <DialogContent sx={{ pt: 3 , bgcolor:'#0B2E33' }}>
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6}>
            <TextField label="Username *" name="username" value={form.username} onChange={handleChange} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Email *" name="email" type="email" value={form.email} onChange={handleChange} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label={editData ? 'New Password (leave blank to keep)' : 'Password *'}
              name="password" type="password" value={form.password} onChange={handleChange} fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Phone Number" name="phone_number" value={form.phone_number} onChange={handleChange} fullWidth />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Aadhar Number" name="aadhar_number" value={form.aadhar_number} onChange={handleChange} fullWidth inputProps={{ maxLength: 12 }} />
          </Grid>
        </Grid>
      </DialogContent>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />
      <DialogActions sx={{ px: 3, py: 2, gap: 1 , bgcolor:'#0B2E33'  }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderColor: 'rgba(255,255,255,0.15)', color: '#9E9E9E' }}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary" disabled={loading} sx={{ minWidth: 120 }}>
          {loading ? <CircularProgress size={20} color="inherit" /> : editData ? 'Save Changes' : 'Create Tenant'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default function TenantPage() {
  const [tenants, setTenants] = useState([])
  const [fetching, setFetching] = useState(false)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editData, setEditData] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const fetchTenants = async () => {
    setFetching(true)
    try {
      const { data } = await getUsers()
      setTenants(Array.isArray(data) ? data.filter((u) => !u.is_staff && !u.is_superuser) : [])
    } catch {
      toast.error('Failed to fetch tenants')
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => { fetchTenants() }, [])

  const handleDeleteConfirm = async () => {
    try {
      await deleteUser(deleteId)
      setTenants((prev) => prev.filter((t) => t.id !== deleteId))
      toast.success('Tenant removed successfully')
    } catch {
      toast.error('Failed to remove tenant')
    } finally {
      setConfirmOpen(false)
      setDeleteId(null)
    }
  }

  const filtered = tenants.filter((t) =>
    t.username?.toLowerCase().includes(search.toLowerCase()) ||
    t.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Tenant <span style={{ color: '#E53935' }}>Management</span>
          </Typography>
          <Typography variant="body2" sx={{ color: '#9E9E9E', mt: 0.5 }}>
            {tenants.length} registered tenants
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchTenants} sx={{ border: '1px solid rgba(229,57,53,0.3)', color: '#E53935' }}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button variant="contained" color="primary" startIcon={<Add />}
            onClick={() => { setEditData(null); setModalOpen(true) }}>
            Add Tenant
          </Button>
        </Box>
      </Box>

      <TextField
        placeholder="Search tenants..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        size="small"
        sx={{ mb: 2.5, width: { xs: '100%', sm: 320 } }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search sx={{ color: '#9E9E9E', fontSize: 18 }} />
            </InputAdornment>
          ),
        }}
      />

      <TableContainer component={Paper} sx={{
        background: '#1A1A1A',
        border: '1px solid rgba(229,57,53,0.15)',
        borderRadius: '16px',
        overflow: 'hidden',
      }}>
        <Table>
          <TableHead>
            <TableRow>
              {['#', 'Tenant', 'Email', 'Phone', 'Aadhar', 'Actions'].map((h) => (
                <TableCell key={h}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {fetching
              ? Array(4).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    {Array(6).fill(0).map((__, j) => (
                      <TableCell key={j}><Skeleton sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} /></TableCell>
                    ))}
                  </TableRow>
                ))
              : filtered.map((tenant, idx) => (
                  <TableRow key={tenant.id}>
                    <TableCell sx={{ color: '#9E9E9E', fontSize: '0.8rem' }}>{idx + 1}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: '#E53935', width: 32, height: 32, fontSize: '0.8rem', fontWeight: 700 }}>
                          {tenant.username?.[0]?.toUpperCase()}
                        </Avatar>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{tenant.username}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#9E9E9E', fontSize: '0.8rem' }}>{tenant.email}</TableCell>
                    <TableCell sx={{ color: '#9E9E9E', fontSize: '0.8rem' }}>{tenant.phone_number || '—'}</TableCell>
                    <TableCell sx={{ color: '#9E9E9E', fontSize: '0.8rem' }}>
                      {tenant.aadhar_number ? `****${tenant.aadhar_number.slice(-4)}` : '—'}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => { setEditData(tenant); setModalOpen(true) }}
                            sx={{ color: '#FFD600', '&:hover': { bgcolor: 'rgba(255,214,0,0.1)' } }}>
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Remove">
                          <IconButton size="small" onClick={() => { setDeleteId(tenant.id); setConfirmOpen(true) }}
                            sx={{ color: '#E53935', '&:hover': { bgcolor: 'rgba(229,57,53,0.1)' } }}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
            {!fetching && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: '#9E9E9E' }}>
                  <People sx={{ fontSize: 40, mb: 1, opacity: 0.3, display: 'block', mx: 'auto' }} />
                  No tenants found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TenantModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditData(null) }}
        editData={editData}
        onSuccess={fetchTenants}
      />
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Remove Tenant"
        message="Are you sure you want to remove this tenant? Their house assignments will be cleared."
      />
    </Box>
  )
}
