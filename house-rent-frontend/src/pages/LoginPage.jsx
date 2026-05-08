// src/pages/LoginPage.jsx
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  Box, Card, CardContent, TextField, Button, Typography,
  InputAdornment, IconButton, CircularProgress
} from '@mui/material'
import {
  Visibility, VisibilityOff, HomeWork, Lock, Person
} from '@mui/icons-material'
import { useTheme, alpha } from '@mui/material/styles'
import { toast } from 'react-toastify'
import { loginAPI } from '../api/actions'
import { setCredentials } from '../redux/slices/authSlice'

export default function LoginPage() {
  const theme = useTheme()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [form, setForm] = useState({ username: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.username || !form.password) {
      toast.error('Please fill all fields')
      return
    }

    setLoading(true)
    try {
      const { data } = await loginAPI(form)

      dispatch(setCredentials({
        user: {
          id: data.user_id,
          username: data.username,
          email: data.email,
          role: data.role
        },
        access: data.access,
        refresh: data.refresh,
      }))

      toast.success(`Welcome back, ${data.username}!`)
      const isOwner = data.is_staff || data.is_superuser
      navigate(isOwner ? '/dashboard' : '/tenant-dashboard')

    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: alpha(theme.palette.secondary.main, 0.5),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      px: 2,
    }}>

      <Card sx={{
        width: '100%',
        maxWidth: 420,

        // 🔥 Glass Effect
        background: alpha(theme.palette.primary.main, 0.28),
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',

        // 🔥 Border using theme primary
        border: `1px solid ${alpha(theme.palette.secondary.main, 0.4)}`,

        // 🔥 Soft glow shadow
        boxShadow: `
          0 8px 32px ${alpha(theme.palette.secondary.main, 0.25)},
          0 2px 10px ${alpha('#000', 0.2)}
        `,
      }}>

        <CardContent sx={{ p: 4 }}>

          {/* Logo */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box sx={{
              width: 64,
              height: 64,
              mx: 'auto',
              borderRadius: 2,
              background: theme.palette.primary.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 1.5,
              boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`
            }}>
              <HomeWork sx={{ color: theme.palette.primary.contrastText }} />
            </Box>

            <Typography variant="h5">
              Rent
              <Box component="span" sx={{ color: theme.palette.primary.main }}>
                Ease
              </Box>
            </Typography>
          </Box>

          {/* Form */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >

            <TextField
              name="username"
              label="Username"
              value={form.username}
              onChange={handleChange}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: theme.palette.primary.main }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              name="password"
              label="Password"
              type={showPass ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: theme.palette.primary.main }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPass(!showPass)}>
                      {showPass ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
              sx={{ mt: 1, py: 1.3 }}
            >
              {loading
                ? <CircularProgress size={22} color="inherit" />
                : 'Sign In'}
            </Button>

          </Box>

        </CardContent>
      </Card>

    </Box>
  )
}