import { Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';
import LandingNavbar from '../components/landing/LandingNavbar';
import useAuthStore from '../store/authStore';
import { getStoredUser } from '../utils/authStorage';
import './HomePage.css';
import './OrderResultPage.css';

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
    <div className="landing order-result-landing">
      <LandingNavbar user={user} isLoggedIn={isLoggedIn} isAdmin={isAdmin} onLogout={handleLogout} />
      <div className="order-result-page">
        <div className="order-result-card">
        <FiCheckCircle className="order-result-icon order-result-icon--success" />
        <h1 className="order-result-title">결제가 완료되었습니다</h1>
        <p className="order-result-desc">
          주문이 정상적으로 처리되었습니다.<br />
          주문번호: <strong>{orderId.slice(-8).toUpperCase()}</strong>
        </p>
        <div className="order-result-actions">
          <Link to={`/orders/${orderId}`} className="order-result-btn order-result-btn--primary">
            주문 상세 보기
          </Link>
          <Link to="/orders" className="order-result-btn order-result-btn--secondary">
            주문 내역
          </Link>
          <Link to="/" className="order-result-btn order-result-btn--ghost">
            홈으로 돌아가기
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
}
