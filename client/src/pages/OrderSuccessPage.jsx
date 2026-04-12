import { Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';
import LandingNavbar from '../components/landing/LandingNavbar';
import useAuthStore from '../store/authStore';
import { getStoredUser } from '../utils/authStorage';
import './HomePage.css';
import './MyPage.css';

export default function OrderSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const logoutStore = useAuthStore((s) => s.logout);
  const orderId = location.state?.orderId;

  const user = getStoredUser();
  const isLoggedIn = Boolean(localStorage.getItem('token') && user);
  const isAdmin = !!user && (user.role === 'admin' || String(user.email || '').toLowerCase() === 'admin@gmail.com');
  const handleLogout = () => { logoutStore(); navigate('/'); };

  if (!orderId) return <Navigate to="/" replace />;

  return (
    <div className="landing mp-landing">
      <LandingNavbar user={user} isLoggedIn={isLoggedIn} isAdmin={isAdmin} onLogout={handleLogout} />
      <main className="mp-main">
        <div className="mp-container mp-container--narrow">
          <div className="mp-card mp-result-card">
            <FiCheckCircle className="mp-result-icon mp-result-icon--success" />
            <h1 className="mp-card-title mp-result-title">결제가 완료되었습니다</h1>
            <p className="mp-result-desc">
              주문이 정상적으로 처리되었습니다.<br />
              주문번호: <strong>#{orderId.slice(-8).toUpperCase()}</strong>
            </p>
            <div className="mp-result-actions">
              <Link to={`/orders/${orderId}`} className="mp-ocard-btn mp-result-btn--wide">
                주문 상세 보기
              </Link>
              <Link to="/mypage" className="mp-ocard-btn mp-ocard-btn--outline mp-result-btn--wide">
                주문목록
              </Link>
              <Link to="/" className="mp-result-ghost">
                홈으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
