import { useState, useMemo, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import { getStoredUser } from '../utils/authStorage';
import { createOrderAPI } from '../api/orders';
import { getSaleUnitPrice, getListUnitPrice, hasLineDiscount } from '../utils/cartPricing';
import { getProductName } from '../utils/productLocale';
import { formatCurrency } from '../utils/formatCurrency';
import { openDaumPostcode } from '../utils/daumPostcode';
import {
  clearPortOnePendingPayload,
  getPortOneChannelKey,
  getPortOneRedirectUrl,
  getPortOneStoreId,
  getPortOneWindowType,
  setPortOnePendingPayload,
} from '../utils/portoneConfig';
import LandingNavbar from '../components/landing/LandingNavbar';
import { FiChevronDown } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './HomePage.css';
import './CheckoutPage.css';

const PAYMENT_METHODS = ['카드', '계좌이체', '카카오페이', '네이버페이'];
const PAY_METHOD_MAP = {
  '카드': 'CARD',
  '계좌이체': 'TRANSFER',
  '카카오페이': 'EASY_PAY',
  '네이버페이': 'EASY_PAY',
};
const FREE_SHIP_THRESHOLD = 50000;
const SHIP_MSG_OPTIONS = [
  '배송 시 요청사항을 선택해 주세요',
  '문 앞에 놓아주세요',
  '경비실에 맡겨주세요',
  '직접 수령할게요',
  '배송 전 연락 바랍니다',
];

function AccordionSection({ title, id, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="co-acc" id={id}>
      <button
        type="button"
        className="co-acc-head"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="co-acc-title">{title}</span>
        <FiChevronDown className={`co-acc-chevron ${open ? 'co-acc-chevron--open' : ''}`} aria-hidden />
      </button>
      {open && <div className="co-acc-body">{children}</div>}
    </section>
  );
}

export default function CheckoutPage() {
  const rawItems = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const removeItemsByIds = useCartStore((s) => s.removeItemsByIds);
  const logoutStore = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(getStoredUser);

  const items = useMemo(() => {
    const ids = location.state?.cartItemIds;
    if (!ids || !Array.isArray(ids) || ids.length === 0) return rawItems;
    const idSet = new Set(ids.map(String));
    return rawItems.filter((i) => idSet.has(String(i._id)));
  }, [rawItems, location.state]);

  const u = user || {};
  const addr = u.address || {};

  const [orderer, setOrderer] = useState({
    name: u.name || '',
    email: u.email || '',
    phone: u.phone || '',
    streetMain: addr.street || '',
    streetDetail: '',
    city: addr.city || '',
    zipCode: addr.zipCode || '',
  });

  const [ship, setShip] = useState({
    name: '',
    phone: '',
    streetMain: '',
    streetDetail: '',
    city: '',
    zipCode: '',
  });

  const [sameAsOrderer, setSameAsOrderer] = useState(false);
  const [shippingMessage, setShippingMessage] = useState(SHIP_MSG_OPTIONS[0]);
  const [paymentMethod, setPaymentMethod] = useState('카드');
  const [loading, setLoading] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
  }, [location.pathname]);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      toast.error('로그인이 필요합니다');
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (paymentDone) return;
    if (rawItems.length === 0) {
      navigate('/cart', { replace: true });
      return;
    }
    if (items.length === 0) {
      toast.error('주문할 상품이 없습니다');
      navigate('/cart', { replace: true });
    }
  }, [rawItems.length, items.length, navigate, paymentDone]);

  useEffect(() => {
    if (sameAsOrderer) {
      setShip({
        name: orderer.name,
        phone: orderer.phone,
        streetMain: orderer.streetMain,
        streetDetail: orderer.streetDetail,
        city: orderer.city,
        zipCode: orderer.zipCode,
      });
    }
  }, [sameAsOrderer, orderer]);

  const handleLogout = () => {
    logoutStore();
    setUser(null);
    navigate('/');
  };

  const isLoggedIn = Boolean(localStorage.getItem('token') && user);
  const isAdmin =
    !!user &&
    (user.role === 'admin' || String(user.email || '').toLowerCase() === 'admin@gmail.com');

  const listSubtotal = items.reduce(
    (acc, i) => acc + getListUnitPrice(i) * i.quantity,
    0
  );
  const saleSubtotal = items.reduce(
    (acc, i) => acc + getSaleUnitPrice(i) * i.quantity,
    0
  );
  const discountTotal = Math.max(0, listSubtotal - saleSubtotal);
  const shippingPrice = saleSubtotal >= FREE_SHIP_THRESHOLD ? 0 : 3000;
  const payTotal = saleSubtotal + shippingPrice;

  const changeOrderer = (e) => {
    const { name, value } = e.target;
    setOrderer((prev) => ({ ...prev, [name]: value }));
  };

  const changeShip = (e) => {
    const { name, value } = e.target;
    setShip((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressSearch = async (which) => {
    try {
      const r = await openDaumPostcode();
      if (!r) return;
      if (which === 'orderer') {
        setOrderer((prev) => ({
          ...prev,
          zipCode: r.zipCode,
          city: r.city,
          streetMain: r.street,
          streetDetail: '',
        }));
      } else {
        setShip((prev) => ({
          ...prev,
          zipCode: r.zipCode,
          city: r.city,
          streetMain: r.street,
          streetDetail: '',
        }));
      }
    } catch {
      toast.error('주소 검색을 불러올 수 없습니다. 네트워크를 확인해 주세요.');
    }
  };

  const shippingAddressForApi = useCallback(() => {
    const src = sameAsOrderer ? orderer : ship;
    const main = (src.streetMain || '').trim();
    const detail = (src.streetDetail || '').trim();
    const street = [main, detail].filter(Boolean).join(' ').trim();
    return {
      name: src.name.trim(),
      phone: src.phone.trim(),
      street,
      city: (src.city || '').trim(),
      zipCode: (src.zipCode || '').trim(),
    };
  }, [sameAsOrderer, orderer, ship]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error('장바구니가 비어 있습니다');
      return;
    }
    const sa = shippingAddressForApi();
    if (!sa.name || !sa.phone || !sa.street) {
      toast.error('배송 정보를 모두 입력해 주세요');
      return;
    }
    if (!sa.city || !sa.zipCode) {
      toast.error('주소찾기로 기본 주소를 선택해 주세요');
      return;
    }

    if (!window.PortOne) {
      toast.error('결제 모듈을 불러오지 못했습니다. 페이지를 새로고침 해주세요.');
      return;
    }

    setLoading(true);

    const orderItems = items.map((i) => ({
      product: i._id,
      name: getProductName(i),
      quantity: i.quantity,
      price: getSaleUnitPrice(i),
      image: i.images?.[0] || '',
    }));

    const paymentId = `payment_${Date.now()}`;
    const orderName =
      items.length === 1
        ? getProductName(items[0])
        : `${getProductName(items[0])} 외 ${items.length - 1}건`;

    const pendingPayload = {
      orderItems,
      shippingAddress: sa,
      paymentMethod,
      orderedProductIds: items.map((i) => i._id),
      rawItemsLength: rawItems.length,
    };

    try {
      const payMethod = PAY_METHOD_MAP[paymentMethod] || 'CARD';
      setPortOnePendingPayload(paymentId, pendingPayload);

      const paymentRequest = {
        storeId: getPortOneStoreId(),
        channelKey: getPortOneChannelKey(),
        paymentId,
        orderName,
        totalAmount: payTotal,
        currency: 'CURRENCY_KRW',
        payMethod,
        customer: {
          fullName: orderer.name,
          email: orderer.email || undefined,
          phoneNumber: orderer.phone,
        },
        redirectUrl: getPortOneRedirectUrl(),
        forceRedirect: true,
      };

      const windowType = getPortOneWindowType();
      if (windowType) {
        paymentRequest.windowType = windowType;
      }

      if (payMethod === 'EASY_PAY') {
        if (paymentMethod === '카카오페이') {
          paymentRequest.easyPay = { easyPayProvider: 'KAKAOPAY' };
        } else if (paymentMethod === '네이버페이') {
          paymentRequest.easyPay = { easyPayProvider: 'NAVERPAY' };
        }
      }

      const response = await window.PortOne.requestPayment(paymentRequest);

      // 리다이렉트(대부분 모바일·iOS) 시 복귀는 /payment/callback 에서 처리됨.
      if (response == null || typeof response !== 'object') {
        return;
      }

      if (response.code != null) {
        clearPortOnePendingPayload(paymentId);
        setLoading(false);
        navigate('/order-fail', {
          state: { message: response.message || '결제가 취소되었습니다' },
        });
        return;
      }

      const orderedIds = items.map((i) => i._id);
      const { data } = await createOrderAPI({
        orderItems,
        shippingAddress: sa,
        paymentMethod,
        paymentResult: {
          paymentId: response.paymentId,
          txId: response.txId,
        },
      });

      clearPortOnePendingPayload(paymentId);

      setPaymentDone(true);

      if (orderedIds.length === rawItems.length) {
        clearCart();
      } else {
        removeItemsByIds(orderedIds);
      }
      navigate('/order-success', {
        state: { orderId: data.order._id },
      });
    } catch (err) {
      clearPortOnePendingPayload(paymentId);
      const msg = err.response?.data?.message || err.message || '결제 처리 중 오류가 발생했습니다';
      navigate('/order-fail', { state: { message: msg } });
    } finally {
      setLoading(false);
    }
  };

  const nav = (
    <LandingNavbar
      user={user}
      isLoggedIn={isLoggedIn}
      isAdmin={isAdmin}
      onLogout={handleLogout}
    />
  );

  if (rawItems.length === 0 || items.length === 0) {
    return null;
  }

  return (
    <div className="landing checkout-landing">
      {nav}
      <main className="co-main">
        <div className="co-container">
          <nav className="co-breadcrumb" aria-label="breadcrumb">
            <Link to="/">홈</Link>
            <span className="co-bc-sep" aria-hidden>
              {' '}
              &gt;{' '}
            </span>
            <span className="co-bc-current">주문결제</span>
          </nav>

          <h1 className="co-page-title">주문결제</h1>

          <form onSubmit={handleSubmit} className="co-layout">
            <div className="co-left">
              <AccordionSection title="구매상품" id="items" defaultOpen>
                <ul className="co-item-list">
                  {items.map((item) => {
                    const listU = getListUnitPrice(item);
                    const saleU = getSaleUnitPrice(item);
                    const lineSale = saleU * item.quantity;
                    return (
                      <li key={item._id} className="co-line">
                        <img
                          className="co-line-thumb"
                          src={item.images?.[0] || 'https://placehold.co/72x72?text=No'}
                          alt=""
                        />
                        <div className="co-line-main">
                          <p className="co-line-name">{getProductName(item)}</p>
                          <p className="co-line-qty">수량 {item.quantity}</p>
                        </div>
                        <div className="co-line-prices">
                          {hasLineDiscount(item) && (
                            <span className="co-line-list">{formatCurrency(listU * item.quantity)}</span>
                          )}
                          <span className="co-line-sale">{formatCurrency(lineSale)}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </AccordionSection>

              <AccordionSection title="주문 정보" id="orderer" defaultOpen>
                <div className="co-fields">
                  <label className="co-label">
                    이름 <span className="co-req">*</span>
                    <input
                      name="name"
                      value={orderer.name}
                      onChange={changeOrderer}
                      required
                      autoComplete="name"
                      className="co-input"
                    />
                  </label>
                  <label className="co-label">
                    이메일
                    <input
                      name="email"
                      type="email"
                      value={orderer.email}
                      onChange={changeOrderer}
                      autoComplete="email"
                      className="co-input"
                      placeholder="order@example.com"
                    />
                  </label>
                  <label className="co-label">
                    휴대폰 번호 <span className="co-req">*</span>
                    <input
                      name="phone"
                      value={orderer.phone}
                      onChange={changeOrderer}
                      required
                      autoComplete="tel"
                      className="co-input"
                    />
                  </label>
                  <label className="co-label co-label-full">
                    주소 <span className="co-req">*</span>
                    <div className="co-addr-row">
                      <input
                        name="streetMain"
                        value={orderer.streetMain}
                        onChange={changeOrderer}
                        required
                        className="co-input co-input-grow"
                        placeholder="주소찾기로 검색한 도로명 주소"
                        readOnly
                      />
                      <button type="button" className="co-btn-ghost" onClick={() => handleAddressSearch('orderer')}>
                        주소찾기
                      </button>
                    </div>
                  </label>
                  <label className="co-label co-label-full">
                    상세주소
                    <input
                      name="streetDetail"
                      value={orderer.streetDetail}
                      onChange={changeOrderer}
                      className="co-input"
                      placeholder="동·호수 등 상세주소를 입력해 주세요"
                      autoComplete="address-line2"
                    />
                  </label>
                </div>
              </AccordionSection>

              <AccordionSection title="배송지" id="ship" defaultOpen>
                <label className="co-check">
                  <input
                    type="checkbox"
                    checked={sameAsOrderer}
                    onChange={(e) => setSameAsOrderer(e.target.checked)}
                  />
                  주문자 정보와 동일
                </label>
                <div className="co-fields co-fields-mt">
                  <label className="co-label">
                    받는 분 <span className="co-req">*</span>
                    <input
                      name="name"
                      value={ship.name}
                      onChange={changeShip}
                      required
                      className="co-input"
                      readOnly={sameAsOrderer}
                      autoComplete="shipping name"
                    />
                  </label>
                  <label className="co-label">
                    휴대폰 <span className="co-req">*</span>
                    <input
                      name="phone"
                      value={ship.phone}
                      onChange={changeShip}
                      required
                      className="co-input"
                      readOnly={sameAsOrderer}
                      autoComplete="shipping tel"
                    />
                  </label>
                  <label className="co-label co-label-full">
                    주소 <span className="co-req">*</span>
                    <div className="co-addr-row">
                      <input
                        name="streetMain"
                        value={ship.streetMain}
                        onChange={changeShip}
                        required
                        className="co-input co-input-grow"
                        placeholder="주소찾기로 검색한 도로명 주소"
                        readOnly
                      />
                      <button
                        type="button"
                        className="co-btn-ghost"
                        disabled={sameAsOrderer}
                        onClick={() => handleAddressSearch('ship')}
                      >
                        주소찾기
                      </button>
                    </div>
                  </label>
                  <label className="co-label co-label-full">
                    상세주소
                    <input
                      name="streetDetail"
                      value={ship.streetDetail}
                      onChange={changeShip}
                      className="co-input"
                      placeholder="동·호수 등 상세주소를 입력해 주세요"
                      autoComplete="address-line2"
                      readOnly={sameAsOrderer}
                    />
                  </label>
                </div>
                <label className="co-label co-label-full co-fields-mt">
                  배송 메시지
                  <select
                    className="co-select"
                    value={shippingMessage}
                    onChange={(e) => setShippingMessage(e.target.value)}
                  >
                    {SHIP_MSG_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </label>
              </AccordionSection>

              <AccordionSection title="포인트 / 쿠폰 / 혜택" id="benefit" defaultOpen={false}>
                <div className="co-benefit-grid">
                  <label className="co-label">
                    포인트
                    <input className="co-input" disabled placeholder="0 P (준비 중)" />
                  </label>
                  <label className="co-label">
                    쿠폰 코드
                    <input className="co-input" disabled placeholder="쿠폰 번호 입력" />
                  </label>
                </div>
                <p className="co-hint">포인트·쿠폰 적용은 추후 연동 예정입니다.</p>
              </AccordionSection>

              <AccordionSection title="결제수단" id="pay" defaultOpen>
                <div className="co-pay-grid">
                  {PAYMENT_METHODS.map((method) => (
                    <label
                      key={method}
                      className={`co-pay-option ${paymentMethod === method ? 'co-pay-option--on' : ''}`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method}
                        checked={paymentMethod === method}
                        onChange={() => setPaymentMethod(method)}
                      />
                      {method}
                    </label>
                  ))}
                </div>
              </AccordionSection>
            </div>

            <aside className="co-aside">
              <div className="co-summary">
                <h2 className="co-summary-title">결제 금액</h2>
                <div className="co-summary-rows">
                  <div className="co-sum-row">
                    <span>구매금액</span>
                    <span>{formatCurrency(saleSubtotal)}</span>
                  </div>
                  <div className="co-sum-row">
                    <span>배송비</span>
                    <span>{shippingPrice === 0 ? '무료' : formatCurrency(shippingPrice)}</span>
                  </div>
                  <div className="co-sum-row co-sum-row--discount">
                    <span>할인·부가혜택</span>
                    <span>-{formatCurrency(discountTotal)}</span>
                  </div>
                </div>
                <div className="co-sum-final">
                  <span>최종 결제 금액</span>
                  <strong>{formatCurrency(payTotal)}</strong>
                </div>
                <p className="co-sum-points">적립 예정 · 추후 멤버십 연동</p>
                <button type="submit" className="co-pay-submit" disabled={loading}>
                  {loading ? '처리 중…' : `${formatCurrency(payTotal)} 결제하기`}
                </button>
                <Link to="/cart" className="co-back-cart">
                  장바구니로 돌아가기
                </Link>
              </div>
            </aside>
          </form>
        </div>
      </main>
    </div>
  );
}
