import { useEffect, useState, useCallback } from 'react'
import {
  adminGetUsers, adminGetUser, adminUpdateUser,
  adminDeleteUser, adminPatchUserRole, adminGetOrders,
} from '../../api/adminApi'
import './Admin.css'
import './AdminUsers.css'

const ROLES = ['customer', 'admin']
const GENDER_LABEL = { male: '남성', female: '여성', other: '기타', '': '미설정' }

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [activeSearch, setActiveSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState({ type: '', text: '' })

  // drawer
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerUser, setDrawerUser] = useState(null)
  const [drawerOrders, setDrawerOrders] = useState([])
  const [drawerLoading, setDrawerLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)

  const fetchList = useCallback(async () => {
    setLoading(true)
    setMsg({ type: '', text: '' })
    try {
      const { data } = await adminGetUsers({ search: activeSearch.trim() || undefined, limit: 100 })
      setUsers(data.users || [])
      setTotal(data.total ?? 0)
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.message || '목록을 불러오지 못했습니다' })
    } finally {
      setLoading(false)
    }
  }, [activeSearch])

  useEffect(() => { fetchList() }, [fetchList])

  const handleSearchClick = () => setActiveSearch(searchInput)

  const openDrawer = async (userId) => {
    setDrawerOpen(true)
    setDrawerLoading(true)
    setEditMode(false)
    setDrawerUser(null)
    setDrawerOrders([])
    try {
      const [userRes, ordersRes] = await Promise.all([
        adminGetUser(userId),
        adminGetOrders(),
      ])
      const u = userRes.data.user
      setDrawerUser(u)
      const userOrders = (ordersRes.data.orders || []).filter(
        (o) => (o.user?._id || o.user) === u._id
      )
      setDrawerOrders(userOrders)
    } catch {
      setMsg({ type: 'error', text: '회원 정보를 불러올 수 없습니다' })
      setDrawerOpen(false)
    } finally {
      setDrawerLoading(false)
    }
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setEditMode(false)
  }

  const startEdit = () => {
    if (!drawerUser) return
    setEditForm({
      name: drawerUser.name || '',
      phone: drawerUser.phone || '',
      gender: drawerUser.gender || '',
      zipCode: drawerUser.address?.zipCode || '',
      city: drawerUser.address?.city || '',
      street: drawerUser.address?.street || '',
      detail: drawerUser.address?.detail || '',
    })
    setEditMode(true)
  }

  const cancelEdit = () => setEditMode(false)

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    if (!drawerUser) return
    setSaving(true)
    try {
      const payload = {
        name: editForm.name,
        phone: editForm.phone,
        address: {
          zipCode: editForm.zipCode,
          city: editForm.city,
          street: editForm.street,
          detail: editForm.detail,
        },
      }
      const { data } = await adminUpdateUser(drawerUser._id, payload)
      setDrawerUser(data.user)
      setEditMode(false)
      setMsg({ type: 'success', text: '회원정보가 수정되었습니다' })
      fetchList()
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.message || '수정 실패' })
    } finally {
      setSaving(false)
    }
  }

  const handleRole = async (id, role) => {
    try {
      await adminPatchUserRole(id, role)
      setMsg({ type: 'success', text: '권한이 변경되었습니다' })
      fetchList()
      if (drawerUser?._id === id) {
        setDrawerUser((prev) => prev ? { ...prev, role } : prev)
      }
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.message || '변경 실패' })
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`"${name}" 회원을 삭제할까요?`)) return
    try {
      await adminDeleteUser(id)
      setMsg({ type: 'success', text: '삭제되었습니다' })
      if (drawerUser?._id === id) closeDrawer()
      fetchList()
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.message || '삭제 실패' })
    }
  }

  const formatDate = (d) => {
    if (!d) return '—'
    try { return new Date(d).toLocaleDateString('ko-KR') } catch { return '—' }
  }

  const formatDateTime = (d) => {
    if (!d) return '—'
    try { return new Date(d).toLocaleString('ko-KR') } catch { return '—' }
  }

  const totalSpent = drawerOrders
    .filter((o) => o.isPaid)
    .reduce((s, o) => s + (o.totalPrice || 0), 0)

  return (
    <div className="au-root">
      <div className={`au-list-area ${drawerOpen ? 'au-list-area--shrink' : ''}`}>
        <h1 className="admin-page-title">회원 관리</h1>
        {msg.text && (
          <div className={`admin-msg ${msg.type === 'error' ? 'admin-msg-error' : 'admin-msg-success'}`}>{msg.text}</div>
        )}
        <div className="admin-toolbar">
          <input
            type="search"
            placeholder="이름·이메일·전화 검색"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
          />
          <button type="button" className="admin-btn admin-btn-primary" onClick={handleSearchClick}>검색</button>
          <span className="admin-muted">총 {total}명</span>
        </div>
        <div className="admin-card admin-table-wrap">
          {loading ? (
            <p className="admin-muted" style={{ padding: '2rem', textAlign: 'center' }}>불러오는 중…</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>이름</th>
                  <th>이메일</th>
                  <th>전화</th>
                  <th>가입일</th>
                  <th>권한</th>
                  <th>권한 변경</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className={drawerUser?._id === u._id ? 'au-row--active' : ''}>
                    <td>
                      <button type="button" className="au-name-btn" onClick={() => openDrawer(u._id)}>
                        {u.name}
                      </button>
                    </td>
                    <td>{u.email}</td>
                    <td>{u.phone}</td>
                    <td className="admin-muted">{formatDate(u.createdAt)}</td>
                    <td>
                      <span className={`au-role-badge ${u.role === 'admin' ? 'au-role-badge--admin' : ''}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <select
                        value={u.role}
                        onChange={(e) => {
                          const next = e.target.value
                          if (next !== u.role) handleRole(u._id, next)
                        }}
                        aria-label={`${u.name} 권한`}
                      >
                        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td>
                      <button type="button" className="admin-btn admin-btn-danger" onClick={() => handleDelete(u._id, u.name)}>삭제</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Overlay */}
      {drawerOpen && <div className="au-overlay" onClick={closeDrawer} />}

      {/* Drawer */}
      <aside className={`au-drawer ${drawerOpen ? 'au-drawer--open' : ''}`}>
        {drawerLoading ? (
          <div className="au-drawer-loading">불러오는 중…</div>
        ) : drawerUser && (
          <>
            <div className="au-drawer-header">
              <h2 className="au-drawer-title">회원 상세</h2>
              <button type="button" className="au-drawer-close" onClick={closeDrawer}>✕</button>
            </div>

            {/* 프로필 요약 */}
            <div className="au-profile">
              <div className="au-avatar">
                {drawerUser.profileImage
                  ? <img src={drawerUser.profileImage} alt="" className="au-avatar-img" />
                  : <span className="au-avatar-letter">{(drawerUser.name || '?')[0]}</span>
                }
              </div>
              <div className="au-profile-info">
                <h3 className="au-profile-name">{drawerUser.name}</h3>
                <span className={`au-role-badge ${drawerUser.role === 'admin' ? 'au-role-badge--admin' : ''}`}>
                  {drawerUser.role}
                </span>
              </div>
            </div>

            <div className="au-drawer-body">
              {/* 통계 카드 */}
              <div className="au-stat-row">
                <div className="au-stat-card">
                  <span className="au-stat-num">{drawerOrders.length}</span>
                  <span className="au-stat-lbl">총 주문</span>
                </div>
                <div className="au-stat-card">
                  <span className="au-stat-num">{totalSpent.toLocaleString()}원</span>
                  <span className="au-stat-lbl">총 결제</span>
                </div>
              </div>

              {/* 기본 정보 / 수정 */}
              <div className="au-section">
                <div className="au-section-head">
                  <h4>기본 정보</h4>
                  {!editMode && (
                    <button type="button" className="au-edit-btn" onClick={startEdit}>수정</button>
                  )}
                </div>

                {editMode ? (
                  <div className="au-edit-form">
                    <label className="au-field">
                      <span>이름</span>
                      <input name="name" value={editForm.name} onChange={handleEditChange} className="au-input" />
                    </label>
                    <label className="au-field">
                      <span>이메일</span>
                      <input value={drawerUser.email} disabled className="au-input au-input--disabled" />
                    </label>
                    <label className="au-field">
                      <span>전화번호</span>
                      <input name="phone" value={editForm.phone} onChange={handleEditChange} className="au-input" />
                    </label>
                    <label className="au-field">
                      <span>성별</span>
                      <select name="gender" value={editForm.gender} onChange={handleEditChange} className="au-input">
                        <option value="">미설정</option>
                        <option value="male">남성</option>
                        <option value="female">여성</option>
                        <option value="other">기타</option>
                      </select>
                    </label>
                    <div className="au-field-group">
                      <span className="au-field-group-title">주소</span>
                      <input name="zipCode" value={editForm.zipCode} onChange={handleEditChange} className="au-input" placeholder="우편번호" />
                      <input name="city" value={editForm.city} onChange={handleEditChange} className="au-input" placeholder="시/도" />
                      <input name="street" value={editForm.street} onChange={handleEditChange} className="au-input" placeholder="도로명 주소" />
                      <input name="detail" value={editForm.detail} onChange={handleEditChange} className="au-input" placeholder="상세주소" />
                    </div>
                    <div className="au-edit-actions">
                      <button type="button" className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving}>
                        {saving ? '저장 중…' : '저장'}
                      </button>
                      <button type="button" className="admin-btn admin-btn-ghost" onClick={cancelEdit}>취소</button>
                    </div>
                  </div>
                ) : (
                  <dl className="au-info-list">
                    <dt>이메일</dt><dd>{drawerUser.email}</dd>
                    <dt>전화번호</dt><dd>{drawerUser.phone || '—'}</dd>
                    <dt>성별</dt><dd>{GENDER_LABEL[drawerUser.gender] || '미설정'}</dd>
                    <dt>생년월일</dt><dd>{drawerUser.birthDate ? formatDate(drawerUser.birthDate) : '미설정'}</dd>
                    <dt>가입일</dt><dd>{formatDateTime(drawerUser.createdAt)}</dd>
                    <dt>마케팅</dt>
                    <dd>
                      이메일 {drawerUser.marketingConsent?.email ? '✓' : '✗'}
                      {' · '}
                      SMS {drawerUser.marketingConsent?.sms ? '✓' : '✗'}
                    </dd>
                  </dl>
                )}
              </div>

              {/* 주소 */}
              {!editMode && (
                <div className="au-section">
                  <h4>배송지</h4>
                  {drawerUser.address?.street ? (
                    <p className="au-addr-text">
                      {drawerUser.address.zipCode && `(${drawerUser.address.zipCode}) `}
                      {drawerUser.address.city} {drawerUser.address.street}
                      {drawerUser.address.detail && ` ${drawerUser.address.detail}`}
                    </p>
                  ) : (
                    <p className="au-muted">등록된 주소 없음</p>
                  )}
                </div>
              )}

              {/* 주문 이력 */}
              <div className="au-section">
                <h4>주문 이력 <span className="au-muted">({drawerOrders.length}건)</span></h4>
                {drawerOrders.length === 0 ? (
                  <p className="au-muted">주문 내역이 없습니다</p>
                ) : (
                  <ul className="au-order-list">
                    {drawerOrders.slice(0, 10).map((o) => (
                      <li key={o._id} className="au-order-item">
                        <div className="au-order-top">
                          <span className="au-order-id">#{o._id.slice(-8).toUpperCase()}</span>
                          <span className={`au-order-status au-order-status--${o.status === '취소' ? 'cancel' : o.isPaid ? 'paid' : 'wait'}`}>
                            {o.status}
                          </span>
                        </div>
                        <div className="au-order-bottom">
                          <span>{o.totalPrice?.toLocaleString()}원</span>
                          <span className="au-muted">{formatDate(o.createdAt)}</span>
                        </div>
                      </li>
                    ))}
                    {drawerOrders.length > 10 && (
                      <p className="au-muted" style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                        외 {drawerOrders.length - 10}건
                      </p>
                    )}
                  </ul>
                )}
              </div>
            </div>

            {/* 하단 액션 */}
            <div className="au-drawer-footer">
              <button
                type="button"
                className="admin-btn admin-btn-danger"
                onClick={() => handleDelete(drawerUser._id, drawerUser.name)}
              >
                회원 삭제
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
