import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProductsAPI } from '../api/products';
import ProductCard from '../components/common/ProductCard';
import { FiSearch } from 'react-icons/fi';
import './ProductsPage.css';

const CATEGORIES = ['전체', '마스크팩', '클렌저'];
const SORT_OPTIONS = [
  { value: 'newest', label: '최신순' },
  { value: 'price-asc', label: '낮은 가격순' },
  { value: 'price-desc', label: '높은 가격순' },
  { value: 'rating', label: '평점순' },
];

export default function ProductsPage() {
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
    <div className="products-page">
      <div className="container">
        <h1 className="page-title">전체 상품</h1>
        <div className="products-layout">
          <aside className="products-sidebar">
            <div className="filter-section">
              <h3>카테고리</h3>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`filter-btn ${(cat === '전체' ? !category : category === cat) ? 'active' : ''}`}
                  onClick={() => updateParam('category', cat === '전체' ? '' : cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </aside>
          <div className="products-main">
            <div className="products-toolbar">
              <form className="search-form" onSubmit={handleSearch}>
                <input
                  type="text" placeholder="상품 검색..."
                  value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                />
                <button type="submit"><FiSearch /></button>
              </form>
              <select className="sort-select" value={sort} onChange={(e) => updateParam('sort', e.target.value)}>
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <p className="result-count">총 {total}개의 상품</p>
            {loading ? (
              <div className="loading-spinner"><div className="spinner" /></div>
            ) : products.length === 0 ? (
              <div className="empty-state"><p>검색 결과가 없습니다.</p></div>
            ) : (
              <>
                <div className="grid-3">
                  {products.map((p) => <ProductCard key={p._id} product={p} />)}
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
