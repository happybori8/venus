import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getOrderAPI } from '../api/orders';
import { FiArrowLeft } from 'react-icons/fi';
import './OrdersPage.css';

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
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
    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="orders-page">
        <div className="container">
          <div className="loading-spinner">
            <div className="spinner" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="orders-page">
        <div className="container">
          <p className="page-title">{error || '주문을 찾을 수 없습니다'}</p>
          <Link to="/orders" className="btn btn-primary">
            주문 목록으로
          </Link>
        </div>
      </div>
    );
  }

  const addr = order.shippingAddress || {};

  return (
    <div className="orders-page">
      <div className="container">
        <Link to="/orders" className="order-detail-back">
          <FiArrowLeft aria-hidden /> 주문 목록
        </Link>
        <h1 className="page-title">주문 상세</h1>
        <div className="order-card card order-detail-card">
          <div className="order-header">
            <div>
              <span className="order-id">주문번호: {order._id.slice(-8).toUpperCase()}</span>
              <span className="order-date">
                {order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}
              </span>
            </div>
            <span className="badge badge-gray">{order.status}</span>
          </div>
          <p className="order-detail-meta">
            결제수단: {order.paymentMethod} · 결제 {order.isPaid ? '완료' : '대기'}
          </p>
          <div className="order-detail-section">
            <h3>배송지</h3>
            <p>
              {addr.name} · {addr.phone}
              <br />
              ({addr.zipCode}) {addr.city} {addr.street}
            </p>
          </div>
          <div className="order-items">
            {order.orderItems?.map((item, i) => (
              <div key={i} className="order-item">
                <img src={item.image || 'https://placehold.co/60x60?text=No+Image'} alt={item.name} />
                <span className="order-item-name">{item.name}</span>
                <span className="order-item-qty">{item.quantity}개</span>
                <span className="order-item-price">{(item.price * item.quantity).toLocaleString()}원</span>
              </div>
            ))}
          </div>
          <div className="order-footer">
            <span className="order-total">총 {order.totalPrice?.toLocaleString()}원</span>
          </div>
        </div>
      </div>
    </div>
  );
}
