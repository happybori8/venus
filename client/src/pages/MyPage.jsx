import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getStoredUser } from '../utils/authStorage'
import './MyPage.css'

export default function MyPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login', { replace: true })
    }
  }, [navigate])

  const user = getStoredUser()

  return (
    <div className="mypage">
      <div className="mypage-inner">
        <h1 className="mypage-title">마이페이지</h1>
        {user && (
          <p className="mypage-welcome">
            <strong>{user.name}</strong>님, 환영합니다.
          </p>
        )}
        <p className="mypage-desc">주문·배송 조회와 회원 정보는 추후 이 페이지에서 연결할 수 있습니다.</p>
        <Link to="/" className="mypage-link-home">
          ← 메인으로
        </Link>
      </div>
    </div>
  )
}
