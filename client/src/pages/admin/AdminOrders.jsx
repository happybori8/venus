import { useEffect, useState, useCallback } from 'react'
import { adminGetOrders, adminUpdateOrderStatus } from '../../api/adminApi'
import './Admin.css'

const STATUSES = ['주문완료', '결제완료', '배송준비', '배송중', '배송완료', '취소']

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState({ type: '', text: '' })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await adminGetOrders()
      setOrders(data.orders || [])
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.message || '주문 목록을 불러오지 못했습니다' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleStatus = async (orderId, status) => {
    setMsg({ type: '', text: '' })
    try {
      await adminUpdateOrderStatus(orderId, status)
      setMsg({ type: 'success', text: '주문 상태가 변경되었습니다' })
      load()
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.message || '상태 변경 실패' })
    }
  }

  const formatDate = (d) => {
    if (!d) return '—'
    try {
      return new Date(d).toLocaleString('ko-KR')
    } catch {
      return '—'
    }
  }

  return (
    <>
      <h1 className="admin-page-title">주문·배송 관리</h1>
      {msg.text && (
        <div className={`admin-msg ${msg.type === 'error' ? 'admin-msg-error' : 'admin-msg-success'}`}>{msg.text}</div>
      )}
      <div className="admin-toolbar">
        <button type="button" className="admin-btn admin-btn-ghost" onClick={load}>
          새로고침
        </button>
        <span className="admin-muted">총 {orders.length}건</span>
      </div>
      <div className="admin-card admin-table-wrap">
        {loading ? (
          <p className="admin-muted">불러오는 중…</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>주문번호</th>
                <th>고객</th>
                <th>금액</th>
                <th>결제</th>
                <th>상태</th>
                <th>주문일</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td className="admin-muted">{o._id?.slice(-8)}</td>
                  <td>
                    {o.user?.name || '—'}
                    <br />
                    <small className="admin-muted">{o.user?.email}</small>
                  </td>
                  <td>{o.totalPrice?.toLocaleString()}원</td>
                  <td>{o.isPaid ? '완료' : '미결제'}</td>
                  <td>
                    <select value={o.status} onChange={(e) => handleStatus(o._id, e.target.value)} aria-label="주문 상태">
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{formatDate(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
