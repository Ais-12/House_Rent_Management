// src/components/common/Layout.jsx
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useUser } from '../../context/UserContext'
import { logout } from '../../redux/slices/authSlice'

import {
  Box, AppBar, Toolbar, Typography, Button,
  IconButton, Avatar, Tooltip
} from '@mui/material'

import {
  Dashboard, Home, History, People,
  Logout
} from '@mui/icons-material'

import { useTheme, alpha } from '@mui/material/styles'
import { toast } from 'react-toastify'

const navItems = [
  { label: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { label: 'Houses', icon: <Home />, path: '/houses' },
  { label: 'Rent Logs', icon: <History />, path: '/house-logs' },
  { label: 'Tenants', icon: <People />, path: '/tenants' },
]

export default function Layout() {
  const { user } = useUser()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()

  const handleLogout = () => {
    dispatch(logout())
    toast.info('Logged out')
    navigate('/login')
  }

  return (
    <Box sx={{ minHeight: '100vh' }}>

      {/* 🔹 TOP NAVBAR */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backdropFilter: 'blur(12px)',
          background: alpha(theme.palette.background.default, 0.7),
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>

          {/* 🔸 LEFT: LOGO + MENU */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>

            {/* Logo */}
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Rent
              <Box component="span" sx={{ color: theme.palette.primary.main }}>
                Ease
              </Box>
            </Typography>

            {/* Menu */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              {navItems.map(item => {
                const active = location.pathname === item.path

                return (
                  <Button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    startIcon={item.icon}
                    sx={{
                      color: active
                        ? theme.palette.primary.main
                        : theme.palette.text.secondary,
                      fontWeight: active ? 600 : 400,
                      borderBottom: active
                        ? `2px solid ${theme.palette.primary.main}`
                        : '2px solid transparent',
                      borderRadius: 0,
                      px: 1.5
                    }}
                  >
                    {item.label}
                  </Button>
                )
              })}
            </Box>
          </Box>

          {/* 🔸 RIGHT: USER */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title={user?.email}>
              <Typography variant="body2">
                {user?.email}
              </Typography>
            </Tooltip>

            <Avatar sx={{ width: 32, height: 32 }}>
              {user?.username?.[0]?.toUpperCase()}
            </Avatar>

            <IconButton onClick={handleLogout}>
              <Logout />
            </IconButton>
          </Box>

        </Toolbar>
      </AppBar>

      {/* 🔹 PAGE CONTENT */}
      <Box sx={{ p: 3 }}>
        <Outlet />
      </Box>

    </Box>
  )
}