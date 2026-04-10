import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import { createOrderAPI } from '../api/orders';
import { getSaleUnitPrice } from '../utils/cartPricing';
import toast from 'react-hot-toast';
import './CheckoutPage.css';

const PAYMENT_METHODS = ['카드', '계좌이체', '카카오페이', '네이버페이'];
const FREE_SHIP_THRESHOLD = 50000;

export default function CheckoutPage() {
  const rawItems = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const removeItemsByIds = useCartStore((s) => s.removeItemsByIds);
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const items = useMemo(() => {
    const ids = location.state?.cartItemIds;
    if (!ids || !Array.isArray(ids) || ids.length === 0) return rawItems;
    const idSet = new Set(ids.map(String));
    return rawItems.filter((i) => idSet.has(String(i._id)));
  }, [rawItems, location.state]);

  useEffect(() => {
    if (rawItems.length === 0) {
      navigate('/cart', { replace: true });
      return;
    }
    if (items.length === 0) {
      toast.error('주문할 상품이 없습니다');
      navigate('/cart', { replace: true });
    }
  }, [rawItems.length, items.length, navigate]);

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    zipCode: user?.address?.zipCode || '',
  });
  const [paymentMethod, setPaymentMethod] = useState('카드');
  const [loading, setLoading] = useState(false);

  const totalPrice = items.reduce(
    (acc, i) => acc + getSaleUnitPrice(i) * i.quantity,
    0
  );
  const shippingPrice = totalPrice >= FREE_SHIP_THRESHOLD ? 0 : 3000;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error('장바구니가 비어 있습니다');
      return;
    }
    setLoading(true);
    try {
      const orderItems = items.map((i) => ({
        product: i._id,
        name: i.name,
        quantity: i.quantity,
        price: getSaleUnitPrice(i),
        image: i.images?.[0] || '',
      }));
      const orderedIds = items.map((i) => i._id);
      const { data } = await createOrderAPI({
        orderItems,
        shippingAddress: form,
        paymentMethod,
      });
      if (orderedIds.length === rawItems.length) {
        clearCart();
      } else {
        removeItemsByIds(orderedIds);
      }
      toast.success('주문이 완료되었습니다!');
      navigate(`/orders/${data.order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || '주문에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  if (rawItems.length === 0 || items.length === 0) {
    return null;
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 className="page-title">주문하기</h1>
        <div className="checkout-layout">
          <form onSubmit={handleSubmit} className="checkout-form">
            <div className="checkout-section card">
              <h3>배송 정보</h3>
              <div className="checkout-fields">
                <div className="form-group">
                  <label>받는 분</label>
                  <input name="name" value={form.name} onChange={handleChange} required placeholder="이름" />
                </div>
                <div className="form-group">
                  <label>연락처</label>
                  <input name="phone" value={form.phone} onChange={handleChange} required placeholder="010-0000-0000" />
                </div>
                <div className="form-group form-full">
                  <label>주소</label>
                  <input name="street" value={form.street} onChange={handleChange} required placeholder="상세 주소" />
                </div>
                <div className="form-group">
                  <label>도시</label>
                  <input name="city" value={form.city} onChange={handleChange} required placeholder="도시" />
                </div>
                <div className="form-group">
                  <label>우편번호</label>
                  <input name="zipCode" value={form.zipCode} onChange={handleChange} required placeholder="우편번호" />
                </div>
              </div>
            </div>
            <div className="checkout-section card">
              <h3>결제 수단</h3>
              <div className="payment-options">
                {PAYMENT_METHODS.map((method) => (
                  <label key={method} className={`payment-option ${paymentMethod === method ? 'active' : ''}`}>
                    <input type="radio" value={method} checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} />
                    {method}
                  </label>
                ))}
              </div>
            </div>
            <button type="submit" className="btn btn-primary place-order-btn" disabled={loading}>
              {loading ? '처리 중...' : `${(totalPrice + shippingPrice).toLocaleString()}원 결제하기`}
            </button>
          </form>
          <div className="checkout-summary card">
            <h3>주문 상품</h3>
            {items.map((item) => {
              const unit = getSaleUnitPrice(item);
              const line = unit * item.quantity;
              return (
                <div key={item._id} className="checkout-item">
                  <img src={item.images?.[0] || 'https://placehold.co/50x50?text=No'} alt={item.name} />
                  <div className="checkout-item-info">
                    <p>{item.name}</p>
                    <span>{item.quantity}개</span>
                  </div>
                  <span>{line.toLocaleString()}원</span>
                </div>
              );
            })}
            <div className="checkout-totals">
              <div className="checkout-row">
                <span>상품 금액</span>
                <span>{totalPrice.toLocaleString()}원</span>
              </div>
              <div className="checkout-row">
                <span>배송비</span>
                <span>{shippingPrice === 0 ? '무료' : `${shippingPrice.toLocaleString()}원`}</span>
              </div>
              <div className="checkout-total">
                <span>총 결제 금액</span>
                <span>{(totalPrice + shippingPrice).toLocaleString()}원</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
