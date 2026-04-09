import { useEffect, useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { getProductsAPI } from '../../api/products'
import LandingProductCard from './LandingProductCard'

/** 메인 상단 — 마스크팩: SKU m-1, m-2, m-3 만 이 순서로 표시 */
const MASK_SKUS_ORDER = ['m-1', 'm-2', 'm-3']

function pickMaskPackProducts(products) {
  const map = new Map(
    (products || []).map((p) => [String(p.sku || '').trim().toLowerCase(), p])
  )
  return MASK_SKUS_ORDER.map((sku) => map.get(sku)).filter(Boolean)
}

/** 이미지 클릭 시 상세로 이동 */
export default function LandingMaskPackGrid() {
  const { lang, t } = useLanguage()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await getProductsAPI({
          skuPrefix: 'm-',
          limit: 24,
          page: 1,
          sort: 'newest',
        })
        if (!cancelled) setProducts(pickMaskPackProducts(data.products || []))
      } catch {
        if (!cancelled) setProducts([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const mapped = products.map((p) => ({
    id: p._id,
    detailId: p._id,
    img: p.images?.[0] || 'https://placehold.co/600?text=No+Image',
    nameKo: p.name,
    nameEn: p.name,
    priceKo: `${Number(p.price ?? 0).toLocaleString()}원`,
    priceEn: `₩${Number(p.price ?? 0).toLocaleString()}`,
  }))

  return (
    <section className="landing-section landing-products">
      <div className="landing-section-inner">
        <h2 className="landing-section-title">{t('section_new')}</h2>
        {loading ? (
          <p className="landing-maskpack-loading">불러오는 중…</p>
        ) : mapped.length === 0 ? (
          <p className="landing-maskpack-empty">
            등록된 마스크팩 상품이 없습니다. (SKU m-1, m-2, m-3 상품을 등록해 주세요)
          </p>
        ) : (
          <div className="landing-product-grid">
            {mapped.map((p) => (
              <LandingProductCard key={p.id} product={p} lang={lang} detailId={p.detailId} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
