// src/api/actions.js
import axiosInstance from './axiosInstance'
import { API_URLS } from './apiUrls'

export const getAPI = (url, params = {}) =>
  axiosInstance.get(url, { params })

export const postAPI = (url, data) =>
  axiosInstance.post(url, data)

export const putAPI = (url, data, params = {}) =>
  axiosInstance.put(url, data, { params })

export const deleteAPI = (url, params = {}) =>
  axiosInstance.delete(url, { params })

// ── House ──────────────────────────────────────────
export const getHouses = (params) => getAPI(API_URLS.house, params)
export const getHouseById = (id) => getAPI(API_URLS.house, { id })
export const createHouse = (data) => postAPI(API_URLS.house, data)
export const updateHouse = (id, data) => putAPI(API_URLS.house, data, { id })
export const deleteHouse = (id) => deleteAPI(API_URLS.house, { id })

// ── House Log ──────────────────────────────────────
export const getHouseLogs = (params) => getAPI(API_URLS.houseLog, params)
export const getHouseLogById = (pk) => getAPI(API_URLS.houseLog, { pk })
export const createHouseLog = (data) => postAPI(API_URLS.houseLog, data)
export const updateHouseLog = (pk, data) => putAPI(API_URLS.houseLog, data, { pk })
export const deleteHouseLog = (pk) => deleteAPI(API_URLS.houseLog, { pk })

// ── Users / Tenants ────────────────────────────────
export const getUsers = (params) => getAPI(API_URLS.user, params)
export const createUser = (data) => postAPI(API_URLS.user, data)
export const updateUser = (id, data) => putAPI(API_URLS.user, data, { id })
export const deleteUser = (id) => deleteAPI(API_URLS.user, { id })

// ── Auth ───────────────────────────────────────────
export const loginAPI = (credentials) => postAPI(API_URLS.login, credentials)
