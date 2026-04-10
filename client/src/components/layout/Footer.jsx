import { Link } from 'react-router-dom';
import { PRODUCT_CATEGORIES } from '../../constants/productCategories';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <span className="footer-logo">🛍️ Venus</span>
          <p>고객님께 최고의 쇼핑 경험을 제공합니다.</p>
        </div>
        <div className="footer-links">
          <h4>쇼핑</h4>
          <Link to="/products">전체 상품</Link>
          {PRODUCT_CATEGORIES.map((c) => (
            <Link key={c} to={`/products?category=${encodeURIComponent(c)}`}>
              {c}
            </Link>
          ))}
        </div>
        <div className="footer-links">
          <h4>고객 서비스</h4>
          <Link to="/orders">주문 내역</Link>
          <Link to="/profile">내 정보</Link>
          <Link to="/cart">카트</Link>
        </div>
        <div className="footer-links">
          <h4>계정</h4>
          <Link to="/login">로그인</Link>
          <Link to="/register">회원가입</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2024 Venus. All rights reserved.</p>
      </div>
    </footer>
  );
}
