import { useEffect, useState } from 'react'
import { adminGetUsers, adminGetProducts, adminGetOrders } from '../../api/adminApi'
import './Admin.css'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: null, products: null, orders: null })
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [uRes, pRes, oRes] = await Promise.all([
          adminGetUsers({ page: 1, limit: 1 }),
          adminGetProducts({ page: 1, limit: 1 }),
          adminGetOrders(),
        ])
        if (cancelled) return
        setStats({
          users: uRes.data.total ?? 0,
          products: pRes.data.total ?? 0,
          orders: Array.isArray(oRes.data.orders) ? oRes.data.orders.length : 0,
        })
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.message || '통계를 불러오지 못했습니다')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      <h1 className="admin-page-title">대시보드</h1>
      {error && <div className="admin-msg admin-msg-error">{error}</div>}
      <p className="admin-muted" style={{ marginBottom: '1.25rem' }}>
        Venus 관리자 홈입니다. 왼쪽 메뉴에서 회원·상품·주문을 관리할 수 있습니다.
      </p>
      <div className="admin-stats">
        <div className="admin-stat">
          <div className="admin-stat-value">{stats.users ?? '—'}</div>
          <div className="admin-stat-label">전체 회원</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-value">{stats.products ?? '—'}</div>
          <div className="admin-stat-label">등록 상품</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-value">{stats.orders ?? '—'}</div>
          <div className="admin-stat-label">전체 주문</div>
        </div>
      </div>
    </>
  )
}
