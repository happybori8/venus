import { useEffect, useState, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { adminGetOrders, adminUpdateOrderStatus } from '../../api/adminApi'
import './Admin.css'
import './AdminOrders.css'

const STATUSES = ['입금대기', '결제완료', '배송준비', '배송중', '배송완료', '취소']

const PIPELINE = [
  { key: '입금대기', label: '입금대기', color: '#6b7280' },
  { key: '결제완료', label: '결제완료', color: '#2563eb' },
  { key: '배송준비', label: '배송준비', color: '#d97706' },
  { key: '배송중', label: '배송중', color: '#ea580c' },
  { key: '배송완료', label: '배송완료', color: '#16a34a' },
  { key: '취소', label: '취소', color: '#dc2626' },
]

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [statusFilter, setStatusFilter] = useState('전체')
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState(null)

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

  useEffect(() => { load() }, [load])

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

  const counts = useMemo(() => {
    const c = { '전체': orders.length }
    for (const o of orders) c[o.status] = (c[o.status] || 0) + 1
    return c
  }, [orders])

  const filtered = useMemo(() => {
    let list = orders
    if (statusFilter !== '전체') list = list.filter((o) => o.status === statusFilter)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter((o) =>
        (o.user?.name || '').toLowerCase().includes(q) ||
        (o.user?.email || '').toLowerCase().includes(q) ||
        o._id.toLowerCase().includes(q)
      )
    }
    return list
  }, [orders, statusFilter, search])

  const formatDate = (d) => {
    if (!d) return '—'
    try { return new Date(d).toLocaleString('ko-KR') } catch { return '—' }
  }

  const toggleExpand = (id) => setExpandedId((prev) => (prev === id ? null : id))

  return (
    <>
      <h1 className="admin-page-title">주문·배송 관리</h1>

      {msg.text && (
        <div className={`admin-msg ${msg.type === 'error' ? 'admin-msg-error' : 'admin-msg-success'}`}>{msg.text}</div>
      )}

      {/* 파이프라인 현황 */}
      <div className="ao-pipeline">
        {PIPELINE.map((step) => (
          <button
            key={step.key}
            type="button"
            className={`ao-pipe-item ${statusFilter === step.key ? 'ao-pipe-item--active' : ''}`}
            onClick={() => setStatusFilter(statusFilter === step.key ? '전체' : step.key)}
          >
            <span className="ao-pipe-count" style={{ color: step.color }}>{counts[step.key] || 0}</span>
            <span className="ao-pipe-label">{step.label}</span>
          </button>
        ))}
      </div>

      {/* 툴바: 필터탭 + 검색 + 새로고침 */}
      <div className="ao-toolbar">
        <div className="ao-filter-tabs">
          {['전체', ...STATUSES].map((s) => (
            <button
              key={s}
              type="button"
              className={`ao-tab ${statusFilter === s ? 'ao-tab--active' : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {s}
              <span className="ao-tab-count">{counts[s] || 0}</span>
            </button>
          ))}
        </div>
        <div className="ao-toolbar-right">
          <input
            type="search"
            className="ao-search"
            placeholder="고객명 · 이메일 · 주문번호"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="button" className="admin-btn admin-btn-ghost" onClick={load}>새로고침</button>
        </div>
      </div>

      {/* 주문 테이블 */}
      <div className="admin-card admin-table-wrap">
        {loading ? (
          <p className="admin-muted" style={{ padding: '2rem', textAlign: 'center' }}>불러오는 중…</p>
        ) : filtered.length === 0 ? (
          <p className="admin-muted" style={{ padding: '2rem', textAlign: 'center' }}>
            {search ? '검색 결과가 없습니다' : '해당 상태의 주문이 없습니다'}
          </p>
        ) : (
          <table className="admin-table ao-table">
            <thead>
              <tr>
                <th className="ao-th-id">주문번호</th>
                <th>고객</th>
                <th>상품</th>
                <th className="ao-th-amount">금액</th>
                <th className="ao-th-pay">결제</th>
                <th className="ao-th-status">상태</th>
                <th className="ao-th-date">주문일</th>
                <th className="ao-th-action">상태변경</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
                const isOpen = expandedId === o._id
                const firstItem = o.orderItems?.[0]
                return (
                  <tr key={o._id} className={isOpen ? 'ao-row--expanded' : ''}>
                    <td className="ao-td-id">
                      <button type="button" className="ao-id-btn" onClick={() => toggleExpand(o._id)}>
                        #{o._id?.slice(-8).toUpperCase()}
                        <span className="ao-id-toggle">{isOpen ? '▲' : '▼'}</span>
                      </button>

                      {isOpen && (
                        <div className="ao-expand-panel">
                          <div className="ao-expand-section">
                            <h4>주문 상품</h4>
                            {o.orderItems?.map((item, i) => {
                              const pid = item.product?._id || item.product
                              return (
                                <div key={i} className="ao-expand-item">
                                  <Link to={`/products/${pid}`} className="ao-expand-link" target="_blank">
                                    <img src={item.image || 'https://placehold.co/36x36?text=No'} alt="" className="ao-expand-thumb" />
                                    <span className="ao-expand-name">{item.name}</span>
                                  </Link>
                                  <span className="ao-expand-qty">{item.quantity}개</span>
                                  <span className="ao-expand-price">{(item.price * item.quantity).toLocaleString()}원</span>
                                </div>
                              )
                            })}
                          </div>
                          <div className="ao-expand-section">
                            <h4>배송지</h4>
                            <p className="ao-expand-addr">
                              {o.shippingAddress?.name} · {o.shippingAddress?.phone}<br />
                              {o.shippingAddress?.zipCode && `(${o.shippingAddress.zipCode}) `}
                              {o.shippingAddress?.city} {o.shippingAddress?.street}
                            </p>
                          </div>
                          <div className="ao-expand-section">
                            <h4>결제 정보</h4>
                            <p className="ao-expand-addr">
                              상품 {o.itemsPrice?.toLocaleString()}원 + 배송 {o.shippingPrice === 0 ? '무료' : `${o.shippingPrice?.toLocaleString()}원`}
                              = <strong>{o.totalPrice?.toLocaleString()}원</strong>
                              &nbsp;· {o.paymentMethod}
                            </p>
                          </div>
                          {/* 진행 타임라인 */}
                          <div className="ao-expand-section">
                            <h4>진행 현황</h4>
                            <div className="ao-mini-timeline">
                              {PIPELINE.filter((s) => s.key !== '취소').map((step, idx) => {
                                const stepIdx = PIPELINE.findIndex((s) => s.key === o.status)
                                const done = stepIdx >= idx
                                return (
                                  <div key={step.key} className="ao-mini-tl-step">
                                    {idx > 0 && <div className={`ao-mini-tl-line ${done ? 'ao-mini-tl-line--done' : ''}`} />}
                                    <div className={`ao-mini-tl-dot ${done ? 'ao-mini-tl-dot--done' : ''}`} style={done ? { background: step.color } : {}} />
                                    <span className={`ao-mini-tl-label ${done ? 'ao-mini-tl-label--done' : ''}`}>{step.label}</span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="ao-customer-name">{o.user?.name || '—'}</span>
                      <br />
                      <small className="admin-muted">{o.user?.email}</small>
                    </td>
                    <td className="ao-td-prod">
                      {firstItem && (
                        <div className="ao-prod-cell">
                          <Link to={`/products/${firstItem.product?._id || firstItem.product}`} className="ao-prod-link" target="_blank">
                            <img src={firstItem.image || 'https://placehold.co/32x32?text=No'} alt="" className="ao-prod-thumb" />
                            <span className="ao-prod-name">{firstItem.name}</span>
                          </Link>
                          {o.orderItems.length > 1 && (
                            <span className="ao-prod-more">외 {o.orderItems.length - 1}건</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="ao-td-amount">{o.totalPrice?.toLocaleString()}원</td>
                    <td>
                      <span className={`ao-pay-badge ${o.isPaid ? 'ao-pay-badge--done' : 'ao-pay-badge--wait'}`}>
                        {o.isPaid ? '완료' : '대기'}
                      </span>
                    </td>
                    <td>
                      <span className={`ao-status-badge ao-status-badge--${o.status === '취소' ? 'cancel' : ''}`}
                        style={{ background: `${(PIPELINE.find((p) => p.key === o.status)?.color || '#6b7280')}18`, color: PIPELINE.find((p) => p.key === o.status)?.color || '#6b7280' }}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="ao-td-date">{formatDate(o.createdAt)}</td>
                    <td>
                      <select
                        className="ao-status-select"
                        value={o.status}
                        onChange={(e) => handleStatus(o._id, e.target.value)}
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <p className="admin-muted" style={{ textAlign: 'center' }}>
        총 <strong style={{ color: '#111' }}>{filtered.length}</strong>건
        {statusFilter !== '전체' && ` (${statusFilter})`}
      </p>
    </>
  )
}
