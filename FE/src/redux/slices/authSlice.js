// src/redux/slices/authSlice.js
import { createSlice } from '@reduxjs/toolkit'

const token = localStorage.getItem('access_token')
const user = (() => { try { return JSON.parse(localStorage.getItem('user')) } catch { return null } })()

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: user || null,
    token: token || null,
    isAuthenticated: !!token,
    loading: false,
  },
  reducers: {
    setCredentials(state, { payload }) {
      state.user = payload.user
      state.token = payload.access
      state.isAuthenticated = true
      localStorage.setItem('access_token', payload.access)
      localStorage.setItem('refresh_token', payload.refresh)
      localStorage.setItem('user', JSON.stringify(payload.user))
    },
    logout(state) {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      localStorage.clear()
    },
    setLoading(state, { payload }) {
      state.loading = payload
    },
  },
})

export const { setCredentials, logout, setLoading } = authSlice.actions
export default authSlice.reducer
