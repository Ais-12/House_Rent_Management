// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import houseReducer from './slices/houseSlice'
import houseLogReducer from './slices/houseLogSlice'
import uiReducer from './slices/uiSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    house: houseReducer,
    houseLog: houseLogReducer,
    ui: uiReducer,
  },
})

export default store
