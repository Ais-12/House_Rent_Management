// src/pages/TenantDashboard.jsx
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  Box, Grid, Card, CardContent, Typography, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Skeleton, Divider, Avatar
} from '@mui/material'
import {
  Home, Bolt, WaterDrop, AttachMoney, Receipt,
  CheckCircle, Warning, AccessTime
} from '@mui/icons-material'
import { getHouses, getHouseLogs } from '../api/actions'
import { toast } from 'react-toastify'
import dayjs from 'dayjs'

const statusIcon = {
  paid: <CheckCircle sx={{ color: '#00E676', fontSize: 16 }} />,
  pending: <AccessTime sx={{ color: '#FFD600', fontSize: 16 }} />,
  overdue: <Warning sx={{ color: '#E53935', fontSize: 16 }} />,
}

const statusColor = {
  pending: { bg: 'rgba(255,214,0,0.15)', color: '#FFD600', border: 'rgba(255,214,0,0.3)' },
  paid: { bg: 'rgba(0,230,118,0.1)', color: '#00E676', border: 'rgba(0,230,118,0.3)' },
  overdue: { bg: 'rgba(229,57,53,0.15)', color: '#E53935', border: 'rgba(229,57,53,0.3)' },
}

export default function TenantDashboard() {
  const { user } = useSelector((s) => s.auth)
  const [myHouse, setMyHouse] = useState(null)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const [housesRes, logsRes] = await Promise.all([getHouses(), getHouseLogs()])
        const allHouses = Array.isArray(housesRes.data) ? housesRes.data : []
        const allLogs = Array.isArray(logsRes.data) ? logsRes.data : []
        const mine = allHouses.find((h) => h.tenant === user?.id || h.tenant_username === user?.username)
        setMyHouse(mine || null)
        if (mine) {
          setLogs(allLogs.filter((l) => l.house === mine.id))
        }
      } catch {
        toast.error('Failed to load your details')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const latestLog = logs[0]
  const totalDue = logs.filter((l) => l.status !== 'paid').reduce((s, l) => s + Number(l.total || 0), 0)

  return (
    <Box>
      {/* Greeting */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Avatar sx={{ bgcolor: '#E53935', width: 48, height: 48, fontSize: '1.2rem', fontWeight: 800 }}>
            {user?.username?.[0]?.toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Hello, <span style={{ color: '#E53935' }}>{user?.username}</span> 👋
            </Typography>
            <Typography variant="body2" sx={{ color: '#9E9E9E' }}>
              Here's your rental summary
            </Typography>
          </Box>
        </Box>
      </Box>

      {loading ? (
        <Grid container spacing={2.5}>
          {Array(4).fill(0).map((_, i) => (
            <Grid item xs={12} sm={6} key={i}>
              <Skeleton variant="rounded" height={120} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
            </Grid>
          ))}
        </Grid>
      ) : !myHouse ? (
        <Card sx={{ textAlign: 'center', py: 8 }}>
          <Home sx={{ fontSize: 64, color: '#9E9E9E', mb: 2, opacity: 0.3 }} />
          <Typography variant="h6" sx={{ color: '#9E9E9E' }}>No house assigned yet</Typography>
          <Typography variant="body2" sx={{ color: '#555', mt: 1 }}>
            Please contact your owner to assign a house.
          </Typography>
        </Card>
      ) : (
        <>
          {/* House Info Cards */}
          <Grid container spacing={2.5} sx={{ mb: 4 }}>
            {[
              { icon: <Home />, label: 'House No.', value: `#${myHouse.house_number}`, color: '#E53935' },
              { icon: <AttachMoney />, label: 'Monthly Rent', value: `₹${Number(myHouse.rent).toLocaleString()}`, color: '#E53935' },
              { icon: <WaterDrop />, label: 'Water Charge', value: `₹${Number(myHouse.water_charge).toLocaleString()}`, color: '#42A5F5' },
              { icon: <Bolt />, label: 'Unit Cost', value: `₹${myHouse.unit_per_cost}/unit`, color: '#FFD600' },
            ].map((item) => (
              <Grid item xs={6} sm={3} key={item.label}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 2, textAlign: 'center' }}>
                    <Box sx={{
                      width: 44, height: 44, borderRadius: '12px', mx: 'auto', mb: 1,
                      bgcolor: `${item.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: `1px solid ${item.color}33`,
                    }}>
                      <Box sx={{ color: item.color }}>{item.icon}</Box>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#9E9E9E', display: 'block' }}>{item.label}</Typography>
                    <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: item.color, mt: 0.5 }}>
                      {item.value}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Address */}
          {myHouse.address && (
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="caption" sx={{ color: '#9E9E9E', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                  Property Address
                </Typography>
                <Typography sx={{ mt: 0.5, fontWeight: 500 }}>{myHouse.address}</Typography>
              </CardContent>
            </Card>
          )}

          {/* Outstanding */}
          {totalDue > 0 && (
            <Card sx={{ mb: 3, border: '1px solid rgba(229,57,53,0.4)', background: 'rgba(229,57,53,0.05)' }}>
              <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Warning sx={{ color: '#E53935' }} />
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: '#E53935' }}>Outstanding Balance</Typography>
                    <Typography variant="caption" sx={{ color: '#9E9E9E' }}>Please clear pending dues</Typography>
                  </Box>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#E53935' }}>
                  ₹{totalDue.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Rent History */}
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Rent <span style={{ color: '#E53935' }}>History</span>
          </Typography>
          <TableContainer component={Paper} sx={{
            background: '#1A1A1A',
            border: '1px solid rgba(229,57,53,0.15)',
            borderRadius: '16px',
            overflow: 'hidden',
          }}>
            <Table>
              <TableHead>
                <TableRow>
                  {['Month', 'Prev Unit', 'Curr Unit', 'Current Bill', 'Balance', 'Total', 'Status'].map((h) => (
                    <TableCell key={h}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6, color: '#9E9E9E' }}>
                      <Receipt sx={{ fontSize: 40, mb: 1, opacity: 0.3, display: 'block', mx: 'auto' }} />
                      No rent history yet
                    </TableCell>
                  </TableRow>
                ) : logs.map((log) => {
                  const sc = statusColor[log.status] || statusColor.pending
                  return (
                    <TableRow key={log.id}>
                      <TableCell sx={{ color: '#9E9E9E', fontSize: '0.85rem' }}>
                        {dayjs(log.created_at).format('MMM YYYY')}
                      </TableCell>
                      <TableCell sx={{ color: '#9E9E9E' }}>{log.previous_unit}</TableCell>
                      <TableCell sx={{ color: '#9E9E9E' }}>{log.current_month_unit}</TableCell>
                      <TableCell sx={{ color: '#FFD600', fontWeight: 600 }}>
                        ₹{Number(log.current_cost).toLocaleString()}
                      </TableCell>
                      <TableCell sx={{ color: log.balance > 0 ? '#E53935' : '#9E9E9E', fontWeight: 600 }}>
                        ₹{Number(log.balance).toLocaleString()}
                      </TableCell>
                      <TableCell sx={{ color: '#E53935', fontWeight: 800 }}>
                        ₹{Number(log.total).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={statusIcon[log.status]}
                          label={log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                          size="small"
                          sx={{
                            bgcolor: sc.bg, color: sc.color,
                            border: `1px solid ${sc.border}`,
                            fontWeight: 700, fontSize: '0.7rem',
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  )
}
