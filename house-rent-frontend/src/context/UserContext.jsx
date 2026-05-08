// src/context/UserContext.jsx
import { createContext, useContext } from 'react'
import { useSelector } from 'react-redux'

const UserContext = createContext(null)

export const UserProvider = ({ children }) => {
  const { user, isAuthenticated } = useSelector((s) => s.auth)

  const isOwner = user?.is_staff || user?.is_superuser || user?.role === 'owner'
  const isTenant = !isOwner && isAuthenticated

  return (
    <UserContext.Provider value={{ user, isAuthenticated, isOwner, isTenant }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
