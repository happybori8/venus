import { useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import { getStoredUser } from '../../utils/authStorage'
import './Admin.css'

const ADMIN_EMAIL = 'admin@gmail.com'

function isAdminUser(u) {
  if (!u) return false
  if (u.role === 'admin') return true
  return String(u.email || '').toLowerCase() === ADMIN_EMAIL
}

export default function AdminLayout() {
  const navigate = useNavigate()
  const logoutStore = useAuthStore((s) => s.logout)

  const handleLogout = () => {
    logoutStore()
    navigate('/')
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    const u = getStoredUser()
    if (!token || !isAdminUser(u)) {
      navigate('/', { replace: true })
    }
  }, [navigate])

  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <NavLink to="/admin">Venus Admin</NavLink>
        </div>
        <nav className="admin-nav">
          <NavLink to="/admin" end className={({ isActive }) => (isActive ? 'active' : '')}>
            대시보드
          </NavLink>
          <NavLink to="/admin/users" className={({ isActive }) => (isActive ? 'active' : '')}>
            회원 관리
          </NavLink>
          <NavLink to="/admin/products" className={({ isActive }) => (isActive ? 'active' : '')}>
            상품 관리
          </NavLink>
          <NavLink to="/admin/orders" className={({ isActive }) => (isActive ? 'active' : '')}>
            주문·배송 관리
          </NavLink>
        </nav>
        <div className="admin-sidebar-foot">
          <NavLink to="/">쇼핑몰로</NavLink>
          <button type="button" onClick={handleLogout}>
            로그아웃
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}
