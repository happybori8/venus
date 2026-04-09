import { Link } from 'react-router-dom';
import { FiStar, FiShoppingCart } from 'react-icons/fi';
import useCartStore from '../../store/cartStore';
import toast from 'react-hot-toast';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = (e) => {
    e.preventDefault();
    addItem(product, 1);
    toast.success('장바구니에 담았습니다');
  };

  const discountRate =
    product.discountPrice > 0
      ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
      : 0;

  const displayPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const isOutOfStock = product.stock != null && product.stock <= 0;

  return (
    <Link to={`/products/${product._id}`} className="product-card">
      <div className="product-img-wrap">
        <img
          src={product.images?.[0] || 'https://placehold.co/300x300?text=No+Image'}
          alt={product.name}
        />
        {discountRate > 0 && <span className="discount-badge">-{discountRate}%</span>}
        {isOutOfStock && <div className="out-of-stock-overlay">품절</div>}
      </div>
      <div className="product-info">
        <span className="product-category">{product.category}</span>
        <h3 className="product-name">{product.name}</h3>
        <div className="product-rating">
          <FiStar className="star-icon" />
          <span>{product.rating?.toFixed(1) || '0.0'}</span>
          <span className="review-count">({product.numReviews || 0})</span>
        </div>
        <div className="product-price-row">
          <div className="product-price">
            {product.discountPrice > 0 && (
              <span className="original-price">{product.price.toLocaleString()}원</span>
            )}
            <span className="final-price">{displayPrice.toLocaleString()}원</span>
          </div>
          <button className="add-cart-btn" onClick={handleAddToCart} disabled={isOutOfStock}>
            <FiShoppingCart />
          </button>
        </div>
      </div>
    </Link>
  );
}
