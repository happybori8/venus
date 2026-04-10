import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { adminGetProducts, adminCreateProduct, adminUpdateProduct, adminDeleteProduct } from '../../api/adminApi'
import CloudinaryUploadButton from '../../components/admin/CloudinaryUploadButton'
import './Admin.css'
import { PRODUCT_CATEGORIES } from '../../constants/productCategories'

function AdminImagePreviewThumb({ url }) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <div className="admin-image-preview-fail" title={url}>
        <span>미리보기 실패</span>
        <small>URL을 확인하세요</small>
      </div>
    )
  }
  return (
    <div className="admin-image-preview-thumb">
      <img src={url} alt="" loading="lazy" onError={() => setFailed(true)} />
    </div>
  )
}

const emptyForm = {
  sku: '',
  category: PRODUCT_CATEGORIES[0],
  name: '',
  price: '',
  stock: null,
  description: '',
  images: '',
}

function parseStockField(v) {
  if (v === '' || v == null) return null
  const n = Number(v)
  if (!Number.isFinite(n) || n < 0) return null
  return Math.floor(n)
}

const parseImages = (s) =>
  s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)

/** 설명 목록용 — 공백 제거 후 최대 max자, 초과 시 말줄임 */
function truncateDescription(text, max = 20) {
  if (text == null || String(text).trim() === '') return '—'
  const t = String(text).trim()
  if (t.length <= max) return t
  return `${t.slice(0, max)}…`
}

function apiErrorMessage(err) {
  if (!err?.response) {
    return '서버에 연결할 수 없습니다. 백엔드(node server.js, 포트 5000)가 실행 중인지, VITE_API_URL=/api 인지 확인하세요.'
  }
  const m = err.response?.data?.message
  if (Array.isArray(m)) return m.join(', ')
  return m || '요청 실패'
}

