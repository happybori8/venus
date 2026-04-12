import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getOrderAPI } from '../api/orders';
import LandingNavbar from '../components/landing/LandingNavbar';
import useAuthStore from '../store/authStore';
import { getStoredUser } from '../utils/authStorage';
import {
  FiArrowLeft, FiClock, FiCreditCard, FiBox, FiTruck, FiCheckCircle,
} from 'react-icons/fi';
import './HomePage.css';
import './MyPage.css';

const STATUS_BADGE = {
  '입금대기': 'mp-badge--gray',
  '결제완료': 'mp-badge--blue',
  '배송준비': 'mp-badge--yellow',
  '배송중': 'mp-badge--yellow',
  '배송완료': 'mp-badge--green',
  '취소': 'mp-badge--red',
};

const PIPELINE_STEPS = [
  { key: '입금대기', label: '입금대기', icon: FiClock },
  { key: '결제완료', label: '결제완료', icon: FiCreditCard },
  { key: '배송준비', label: '배송준비', icon: FiBox },
  { key: '배송중', label: '배송중', icon: FiTruck },
  { key: '배송완료', label: '배송완료', icon: FiCheckCircle },
];

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const logoutStore = useAuthStore((s) => s.logout);

  const storedUser = getStoredUser();
  const isLoggedIn = Boolean(localStorage.getItem('token') && storedUser);
  const isAdmin = !!storedUser && (storedUser.role === 'admin' || String(storedUser.email || '').toLowerCase() === 'admin@gmail.com');
  const handleLogout = () => { logoutStore(); navigate('/'); };

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login', { replace: true });
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data } = await getOrderAPI(id);
        if (!cancelled) setOrder(data.order);
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.message || '주문을 불러올 수 없습니다');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, navigate]);

  const nav = <LandingNavbar user={storedUser} isLoggedIn={isLoggedIn} isAdmin={isAdmin} onLogout={handleLogout} />;

  if (loading) {
    return (
      <div className="landing mp-landing">
        {nav}
        <main className="mp-main"><div className="mp-container"><div className="mp-loading-inline"><div className="spinner" /></div></div></main>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="landing mp-landing">
        {nav}
        <main className="mp-main">
          <div className="mp-container">
            <p className="mp-page-title">{error || '주문을 찾을 수 없습니다'}</p>
            <Link to="/mypage" className="mp-btn-primary">마이페이지로</Link>
          </div>
        </main>
      </div>
    );
  }

  const sa = order.shippingAddress || {};
  const currentIdx = PIPELINE_STEPS.findIndex((s) => s.key === order.status);

  return (
    <div className="landing mp-landing">
      {nav}
      <main className="mp-main">
        <div className="mp-container mp-container--narrow">
          <button type="button" className="mp-detail-back" onClick={() => navigate('/mypage')}>
            <FiArrowLeft /> 주문목록으로
          </button>

          <div className="mp-card">
            <div className="mp-detail-header">
              <div>
                <h2 className="mp-card-title">주문 상세</h2>
                <p className="mp-detail-meta">
                  #{order._id.slice(-8).toUpperCase()} · {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <span className={`mp-badge ${STATUS_BADGE[order.status] || 'mp-badge--gray'}`}>{order.status}</span>
            </div>

            {order.status !== '취소' && (
              <div className="mp-detail-timeline">
                {PIPELINE_STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  const done = currentIdx >= idx;
                  return [
                    idx > 0 && <div key={`line-${step.key}`} className={`mp-tl-line ${done ? 'mp-tl-line--done' : ''}`} />,
                    <div key={step.key} className="mp-tl-step">
                      <div className={`mp-tl-dot ${done ? 'mp-tl-dot--done' : ''}`}>
                        <Icon />
                      </div>
                      <span className={`mp-tl-label ${done ? 'mp-tl-label--done' : ''}`}>{step.label}</span>
                    </div>,
                  ];
                })}
              </div>
            )}

            <div className="mp-detail-section">
              <h3 className="mp-detail-section-title">주문 상품</h3>
              <div className="mp-detail-items">
                {order.orderItems?.map((item, i) => (
                  <Link
                    key={i}
                    to={`/products/${typeof item.product === 'object' ? item.product._id : item.product}`}
                    className="mp-detail-item"
                  >
                    <img
                      src={item.image || 'https://placehold.co/56x56?text=No'}
                      alt={item.name}
                      className="mp-ocard-thumb"
                    />
                    <div className="mp-ocard-prod-info">
                      <p className="mp-ocard-prod-name">{item.name}</p>
                      <p className="mp-ocard-prod-qty">수량: {item.quantity}개</p>
                    </div>
                    <span className="mp-detail-item-price">{(item.price * item.quantity).toLocaleString()}원</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="mp-detail-section">
              <h3 className="mp-detail-section-title">배송지 정보</h3>
              <dl className="mp-info-list mp-info-list--detail">
                <div className="mp-info-row"><dt>받는분</dt><dd>{sa.name || '-'}</dd></div>
                <div className="mp-info-row"><dt>연락처</dt><dd>{sa.phone || '-'}</dd></div>
                <div className="mp-info-row mp-info-row--full">
                  <dt>주소</dt>
                  <dd>{sa.zipCode && `(${sa.zipCode}) `}{sa.city} {sa.street}</dd>
                </div>
              </dl>
            </div>

            <div className="mp-detail-section">
              <h3 className="mp-detail-section-title">결제 정보</h3>
              <dl className="mp-info-list mp-info-list--detail">
                <div className="mp-info-row"><dt>상품금액</dt><dd>{order.itemsPrice?.toLocaleString()}원</dd></div>
                <div className="mp-info-row"><dt>배송비</dt><dd>{order.shippingPrice === 0 ? '무료' : `${order.shippingPrice?.toLocaleString()}원`}</dd></div>
                <div className="mp-info-row mp-info-row--full mp-detail-total-row">
                  <dt>총 결제금액</dt>
                  <dd><strong>{order.totalPrice?.toLocaleString()}원</strong></dd>
                </div>
                <div className="mp-info-row"><dt>결제수단</dt><dd>{order.paymentMethod}</dd></div>
                <div className="mp-info-row"><dt>결제상태</dt><dd>{order.isPaid ? '결제 완료' : '결제 대기'}</dd></div>
              </dl>
            </div>

            <div className="mp-detail-actions">
              <button type="button" className="mp-ocard-btn mp-ocard-btn--outline" onClick={() => navigate('/mypage')}>
                주문목록
              </button>
              {order.status === '배송중' && (
                <button type="button" className="mp-ocard-btn">배송조회</button>
              )}
              {order.status === '배송완료' && (
                <button type="button" className="mp-ocard-btn">구매확정</button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
