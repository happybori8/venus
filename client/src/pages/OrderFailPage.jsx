import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiXCircle } from 'react-icons/fi';
import LandingNavbar from '../components/landing/LandingNavbar';
import useAuthStore from '../store/authStore';
import { getStoredUser } from '../utils/authStorage';
import './HomePage.css';
import './OrderResultPage.css';

export default function OrderFailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const logoutStore = useAuthStore((s) => s.logout);
  const message = location.state?.message || '결제 처리 중 문제가 발생했습니다.';

  const user = getStoredUser();
  const isLoggedIn = Boolean(localStorage.getItem('token') && user);
  const isAdmin = !!user && (user.role === 'admin' || String(user.email || '').toLowerCase() === 'admin@gmail.com');
  const handleLogout = () => { logoutStore(); navigate('/'); };

  return (
    <div className="landing order-result-landing">
      <LandingNavbar user={user} isLoggedIn={isLoggedIn} isAdmin={isAdmin} onLogout={handleLogout} />
      <div className="order-result-page">
        <div className="order-result-card">
        <FiXCircle className="order-result-icon order-result-icon--fail" />
        <h1 className="order-result-title">결제에 실패했습니다</h1>
        <p className="order-result-desc">{message}</p>
        <div className="order-result-actions">
          <Link to="/checkout" className="order-result-btn order-result-btn--primary">
            다시 결제하기
          </Link>
          <Link to="/cart" className="order-result-btn order-result-btn--secondary">
            장바구니로 돌아가기
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