const LIST_PAGE_SIZE = 3

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [listPage, setListPage] = useState(1)
  const [listTotal, setListTotal] = useState(0)
  const [listTotalPages, setListTotalPages] = useState(1)
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await adminGetProducts({ page: listPage, limit: LIST_PAGE_SIZE })
      const totalCount = data.total ?? 0
      const serverPages =
        typeof data.pages === 'number' && data.pages > 0
          ? data.pages
          : Math.max(1, totalCount === 0 ? 1 : Math.ceil(totalCount / LIST_PAGE_SIZE))

      if (listPage > serverPages) {
        setListPage(serverPages)
        return
      }

      setProducts(data.products || [])
      setListTotal(totalCount)
      setListTotalPages(serverPages)
    } catch (e) {
      setMsg({ type: 'error', text: apiErrorMessage(e) })
    } finally {
      setLoading(false)
    }
  }, [listPage])

  useEffect(() => {
    load()
  }, [load])

  const appendImageUrl = useCallback((url) => {
    setForm((f) => {
      const existing = parseImages(f.images)
      if (existing.includes(url)) return f
      return { ...f, images: [...existing, url].join(', ') }
    })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMsg({ type: '', text: '' })
    const payload = {
      sku: form.sku.trim(),
      category: form.category,
      name: form.name.trim(),
      price: Number(form.price),
      stock: parseStockField(form.stock),
      description: form.description.trim(),
      images: parseImages(form.images),
    }
    try {
      if (editingId) {
        await adminUpdateProduct(editingId, payload)
        setMsg({ type: 'success', text: '상품이 수정되었습니다' })
      } else {
        await adminCreateProduct(payload)
        setMsg({ type: 'success', text: '상품이 등록되었습니다' })
      }
      setForm(emptyForm)
      setEditingId(null)
      load()
    } catch (err) {
      setMsg({ type: 'error', text: apiErrorMessage(err) })
    }
  }

  const handleListPageChange = (p) => {
    setListPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const startEdit = (p) => {
    setEditingId(p._id)
    const cat = PRODUCT_CATEGORIES.includes(p.category) ? p.category : PRODUCT_CATEGORIES[0]
    setForm({
      sku: p.sku ?? '',
      category: cat,
      name: p.name,
      price: String(p.price),
      stock: p.stock != null ? String(p.stock) : null,
      description: p.description || '',
      images: (p.images || []).join(', '),
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(emptyForm)
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`「${name}」 상품을 삭제할까요?`)) return
    try {
      await adminDeleteProduct(id)
      setMsg({ type: 'success', text: '삭제되었습니다' })
      if (editingId === id) cancelEdit()
      load()
    } catch (e) {
      setMsg({ type: 'error', text: apiErrorMessage(e) })
    }
  }

  return (
    <>
      <h1 className="admin-page-title">상품 관리</h1>
      {msg.text && (
        <div className={`admin-msg ${msg.type === 'error' ? 'admin-msg-error' : 'admin-msg-success'}`}>{msg.text}</div>
      )}

      <div className="admin-card">
        <h2 style={{ fontSize: '1rem', marginBottom: '1rem' }}>{editingId ? '상품 수정' : '상품 등록'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="admin-form-grid">
            <label>
              SKU
              <input
                required
                value={form.sku}
                onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                placeholder="예: MSK-001"
                autoComplete="off"
                spellCheck={false}
              />
            </label>
            <label>
              카테고리
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                {PRODUCT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label>
              상품명
              <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </label>
            <label>
              가격
              <input required type="number" min="0" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
            </label>
            <label>
              재고
              <input
                type="number"
                min="0"
                value={form.stock == null ? '' : form.stock}
                onChange={(e) => {
                  const v = e.target.value
                  setForm((f) => ({ ...f, stock: v === '' ? null : v }))
                }}
              />
            </label>
          </div>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.75rem', fontSize: '0.8125rem' }}>
            상품 이미지 (URL 직접 입력 또는 Cloudinary 업로드)
            <span className="admin-muted" style={{ fontWeight: 400, display: 'block', marginTop: '0.15rem' }}>
              <strong style={{ fontWeight: 600, color: '#374151' }}>이미지 주소</strong>를 직접 넣거나, 아래에서 Cloudinary에 올리면 업로드된 주소가 자동으로 붙습니다. 여러 장은 쉼표(,)로 구분합니다.
            </span>
            <input
              style={{ width: '100%', marginTop: '0.35rem' }}
              value={form.images}
              onChange={(e) => setForm((f) => ({ ...f, images: e.target.value }))}
              placeholder="예: https://example.com/product.jpg"
            />
            <div className="admin-cloudinary-option">
              <CloudinaryUploadButton onUploaded={appendImageUrl} />
            </div>
            {parseImages(form.images).length > 0 && (
              <div className="admin-image-preview-grid" aria-label="이미지 미리보기">
                {parseImages(form.images).map((url) => (
                  <AdminImagePreviewThumb key={url} url={url} />
                ))}
              </div>
            )}
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.75rem', fontSize: '0.8125rem' }}>
            설명 (선택)
            <textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="비워두어도 됩니다" />
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="admin-btn admin-btn-primary">
              {editingId ? '수정 저장' : '상품등록'}
            </button>
            {editingId && (
              <button type="button" className="admin-btn admin-btn-ghost" onClick={cancelEdit}>
                취소
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="admin-card admin-table-wrap">
        <h2 style={{ fontSize: '1rem', marginBottom: '1rem' }}>상품 목록</h2>
        {!loading && (
          <p className="admin-muted" style={{ marginBottom: '0.75rem' }}>
            전체 {listTotal}개 · 페이지당 {LIST_PAGE_SIZE}개
          </p>
        )}
        {loading ? (
          <p className="admin-muted">불러오는 중…</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>이미지</th>
                <th>카테고리</th>
                <th>상품명</th>
                <th>설명</th>
                <th>가격</th>
                <th>재고</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>
                    <Link to={`/products/${p._id}`} className="admin-table-detail-link">
                      {p.sku ?? '—'}
                    </Link>
                  </td>
                  <td className="admin-table-td-thumb">
                    <Link
                      to={`/products/${p._id}`}
                      className="admin-table-thumb-link"
                      aria-label={`${p.name} 상세 페이지`}
                    >
                      {p.images?.[0] ? (
                        <img
                          src={p.images[0]}
                          alt=""
                          className="admin-table-list-thumb"
                          loading="lazy"
                        />
                      ) : (
                        <span className="admin-muted">—</span>
                      )}
                    </Link>
                  </td>
                  <td>{p.category}</td>
                  <td>
                    <Link to={`/products/${p._id}`} className="admin-table-detail-link admin-table-name-link">
                      {p.name}
                    </Link>
                  </td>
                  <td className="admin-table-td-desc" title={p.description || ''}>
                    {truncateDescription(p.description, 20)}
                  </td>
                  <td>{p.price?.toLocaleString()}원</td>
                  <td>{p.stock != null ? p.stock : '—'}</td>
                  <td>
                    <button type="button" className="admin-btn admin-btn-ghost" style={{ marginRight: '0.35rem' }} onClick={() => startEdit(p)}>
                      수정
                    </button>
                    <button type="button" className="admin-btn admin-btn-danger" onClick={() => handleDelete(p._id, p.name)}>
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && listTotalPages > 1 && (
          <div className="admin-pagination" role="navigation" aria-label="상품 목록 페이지">
            {Array.from({ length: listTotalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                className={`admin-page-btn ${p === listPage ? 'active' : ''}`}
                onClick={() => handleListPageChange(p)}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
