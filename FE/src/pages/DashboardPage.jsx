// src/pages/DashboardPage.jsx
import { useEffect, useState } from 'react'
import {
  Box, Grid, Card, CardContent, Typography, Chip, Avatar,
  LinearProgress, Skeleton, Divider
} from '@mui/material'
import {
  Home, AttachMoney, Warning, CheckCircle,
  HomeWork
} from '@mui/icons-material'
import { useTheme, alpha } from '@mui/material/styles'
import { getHouses } from '../api/actions'
import { toast } from 'react-toastify'

const StatCard = ({ icon, label, value, color, sub }) => {
  const theme = useTheme()

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 600
              }}
            >
              {label}
            </Typography>

            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                mt: 0.5,
                lineHeight: 1
              }}
            >
              {value}
            </Typography>

            {sub && (
              <Typography
                variant="caption"
                sx={{
                  color,
                  fontWeight: 600,
                  mt: 0.5,
                  display: 'block'
                }}
              >
                {sub}
              </Typography>
            )}
          </Box>

          <Box sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            bgcolor: alpha(color, 0.15),
            border: `1px solid ${alpha(color, 0.3)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Box sx={{ color }}>{icon}</Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

const HouseCard = ({ house }) => {
  const theme = useTheme()
  const occupied = house.status === 'occupied'

  const statusColor = occupied
    ? theme.palette.primary.main
    : theme.palette.secondary.main

  return (
    <Card sx={{
      height: '100%',
      border: `1px solid ${alpha(statusColor, 0.3)}`,
      transition: '0.2s',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.2)}`
      }
    }}>
      <CardContent sx={{ p: 2.5 }}>

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Box sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: alpha(statusColor, 0.15),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Home sx={{ color: statusColor }} />
            </Box>

            <Box>
              <Typography sx={{ fontWeight: 700 }}>
                House #{house.house_number}
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                {house.address || 'No address'}
              </Typography>
            </Box>
          </Box>

          <Chip
            label={occupied ? 'Occupied' : 'Vacant'}
            size="small"
            sx={{
              bgcolor: alpha(statusColor, 0.15),
              color: statusColor,
              border: `1px solid ${alpha(statusColor, 0.3)}`,
              fontWeight: 700,
              fontSize: '0.7rem'
            }}
          />
        </Box>

        <Divider />

        {/* Details */}
        <Box sx={{
          mt: 2,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 1.5
        }}>
          {[
            { label: 'Rent', value: `₹${Number(house.rent).toLocaleString()}` },
            { label: 'Water', value: `₹${Number(house.water_charge).toLocaleString()}` },
            { label: 'Last Unit', value: `${house.last_current_unit} u` },
            { label: 'Advance', value: `₹${Number(house.advance_amount).toLocaleString()}` },
          ].map((item) => (
            <Box key={item.label} sx={{
              p: 1,
              borderRadius: 1,
              bgcolor: alpha(theme.palette.common.white, 0.03),
              border: `1px solid ${alpha(theme.palette.common.white, 0.05)}`
            }}>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                {item.label}
              </Typography>
              <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                {item.value}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Tenant */}
        {occupied && house.tenant_name && (
          <Box sx={{
            mt: 2,
            p: 1.5,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Avatar sx={{
              width: 28,
              height: 28,
              bgcolor: theme.palette.primary.main,
              fontSize: '0.75rem'
            }}>
              {house.tenant_name?.[0]?.toUpperCase()}
            </Avatar>

            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                {house.tenant_name}
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                Current Tenant
              </Typography>
            </Box>
          </Box>
        )}

      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const theme = useTheme()

  const [houses, setHouses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getHouses()
        setHouses(Array.isArray(data) ? data : [])
      } catch {
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const occupied = houses.filter(h => h.status === 'occupied').length
  const vacant = houses.filter(h => h.status === 'vacant').length
  const totalRent = houses.reduce((s, h) => s + Number(h.rent || 0), 0)
  const occupancyRate = houses.length
    ? Math.round((occupied / houses.length) * 100)
    : 0

  return (
    <Box>

      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Dashboard{' '}
          <Box component="span" sx={{ color: theme.palette.primary.main }}>
            Overview
          </Box>
        </Typography>

        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
          Welcome back! Here's your property at a glance.
        </Typography>
      </Box>

      {/* Stats */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {loading
          ? Array(4).fill(0).map((_, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Skeleton variant="rounded" height={110} />
              </Grid>
            ))
          : [
              {
                icon: <HomeWork />,
                label: 'Total Houses',
                value: houses.length,
                color: theme.palette.primary.main,
                sub: `${occupancyRate}% occupancy`
              },
              {
                icon: <CheckCircle />,
                label: 'Occupied',
                value: occupied,
                color: theme.palette.primary.main,
                sub: 'Active tenants'
              },
              {
                icon: <Warning />,
                label: 'Vacant',
                value: vacant,
                color: theme.palette.secondary.main,
                sub: 'Available now'
              },
              {
                icon: <AttachMoney />,
                label: 'Monthly Rent',
                value: `₹${totalRent.toLocaleString()}`,
                color: theme.palette.primary.main,
                sub: 'Expected total'
              },
            ].map(stat => (
              <Grid item xs={12} sm={6} md={3} key={stat.label}>
                <StatCard {...stat} />
              </Grid>
            ))}
      </Grid>

      {/* Progress */}
      {!loading && houses.length > 0 && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Occupancy Rate</Typography>
              <Typography sx={{ color: theme.palette.primary.main, fontWeight: 800 }}>
                {occupancyRate}%
              </Typography>
            </Box>

            <LinearProgress
              variant="determinate"
              value={occupancyRate}
              sx={{
                height: 10,
                borderRadius: 5,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                '& .MuiLinearProgress-bar': {
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                }
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Houses */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        All Properties
      </Typography>

      <Grid container spacing={2.5}>
        {loading
          ? Array(6).fill(0).map((_, i) => (
              <Grid item xs={12} sm={6} lg={4} key={i}>
                <Skeleton variant="rounded" height={240} />
              </Grid>
            ))
          : houses.map(house => (
              <Grid item xs={12} sm={6} lg={4} key={house.id}>
                <HouseCard house={house} />
              </Grid>
            ))}
      </Grid>

    </Box>
  )
}