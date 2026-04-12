import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiXCircle } from 'react-icons/fi';
import LandingNavbar from '../components/landing/LandingNavbar';
import useAuthStore from '../store/authStore';
import { getStoredUser } from '../utils/authStorage';
import './HomePage.css';
import './MyPage.css';

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
    <div className="landing mp-landing">
      <LandingNavbar user={user} isLoggedIn={isLoggedIn} isAdmin={isAdmin} onLogout={handleLogout} />
      <main className="mp-main">
        <div className="mp-container mp-container--narrow">
          <div className="mp-card mp-result-card">
            <FiXCircle className="mp-result-icon mp-result-icon--fail" />
            <h1 className="mp-card-title mp-result-title">결제에 실패했습니다</h1>
            <p className="mp-result-desc">{message}</p>
            <div className="mp-result-actions">
              <Link to="/checkout" className="mp-ocard-btn mp-result-btn--wide">
                다시 결제하기
              </Link>
              <Link to="/cart" className="mp-ocard-btn mp-ocard-btn--outline mp-result-btn--wide">
                장바구니로 돌아가기
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
