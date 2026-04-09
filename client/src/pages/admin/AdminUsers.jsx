import { useEffect, useState, useCallback } from 'react'
import { adminGetUsers, adminDeleteUser, adminPatchUserRole } from '../../api/adminApi'
import './Admin.css'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [activeSearch, setActiveSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState({ type: '', text: '' })

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

  useEffect(() => {
    fetchList()
  }, [fetchList])

  const handleSearchClick = () => {
    setActiveSearch(searchInput)
  }

  const handleRole = async (id, role) => {
    try {
      await adminPatchUserRole(id, role)
      setMsg({ type: 'success', text: '권한이 변경되었습니다' })
      fetchList()
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.message || '변경 실패' })
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`"${name}" 회원을 삭제할까요?`)) return
    try {
      await adminDeleteUser(id)
      setMsg({ type: 'success', text: '삭제되었습니다' })
      fetchList()
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.message || '삭제 실패' })
    }
  }

  return (
    <>
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
        <button type="button" className="admin-btn admin-btn-primary" onClick={handleSearchClick}>
          검색
        </button>
        <span className="admin-muted">총 {total}명</span>
      </div>
      <div className="admin-card admin-table-wrap">
        {loading ? (
          <p className="admin-muted">불러오는 중…</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>이름</th>
                <th>이메일</th>
                <th>전화</th>
                <th>권한</th>
                <th>권한 변경</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.phone}</td>
                  <td>{u.role}</td>
                  <td>
                    <select
                      value={u.role}
                      onChange={(e) => {
                        const next = e.target.value
                        if (next !== u.role) handleRole(u._id, next)
                      }}
                      aria-label={`${u.name} 권한`}
                    >
                      <option value="customer">customer</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td>
                    <button type="button" className="admin-btn admin-btn-danger" onClick={() => handleDelete(u._id, u.name)}>
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
