// src/redux/slices/houseLogSlice.js
import { createSlice } from '@reduxjs/toolkit'

const houseLogSlice = createSlice({
  name: 'houseLog',
  initialState: { list: [], loading: false },
  reducers: {
    setHouseLogs(state, { payload }) { state.list = payload },
    addHouseLog(state, { payload }) { state.list.unshift(payload) },
    updateHouseLogInList(state, { payload }) {
      const idx = state.list.findIndex((l) => l.id === payload.id)
      if (idx !== -1) state.list[idx] = payload
    },
    removeHouseLog(state, { payload }) {
      state.list = state.list.filter((l) => l.id !== payload)
    },
    setLoading(state, { payload }) { state.loading = payload },
  },
})

export const { setHouseLogs, addHouseLog, updateHouseLogInList, removeHouseLog, setLoading } = houseLogSlice.actions
export default houseLogSlice.reducer
