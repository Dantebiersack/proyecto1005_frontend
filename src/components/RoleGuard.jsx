import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function RoleGuard({ allow, children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  const ok = user.roles.some(r => allow.includes(r))
  return ok ? children : <h3 style={{padding:16}}>No tienes permiso para ver esta página.</h3>
}
