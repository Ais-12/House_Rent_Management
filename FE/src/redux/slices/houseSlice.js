// src/redux/slices/houseSlice.js
import { createSlice } from '@reduxjs/toolkit'

const houseSlice = createSlice({
  name: 'house',
  initialState: { list: [], loading: false, error: null },
  reducers: {
    setHouses(state, { payload }) { state.list = payload },
    addHouse(state, { payload }) { state.list.unshift(payload) },
    updateHouseInList(state, { payload }) {
      const idx = state.list.findIndex((h) => h.id === payload.id)
      if (idx !== -1) state.list[idx] = payload
    },
    removeHouse(state, { payload }) {
      state.list = state.list.filter((h) => h.id !== payload)
    },
    setLoading(state, { payload }) { state.loading = payload },
    setError(state, { payload }) { state.error = payload },
  },
})

export const { setHouses, addHouse, updateHouseInList, removeHouse, setLoading, setError } = houseSlice.actions
export default houseSlice.reducer
