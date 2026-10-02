import { RoutePage } from '../../components/RoutePage.jsx'
import './AdminPage.css'

export function AdminPage({ children }) {
  return <RoutePage name="admin">{children}</RoutePage>
}
