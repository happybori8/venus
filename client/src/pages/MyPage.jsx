import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getMeAPI, updateMeAPI, changePasswordAPI } from '../api/auth';
import { getMyOrdersAPI } from '../api/orders';
import { openDaumPostcode } from '../utils/daumPostcode';
import LandingNavbar from '../components/landing/LandingNavbar';
import useAuthStore from '../store/authStore';
import { getStoredUser } from '../utils/authStorage';
import { FiUser, FiPackage, FiLock, FiChevronRight, FiEdit3, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './HomePage.css';
import './MyPage.css';

const STATUS_BADGE = {
  '주문완료': 'mp-badge--gray',
  '결제완료': 'mp-badge--blue',
  '배송준비': 'mp-badge--yellow',
  '배송중': 'mp-badge--yellow',
  '배송완료': 'mp-badge--green',
  '취소': 'mp-badge--red',
};

const GENDER_OPTIONS = [
  { value: '', label: '선택 안 함' },
  { value: 'male', label: '남성' },
  { value: 'female', label: '여성' },
  { value: 'other', label: '기타' },
];

const TAB_PROFILE = 'profile';
const TAB_ORDERS = 'orders';
const TAB_PASSWORD = 'password';

export default function MyPage() {
  const navigate = useNavigate();
  const logoutStore = useAuthStore((s) => s.logout);

  const [tab, setTab] = useState(TAB_PROFILE);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersLoaded, setOrdersLoaded] = useState(false);

  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login', { replace: true });
      return;
    }
    (async () => {
      try {
        const { data } = await getMeAPI();
        setUser(data.user);
      } catch {
        toast.error('회원 정보를 불러올 수 없습니다');
        navigate('/login', { replace: true });
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  useEffect(() => {
    if (tab === TAB_ORDERS && !ordersLoaded) {
      setOrdersLoading(true);
      getMyOrdersAPI()
        .then(({ data }) => { setOrders(data.orders); setOrdersLoaded(true); })
        .catch(() => toast.error('주문 내역을 불러올 수 없습니다'))
        .finally(() => setOrdersLoading(false));
    }
  }, [tab, ordersLoaded]);

  const handleLogout = () => {
    logoutStore();
    navigate('/');
  };

  const storedUser = getStoredUser();
  const isLoggedIn = Boolean(localStorage.getItem('token') && storedUser);
  const isAdmin = !!storedUser &&
    (storedUser.role === 'admin' || String(storedUser.email || '').toLowerCase() === 'admin@gmail.com');

  const startEdit = () => {
    const addr = user.address || {};
    setForm({
      name: user.name || '',
      phone: user.phone || '',
      birthDate: user.birthDate ? user.birthDate.slice(0, 10) : '',
      gender: user.gender || '',
      streetMain: addr.street || '',
      streetDetail: addr.detail || '',
      city: addr.city || '',
      zipCode: addr.zipCode || '',
      marketingEmail: user.marketingConsent?.email || false,
      marketingSms: user.marketingConsent?.sms || false,
    });
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const changeForm = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleAddressSearch = async () => {
    try {
      const r = await openDaumPostcode();
      if (!r) return;
      setForm((prev) => ({ ...prev, zipCode: r.zipCode, city: r.city, streetMain: r.street, streetDetail: '' }));
    } catch {
      toast.error('주소 검색을 불러올 수 없습니다');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('이름을 입력해 주세요'); return; }
    if (!form.phone.trim()) { toast.error('휴대폰 번호를 입력해 주세요'); return; }
    setSaving(true);
    try {
      const main = (form.streetMain || '').trim();
      const detail = (form.streetDetail || '').trim();
      const { data } = await updateMeAPI({
        name: form.name.trim(),
        phone: form.phone.trim(),
        birthDate: form.birthDate || null,
        gender: form.gender,
        address: {
          street: main,
          detail,
          city: (form.city || '').trim(),
          zipCode: (form.zipCode || '').trim(),
        },
        marketingConsent: {
          email: form.marketingEmail,
          sms: form.marketingSms,
        },
      });
      setUser(data.user);
      setEditing(false);
      toast.success('회원 정보가 수정되었습니다');
    } catch (err) {
      toast.error(err.response?.data?.message || '수정에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pw.newPassword.length < 6) { toast.error('새 비밀번호는 6자 이상이어야 합니다'); return; }
    if (pw.newPassword !== pw.confirmPassword) { toast.error('새 비밀번호가 일치하지 않습니다'); return; }
    setPwSaving(true);
    try {
      await changePasswordAPI({ currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      toast.success('비밀번호가 변경되었습니다');
      setPw({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || '비밀번호 변경에 실패했습니다');
    } finally {
      setPwSaving(false);
    }
  };

  if (loading) {
    return <div className="mp-loading"><div className="spinner" /></div>;
  }

  const addr = user?.address || {};
  const fullAddress = [addr.street, addr.detail, addr.city].filter(Boolean).join(' ');

  return (
    <div className="landing mp-landing">
      <LandingNavbar user={storedUser} isLoggedIn={isLoggedIn} isAdmin={isAdmin} onLogout={handleLogout} />
      <main className="mp-main">
        <div className="mp-container">
          <h1 className="mp-page-title">마이페이지</h1>

          <div className="mp-layout">
            <aside className="mp-sidebar">
              <div className="mp-profile-summary">
                <div className="mp-avatar">{user?.name?.charAt(0) || 'U'}</div>
                <p className="mp-profile-name">{user?.name}</p>
                <p className="mp-profile-email">{user?.email}</p>
              </div>
              <nav className="mp-nav">
                <button className={`mp-nav-btn ${tab === TAB_PROFILE ? 'mp-nav-btn--active' : ''}`} onClick={() => setTab(TAB_PROFILE)}>
                  <FiUser /> 회원 정보
                </button>
                <button className={`mp-nav-btn ${tab === TAB_ORDERS ? 'mp-nav-btn--active' : ''}`} onClick={() => setTab(TAB_ORDERS)}>
                  <FiPackage /> 주문 내역
                </button>
                <button className={`mp-nav-btn ${tab === TAB_PASSWORD ? 'mp-nav-btn--active' : ''}`} onClick={() => setTab(TAB_PASSWORD)}>
                  <FiLock /> 비밀번호 변경
                </button>
              </nav>
            </aside>

            <section className="mp-content">
              {tab === TAB_PROFILE && !editing && (
                <div className="mp-card">
                  <div className="mp-card-head">
                    <h2 className="mp-card-title">회원 정보</h2>
                    <button className="mp-btn-edit" onClick={startEdit}><FiEdit3 /> 수정</button>
                  </div>
                  <dl className="mp-info-list">
                    <div className="mp-info-row"><dt>이름</dt><dd>{user?.name || '-'}</dd></div>
                    <div className="mp-info-row"><dt>이메일</dt><dd>{user?.email || '-'}</dd></div>
                    <div className="mp-info-row"><dt>휴대폰</dt><dd>{user?.phone || '-'}</dd></div>
                    <div className="mp-info-row"><dt>생년월일</dt><dd>{user?.birthDate ? new Date(user.birthDate).toLocaleDateString() : '-'}</dd></div>
                    <div className="mp-info-row"><dt>성별</dt><dd>{GENDER_OPTIONS.find((g) => g.value === user?.gender)?.label || '-'}</dd></div>
                    <div className="mp-info-row mp-info-row--full"><dt>주소</dt><dd>{fullAddress || '-'}{addr.zipCode ? ` (${addr.zipCode})` : ''}</dd></div>
                    <div className="mp-info-row"><dt>마케팅 수신</dt><dd>이메일 {user?.marketingConsent?.email ? '동의' : '미동의'} · SMS {user?.marketingConsent?.sms ? '동의' : '미동의'}</dd></div>
                  </dl>
                </div>
              )}

              {tab === TAB_PROFILE && editing && (
                <form className="mp-card" onSubmit={handleSave}>
                  <div className="mp-card-head">
                    <h2 className="mp-card-title">회원 정보 수정</h2>
                    <button type="button" className="mp-btn-edit" onClick={cancelEdit}><FiX /> 취소</button>
                  </div>
                  <div className="mp-form-grid">
                    <label className="mp-label">
                      이름 <span className="mp-req">*</span>
                      <input name="name" value={form.name} onChange={changeForm} required className="mp-input" />
                    </label>
                    <label className="mp-label">
                      휴대폰 <span className="mp-req">*</span>
                      <input name="phone" value={form.phone} onChange={changeForm} required className="mp-input" />
                    </label>
                    <label className="mp-label">
                      생년월일
                      <input name="birthDate" type="date" value={form.birthDate} onChange={changeForm} className="mp-input" />
                    </label>
                    <label className="mp-label">
                      성별
                      <select name="gender" value={form.gender} onChange={changeForm} className="mp-input">
                        {GENDER_OPTIONS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                      </select>
                    </label>
                    <label className="mp-label mp-label--full">
                      주소
                      <div className="mp-addr-row">
                        <input name="streetMain" value={form.streetMain} readOnly className="mp-input mp-input--grow" placeholder="주소찾기로 검색" />
                        <button type="button" className="mp-btn-ghost" onClick={handleAddressSearch}>주소찾기</button>
                      </div>
                    </label>
                    <label className="mp-label mp-label--full">
                      상세주소
                      <input name="streetDetail" value={form.streetDetail} onChange={changeForm} className="mp-input" placeholder="동·호수 등" />
                    </label>
                    <div className="mp-label mp-label--full mp-consent-row">
                      <span className="mp-consent-title">마케팅 수신 동의</span>
                      <label className="mp-checkbox"><input type="checkbox" name="marketingEmail" checked={form.marketingEmail} onChange={changeForm} /> 이메일</label>
                      <label className="mp-checkbox"><input type="checkbox" name="marketingSms" checked={form.marketingSms} onChange={changeForm} /> SMS</label>
                    </div>
                  </div>
                  <button type="submit" className="mp-btn-primary" disabled={saving}>
                    {saving ? '저장 중…' : '저장하기'}
                  </button>
                </form>
              )}

              {tab === TAB_ORDERS && (
                <div className="mp-card">
                  <div className="mp-card-head">
                    <h2 className="mp-card-title">주문 내역</h2>
                  </div>
                  {ordersLoading ? (
                    <div className="mp-loading-inline"><div className="spinner" /></div>
                  ) : orders.length === 0 ? (
                    <div className="mp-empty">
                      <FiPackage size={48} />
                      <p>주문 내역이 없습니다</p>
                      <Link to="/products" className="mp-btn-primary">쇼핑하러 가기</Link>
                    </div>
                  ) : (
                    <ul className="mp-order-list">
                      {orders.map((order) => (
                        <li key={order._id} className="mp-order-item">
                          <div className="mp-order-top">
                            <div>
                              <span className="mp-order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                              <span className="mp-order-id">#{order._id.slice(-8).toUpperCase()}</span>
                            </div>
                            <span className={`mp-badge ${STATUS_BADGE[order.status] || 'mp-badge--gray'}`}>{order.status}</span>
                          </div>
                          <div className="mp-order-products">
                            {order.orderItems.slice(0, 2).map((item, i) => (
                              <div key={i} className="mp-order-prod">
                                <img src={item.image || 'https://placehold.co/48x48?text=No'} alt={item.name} className="mp-order-thumb" />
                                <span className="mp-order-prod-name">{item.name}</span>
                                <span className="mp-order-prod-qty">{item.quantity}개</span>
                              </div>
                            ))}
                            {order.orderItems.length > 2 && (
                              <p className="mp-order-more">외 {order.orderItems.length - 2}건</p>
                            )}
                          </div>
                          <div className="mp-order-bottom">
                            <strong className="mp-order-total">{order.totalPrice.toLocaleString()}원</strong>
                            <Link to={`/orders/${order._id}`} className="mp-order-detail-link">
                              상세 보기 <FiChevronRight />
                            </Link>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {tab === TAB_PASSWORD && (
                <form className="mp-card" onSubmit={handlePasswordChange}>
                  <div className="mp-card-head">
                    <h2 className="mp-card-title">비밀번호 변경</h2>
                  </div>
                  <div className="mp-form-grid mp-form-grid--narrow">
                    <label className="mp-label mp-label--full">
                      현재 비밀번호
                      <input type="password" value={pw.currentPassword} onChange={(e) => setPw((p) => ({ ...p, currentPassword: e.target.value }))} required className="mp-input" />
                    </label>
                    <label className="mp-label mp-label--full">
                      새 비밀번호
                      <input type="password" value={pw.newPassword} onChange={(e) => setPw((p) => ({ ...p, newPassword: e.target.value }))} required minLength={6} className="mp-input" placeholder="6자 이상" />
                    </label>
                    <label className="mp-label mp-label--full">
                      새 비밀번호 확인
                      <input type="password" value={pw.confirmPassword} onChange={(e) => setPw((p) => ({ ...p, confirmPassword: e.target.value }))} required className="mp-input" />
                    </label>
                  </div>
                  <button type="submit" className="mp-btn-primary" disabled={pwSaving}>
                    {pwSaving ? '변경 중…' : '비밀번호 변경'}
                  </button>
                </form>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
