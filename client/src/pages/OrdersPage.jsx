import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrdersAPI } from '../api/orders';
import { FiPackage } from 'react-icons/fi';
import './OrdersPage.css';

const STATUS_BADGE = {
  '주문완료': 'badge-gray', '결제완료': 'badge-blue', '배송준비': 'badge-yellow',
  '배송중': 'badge-yellow', '배송완료': 'badge-green', '취소': 'badge-red',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getMyOrdersAPI();
        setOrders(data.orders);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="orders-page">
      <div className="container">
        <h1 className="page-title">주문 내역</h1>
        {orders.length === 0 ? (
          <div className="empty-state">
            <FiPackage size={60} />
            <p>주문 내역이 없습니다</p>
            <Link to="/products" className="btn btn-primary">쇼핑하러 가기</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card card">
                <div className="order-header">
                  <div>
                    <span className="order-id">주문번호: {order._id.slice(-8).toUpperCase()}</span>
                    <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span className={`badge ${STATUS_BADGE[order.status] || 'badge-gray'}`}>{order.status}</span>
                </div>
                <div className="order-items">
                  {order.orderItems.map((item, i) => (
                    <div key={i} className="order-item">
                      <img src={item.image || 'https://placehold.co/60x60?text=No+Image'} alt={item.name} />
                      <span className="order-item-name">{item.name}</span>
                      <span className="order-item-qty">{item.quantity}개</span>
                      <span className="order-item-price">{(item.price * item.quantity).toLocaleString()}원</span>
                    </div>
                  ))}
                </div>
                <div className="order-footer">
                  <span className="order-total">총 {order.totalPrice.toLocaleString()}원</span>
                  <Link to={`/orders/${order._id}`} className="btn btn-outline order-detail-btn">상세 보기</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
