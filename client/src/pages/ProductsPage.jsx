import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { getProductsAPI } from '../api/products';
import { t } from '../i18n/t';
import useAuthStore from '../store/authStore';
import { getStoredUser } from '../utils/authStorage';
import LandingNavbar from '../components/landing/LandingNavbar';
import LandingProductCard from '../components/landing/LandingProductCard';
import { FiSearch } from 'react-icons/fi';
import './HomePage.css';
import './ProductsPage.css';
import { PRODUCT_CATEGORIES, getCategoryLabel } from '../constants/productCategories';

const PLACEHOLDER_IMG = 'https://placehold.co/600?text=No+Image';

function formatListingProduct(p) {
  const price = p.discountPrice > 0 ? p.discountPrice : p.price;
  const n = Number(price ?? 0);
  return {
    ...p,
    id: p._id,
    detailId: p._id,
    img: p.images?.[0] || PLACEHOLDER_IMG,
    priceKo: `${n.toLocaleString('ko-KR')}원`,
  };
}

export default function ProductsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const logoutStore = useAuthStore((s) => s.logout);

  const sortOptions = useMemo(
    () => [
      { value: 'newest', label: t('products_sort_newest') },
      { value: 'price-asc', label: t('products_sort_price_asc') },
      { value: 'price-desc', label: t('products_sort_price_desc') },
      { value: 'rating', label: t('products_sort_rating') },
    ],
    []
  );
  const [user, setUser] = useState(getStoredUser);
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = Number(searchParams.get('page')) || 1;
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    setUser(getStoredUser());
  }, [location.pathname]);

  const handleLogout = () => {
    logoutStore();
    setUser(null);
    navigate('/');
  };

  const isLoggedIn = Boolean(localStorage.getItem('token') && user);
  const isAdmin =
    !!user &&
    (user.role === 'admin' || String(user.email || '').toLowerCase() === 'admin@gmail.com');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 12, sort };
        if (category) params.category = category;
        if (search) params.search = search;
        const { data } = await getProductsAPI(params);
        setProducts(data.products);
        setTotal(data.total);
        setPages(data.pages);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category, search, sort, page]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateParam('search', searchInput.trim());
  };

  const handlePageChange = (p) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', p);
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="landing products-page">
      <LandingNavbar user={user} isLoggedIn={isLoggedIn} isAdmin={isAdmin} onLogout={handleLogout} />
      <div className="container">
        <h1 className="products-page-heading">{t('products_page_title')}</h1>
        <div className="products-layout">
          <aside className="products-sidebar">
            <div className="products-filter">
              <div className="products-filter-head">
                <h2 className="products-filter-title">{t('products_category_title')}</h2>
                {category ? (
                  <button
                    type="button"
                    className="products-filter-reset"
                    onClick={() => updateParam('category', '')}
                  >
                    {t('products_filter_reset')}
                  </button>
                ) : null}
              </div>
              <div
                className="products-filter-chips"
                role="group"
                aria-label={t('products_filter_group_aria')}
              >
                {PRODUCT_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`filter-chip ${category === cat ? 'is-active' : ''}`}
                    onClick={() =>
                      updateParam('category', category === cat ? '' : cat)
                    }
                  >
                    {getCategoryLabel(cat)}
                  </button>
                ))}
              </div>
            </div>
          </aside>
          <div className="products-main">
            <div className="products-toolbar">
              <form className="search-form" onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder={t('products_search_placeholder')}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                <button type="submit"><FiSearch /></button>
              </form>
              <select className="sort-select" value={sort} onChange={(e) => updateParam('sort', e.target.value)}>
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <p className="result-count">{t('products_result_total', { total })}</p>
            {loading ? (
              <div className="loading-spinner"><div className="spinner" /></div>
            ) : products.length === 0 ? (
              <div className="empty-state"><p>{t('products_empty')}</p></div>
            ) : (
              <>
                <div className="landing-product-grid products-page-product-grid">
                  {products.map((p) => {
                    const card = formatListingProduct(p);
                    return (
                      <LandingProductCard
                        key={p._id}
                        product={card}
                        detailId={card.detailId}
                      />
                    );
                  })}
                </div>
                {pages > 1 && (
                  <div className="pagination">
                    {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        className={`page-btn ${p === page ? 'active' : ''}`}
                        onClick={() => handlePageChange(p)}
                      >{p}</button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

