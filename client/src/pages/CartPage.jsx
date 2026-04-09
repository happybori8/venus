import { Link, useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './CartPage.css';

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const totalPrice = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const shippingPrice = totalPrice >= 50000 ? 0 : 3000;

  const handleCheckout = () => {
    if (!isAuthenticated) { toast.error('로그인이 필요합니다'); navigate('/login'); return; }
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <h1 className="page-title">장바구니</h1>
          <div className="empty-state">
            <FiShoppingBag size={60} />
            <p>장바구니가 비어 있습니다</p>
            <Link to="/products" className="btn btn-primary">쇼핑 계속하기</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1 className="page-title">장바구니</h1>
        <div className="cart-layout">
          <div className="cart-items">
            <div className="cart-header">
              <span>{items.length}개 상품</span>
              <button className="clear-btn" onClick={() => { clearCart(); toast.success('장바구니를 비웠습니다'); }}>전체 삭제</button>
            </div>
            {items.map((item) => (
              <div key={item._id} className="cart-item">
                <Link to={`/products/${item._id}`} className="cart-item-img">
                  <img src={item.images?.[0] || 'https://placehold.co/100x100?text=No+Image'} alt={item.name} />
                </Link>
                <div className="cart-item-info">
                  <Link to={`/products/${item._id}`} className="cart-item-name">{item.name}</Link>
                  <span className="cart-item-price">{item.price.toLocaleString()}원</span>
                </div>
                <div className="cart-item-qty">
                  <button onClick={() => updateQuantity(item._id, item.quantity - 1)}><FiMinus /></button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item._id, item.quantity + 1)}><FiPlus /></button>
                </div>
                <div className="cart-item-total">{(item.price * item.quantity).toLocaleString()}원</div>
                <button className="remove-btn" onClick={() => removeItem(item._id)}><FiTrash2 /></button>
              </div>
            ))}
          </div>
          <div className="cart-summary card">
            <h3>주문 요약</h3>
            <div className="summary-rows">
              <div className="summary-row"><span>상품 금액</span><span>{totalPrice.toLocaleString()}원</span></div>
              <div className="summary-row"><span>배송비</span><span>{shippingPrice === 0 ? '무료' : `${shippingPrice.toLocaleString()}원`}</span></div>
              {shippingPrice > 0 && (
                <p className="free-shipping-notice">{(50000 - totalPrice).toLocaleString()}원 더 담으면 무료 배송!</p>
              )}
              <div className="summary-total"><span>총 결제 금액</span><span>{(totalPrice + shippingPrice).toLocaleString()}원</span></div>
            </div>
            <button className="btn btn-primary checkout-btn" onClick={handleCheckout}>주문하기</button>
            <Link to="/products" className="btn btn-outline continue-btn">쇼핑 계속하기</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
