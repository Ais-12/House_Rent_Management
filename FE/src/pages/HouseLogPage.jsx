// src/pages/HouseLogPage.jsx
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box, Button, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton,
  Chip, Tooltip, TextField, InputAdornment, Skeleton, Select,
  MenuItem, FormControl, InputLabel
} from '@mui/material'
import { Add, Edit, Delete, Search, Refresh, Receipt } from '@mui/icons-material'
import { toast } from 'react-toastify'
import { getHouseLogs, deleteHouseLog, getHouses } from '../api/actions'
import { setHouseLogs, removeHouseLog } from '../redux/slices/houseLogSlice'
import HouseLogModal from '../components/houselog/HouseLogModal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import dayjs from 'dayjs'

const statusColor = {
  pending: { bg: 'rgba(255,214,0,0.15)', color: '#FFD600', border: 'rgba(255,214,0,0.3)' },
  paid: { bg: 'rgba(0,230,118,0.1)', color: '#00E676', border: 'rgba(0,230,118,0.3)' },
  overdue: { bg: 'rgba(229,57,53,0.15)', color: '#E53935', border: 'rgba(229,57,53,0.3)' },
}

export default function HouseLogPage() {
  const dispatch = useDispatch()
  const { list: logs } = useSelector((s) => s.houseLog)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editData, setEditData] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [fetching, setFetching] = useState(false)
  const [houses, setHouses] = useState([])

  const fetchLogs = async () => {
    setFetching(true)
    try {
      const [logsRes, housesRes] = await Promise.all([getHouseLogs(), getHouses()])
      dispatch(setHouseLogs(Array.isArray(logsRes.data) ? logsRes.data : []))
      setHouses(Array.isArray(housesRes.data) ? housesRes.data : [])
    } catch {
      toast.error('Failed to fetch rent logs')
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => { fetchLogs() }, [])

  const handleDeleteConfirm = async () => {
    try {
      await deleteHouseLog(deleteId)
      dispatch(removeHouseLog(deleteId))
      toast.success('Log deleted successfully')
    } catch {
      toast.error('Failed to delete log')
    } finally {
      setConfirmOpen(false)
      setDeleteId(null)
    }
  }

  const houseMap = Object.fromEntries(houses.map((h) => [h.id, h.house_number]))

  const filtered = logs.filter((l) => {
    const houseNo = houseMap[l.house] || ''
    const matchSearch = houseNo.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus ? l.status === filterStatus : true
    return matchSearch && matchStatus
  })

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Rent <span style={{ color: '#E53935' }}>Logs</span>
          </Typography>
          <Typography variant="body2" sx={{ color: '#9E9E9E', mt: 0.5 }}>
            Monthly rent records with electricity calculations
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchLogs} sx={{ border: '1px solid rgba(229,57,53,0.3)', color: '#E53935' }}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => { setEditData(null); setModalOpen(true) }}
          >
            Add Log
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2.5, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search by house number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ width: { xs: '100%', sm: 300 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: '#9E9E9E', fontSize: 18 }} />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Filter Status</InputLabel>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            label="Filter Status"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="paid">Paid</MenuItem>
            <MenuItem value="overdue">Overdue</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper} sx={{
        background: '#1A1A1A',
        border: '1px solid rgba(229,57,53,0.15)',
        borderRadius: '16px',
        overflow: 'hidden',
      }}>
        <Table>
          <TableHead>
            <TableRow>
              {['#', 'House', 'Prev Unit', 'Curr Unit', 'Units Used', 'Current Bill', 'Balance', 'Total', 'Status', 'Date', 'Actions'].map((h) => (
                <TableCell key={h}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {fetching
              ? Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    {Array(11).fill(0).map((__, j) => (
                      <TableCell key={j}><Skeleton sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} /></TableCell>
                    ))}
                  </TableRow>
                ))
              : filtered.map((log, idx) => {
                  const unitsUsed = Number(log.current_month_unit) - Number(log.previous_unit)
                  const sc = statusColor[log.status] || statusColor.pending
                  return (
                    <TableRow key={log.id}>
                      <TableCell sx={{ color: '#9E9E9E', fontSize: '0.8rem' }}>{idx + 1}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Receipt sx={{ color: '#E53935', fontSize: 16 }} />
                          <Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>
                            #{houseMap[log.house] || log.house}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: '#9E9E9E' }}>{log.previous_unit}</TableCell>
                      <TableCell sx={{ color: '#9E9E9E' }}>{log.current_month_unit}</TableCell>
                      <TableCell sx={{ color: '#FFD600', fontWeight: 700 }}>
                        {unitsUsed > 0 ? unitsUsed : 0} u
                      </TableCell>
                      <TableCell sx={{ color: '#42A5F5', fontWeight: 600 }}>
                        ₹{Number(log.current_cost).toLocaleString()}
                      </TableCell>
                      <TableCell sx={{ color: log.balance > 0 ? '#E53935' : '#00E676', fontWeight: 600 }}>
                        ₹{Number(log.balance).toLocaleString()}
                      </TableCell>
                      <TableCell sx={{ color: '#E53935', fontWeight: 800 }}>
                        ₹{Number(log.total).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                          size="small"
                          sx={{
                            bgcolor: sc.bg, color: sc.color,
                            border: `1px solid ${sc.border}`,
                            fontWeight: 700, fontSize: '0.7rem',
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#9E9E9E', fontSize: '0.8rem' }}>
                        {dayjs(log.created_at).format('DD MMM YYYY')}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => { setEditData(log); setModalOpen(true) }}
                              sx={{ color: '#FFD600', '&:hover': { bgcolor: 'rgba(255,214,0,0.1)' } }}>
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" onClick={() => { setDeleteId(log.id); setConfirmOpen(true) }}
                              sx={{ color: '#E53935', '&:hover': { bgcolor: 'rgba(229,57,53,0.1)' } }}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )
                })}
            {!fetching && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ py: 6, color: '#9E9E9E' }}>
                  <Receipt sx={{ fontSize: 40, mb: 1, opacity: 0.3, display: 'block', mx: 'auto' }} />
                  No rent logs found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <HouseLogModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditData(null) }}
        editData={editData}
        houses={houses}
        onSuccess={fetchLogs}
      />
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Rent Log"
        message="Are you sure you want to delete this rent log? This cannot be undone."
      />
    </Box>
  )
}
