import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductAPI, createReviewAPI } from '../api/products';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import { FiStar, FiShoppingCart, FiMinus, FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './ProductDetailPage.css';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedImg, setSelectedImg] = useState(0);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getProductAPI(id);
        setProduct(data.product);
      } catch {
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleAddToCart = () => { addItem(product, qty); toast.success(`${qty}개를 장바구니에 담았습니다`); };
  const handleBuyNow = () => { addItem(product, qty); navigate('/cart'); };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('로그인이 필요합니다'); navigate('/login'); return; }
    setReviewLoading(true);
    try {
      await createReviewAPI(id, { rating: reviewRating, comment: reviewComment });
      toast.success('리뷰가 등록되었습니다');
      setReviewComment('');
      const { data } = await getProductAPI(id);
      setProduct(data.product);
    } catch (err) {
      toast.error(err.response?.data?.message || '리뷰 등록에 실패했습니다');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
  if (!product) return null;

  const displayPrice = product.discountPrice > 0 ? product.discountPrice : product.price;

  return (
    <div className="product-detail-page">
      <div className="container">
        <div className="detail-grid">
          <div className="detail-images">
            <div className="main-image">
              <img src={product.images?.[selectedImg] || 'https://placehold.co/500x500?text=No+Image'} alt={product.name} />
            </div>
            {product.images?.length > 1 && (
              <div className="image-thumbnails">
                {product.images.map((img, i) => (
                  <img key={i} src={img} alt={`${product.name} ${i + 1}`}
                    className={i === selectedImg ? 'active' : ''} onClick={() => setSelectedImg(i)} />
                ))}
              </div>
            )}
          </div>
          <div className="detail-info">
            <span className="detail-category">{product.category}</span>
            {product.sku ? <span className="detail-sku">SKU {product.sku}</span> : null}
            <h1 className="detail-name">{product.name}</h1>
            <div className="detail-rating">
              <FiStar className="star-icon" />
              <span>{product.rating?.toFixed(1)}</span>
              <span>({product.numReviews}개 리뷰)</span>
            </div>
            <div className="detail-price">
              {product.discountPrice > 0 && (
                <span className="original-price">{product.price.toLocaleString()}원</span>
              )}
              <span className="final-price">{displayPrice.toLocaleString()}원</span>
            </div>
            {product.description ? <p className="detail-description">{product.description}</p> : null}
            <div className="stock-info">
              {product.stock > 0 ? (
                <span className="in-stock">재고: {product.stock}개</span>
              ) : (
                <span className="out-stock">품절</span>
              )}
            </div>
            {product.stock > 0 && (
              <>
                <div className="qty-selector">
                  <button onClick={() => setQty(Math.max(1, qty - 1))}><FiMinus /></button>
                  <span>{qty}</span>
                  <button onClick={() => setQty(Math.min(product.stock, qty + 1))}><FiPlus /></button>
                </div>
                <div className="detail-actions">
                  <button className="btn btn-outline" onClick={handleAddToCart}><FiShoppingCart /> 장바구니</button>
                  <button className="btn btn-primary" onClick={handleBuyNow}>바로 구매</button>
                </div>
              </>
            )}
            <div className="shipping-info">
              <p>✅ {displayPrice * qty >= 50000 ? '무료 배송' : '배송비 3,000원'}</p>
              <p>📦 주문 후 1~3일 내 배송</p>
            </div>
          </div>
        </div>

        <div className="reviews-section">
          <h2>상품 리뷰 ({product.numReviews})</h2>
          <form className="review-form" onSubmit={handleReviewSubmit}>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((s) => (
                <FiStar key={s} className={s <= reviewRating ? 'star active' : 'star'} onClick={() => setReviewRating(s)} />
              ))}
            </div>
            <textarea placeholder="상품에 대한 리뷰를 작성해주세요..." value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)} required rows={3} />
            <button type="submit" className="btn btn-primary" disabled={reviewLoading}>
              {reviewLoading ? '등록 중...' : '리뷰 작성'}
            </button>
          </form>
          <div className="reviews-list">
            {product.reviews?.length === 0 ? (
              <p className="no-reviews">아직 리뷰가 없습니다. 첫 번째 리뷰를 작성해보세요!</p>
            ) : (
              product.reviews?.map((review, i) => (
                <div key={i} className="review-item">
                  <div className="review-header">
                    <strong>{review.name}</strong>
                    <div className="review-stars">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <FiStar key={s} className={s <= review.rating ? 'star active' : 'star'} />
                      ))}
                    </div>
                    <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p>{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
