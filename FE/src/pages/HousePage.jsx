// src/pages/HousePage.jsx
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box, Button, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton,
  Chip, Tooltip, TextField, InputAdornment, Skeleton
} from '@mui/material'
import {
  Add, Edit, Delete, Search, Home, Refresh
} from '@mui/icons-material'
import { toast } from 'react-toastify'
import { getHouses, deleteHouse } from '../api/actions'
import {
  setHouses, removeHouse
} from '../redux/slices/houseSlice'
import HouseModal from '../components/house/HouseModal'
import ConfirmDialog from '../components/common/ConfirmDialog'

export default function HousePage() {
  const dispatch = useDispatch()
  const { list: houses, loading } = useSelector((s) => s.house)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editData, setEditData] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [fetching, setFetching] = useState(false)

  const fetchHouses = async () => {
    setFetching(true)
    try {
      const { data } = await getHouses()
      dispatch(setHouses(Array.isArray(data) ? data : []))
    } catch {
      toast.error('Failed to fetch houses')
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => { fetchHouses() }, [])

  const handleEdit = (house) => {
    setEditData(house)
    setModalOpen(true)
  }

  const handleDeleteClick = (id) => {
    setDeleteId(id)
    setConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      await deleteHouse(deleteId)
      dispatch(removeHouse(deleteId))
      toast.success('House deleted successfully')
    } catch {
      toast.error('Failed to delete house')
    } finally {
      setConfirmOpen(false)
      setDeleteId(null)
    }
  }

  const filtered = houses.filter((h) =>
    h.house_number?.toLowerCase().includes(search.toLowerCase()) ||
    h.address?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Houses <span style={{ color: '#E53935' }}>Management</span>
          </Typography>
          <Typography variant="body2" sx={{ color: '#9E9E9E', mt: 0.5 }}>
            Manage all your rental properties
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchHouses} sx={{ border: '1px solid rgba(229,57,53,0.3)', color: '#E53935' }}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => { setEditData(null); setModalOpen(true) }}
          >
            Add House
          </Button>
        </Box>
      </Box>

      {/* Search */}
      <TextField
        placeholder="Search by house number or address..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        size="small"
        sx={{ mb: 2.5, width: { xs: '100%', sm: 360 } }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search sx={{ color: '#9E9E9E', fontSize: 18 }} />
            </InputAdornment>
          ),
        }}
      />

      {/* Table */}
      <TableContainer component={Paper} sx={{
        background: '#1A1A1A',
        border: '1px solid rgba(229,57,53,0.15)',
        borderRadius: '16px',
        overflow: 'hidden',
      }}>
        <Table>
          <TableHead>
            <TableRow>
              {['#', 'House No.', 'Address', 'Rent (₹)', 'Water (₹)', 'Unit Cost', 'Last Unit', 'Advance', 'Status', 'Tenant', 'Actions'].map((h) => (
                <TableCell key={h}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {fetching
              ? Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    {Array(11).fill(0).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : filtered.map((house, idx) => (
                  <TableRow key={house.id}>
                    <TableCell sx={{ color: '#9E9E9E', fontSize: '0.8rem' }}>{idx + 1}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Home sx={{ color: '#E53935', fontSize: 16 }} />
                        <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                          {house.house_number}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#9E9E9E', fontSize: '0.8rem', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {house.address || '—'}
                    </TableCell>
                    <TableCell sx={{ color: '#E53935', fontWeight: 700 }}>
                      ₹{Number(house.rent).toLocaleString()}
                    </TableCell>
                    <TableCell sx={{ color: '#42A5F5', fontWeight: 600 }}>
                      ₹{Number(house.water_charge).toLocaleString()}
                    </TableCell>
                    <TableCell sx={{ color: '#FFD600', fontWeight: 600 }}>
                      ₹{Number(house.unit_per_cost).toFixed(2)}
                    </TableCell>
                    <TableCell sx={{ color: '#9E9E9E' }}>
                      {house.last_current_unit} u
                    </TableCell>
                    <TableCell sx={{ color: '#00E676', fontWeight: 600 }}>
                      ₹{Number(house.advance_amount).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={house.status === 'occupied' ? 'Occupied' : 'Vacant'}
                        size="small"
                        sx={{
                          bgcolor: house.status === 'occupied' ? 'rgba(229,57,53,0.15)' : 'rgba(0,230,118,0.1)',
                          color: house.status === 'occupied' ? '#E53935' : '#00E676',
                          fontWeight: 700, fontSize: '0.7rem',
                          border: `1px solid ${house.status === 'occupied' ? 'rgba(229,57,53,0.3)' : 'rgba(0,230,118,0.3)'}`,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#9E9E9E', fontSize: '0.8rem' }}>
                      {house.tenant_name || '—'}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleEdit(house)}
                            sx={{ color: '#FFD600', '&:hover': { bgcolor: 'rgba(255,214,0,0.1)' } }}>
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => handleDeleteClick(house.id)}
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
                <TableCell colSpan={11} align="center" sx={{ py: 6, color: '#9E9E9E' }}>
                  <Home sx={{ fontSize: 40, mb: 1, opacity: 0.3, display: 'block', mx: 'auto' }} />
                  No houses found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modals */}
      <HouseModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditData(null) }}
        editData={editData}
        onSuccess={fetchHouses}
      />
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete House"
        message="Are you sure you want to delete this house? This action cannot be undone."
      />
    </Box>
  )
}
