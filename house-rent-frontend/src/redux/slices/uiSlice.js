// src/redux/slices/uiSlice.js
import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    modal: { open: false, type: null, data: null },
    sidebarOpen: true,
  },
  reducers: {
    openModal(state, { payload }) {
      state.modal = { open: true, type: payload.type, data: payload.data || null }
    },
    closeModal(state) {
      state.modal = { open: false, type: null, data: null }
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen
    },
  },
})

export const { openModal, closeModal, toggleSidebar } = uiSlice.actions
export default uiSlice.reducer
