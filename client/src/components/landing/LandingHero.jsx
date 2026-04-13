import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { t } from '../../i18n/t'
import { IMG } from '../../data/landingContent'
import { getProductsAPI } from '../../api/products'
import { getProductName, getProductDescription } from '../../utils/productLocale'

/** 히어로 비주얼 — SKU cr-1 상품 (미등록 시 기본 이미지·문구) */
const HERO_SKU = 'cr-1'

function findProductBySku(products, sku) {
  const want = String(sku).trim().toLowerCase()
  return (products || []).find((p) => String(p.sku || '').trim().toLowerCase() === want)
}

/** 설명 한 덩어리로 정리 후 길이 제한 */
function truncateText(s, max) {
  const one = String(s || '')
    .replace(/\s+/g, ' ')
    .trim()
  if (!one) return ''
  if (one.length <= max) return one
  return `${one.slice(0, max).trim()}…`
}

export default function LandingHero() {
  const [heroProduct, setHeroProduct] = useState(null)
  const [heroReady, setHeroReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await getProductsAPI({
          skuPrefix: 'cr-',
          limit: 100,
          page: 1,
          sort: 'newest',
        })
        const p = findProductBySku(data.products || [], HERO_SKU)
        if (!cancelled) setHeroProduct(p ?? null)
      } catch {
        if (!cancelled) setHeroProduct(null)
      } finally {
        if (!cancelled) setHeroReady(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const imgSrc = heroProduct?.images?.[0] || IMG.hero
  const detailId = heroProduct?._id

  const kicker = heroProduct
    ? heroProduct.category === '크림'
      ? t('hero_kicker')
      : heroProduct.category || '추천'
    : t('hero_kicker')

  const title = heroProduct ? getProductName(heroProduct)?.trim() || HERO_SKU : t('hero_title')

  const desc = heroProduct
    ? (() => {
        const snippet = truncateText(getProductDescription(heroProduct), 160)
        if (snippet) return snippet
        const price = Number(heroProduct.price ?? 0)
        const priceStr = `${price.toLocaleString('ko-KR')}원`
        if (heroProduct.category === '크림') return priceStr
        const cat = heroProduct.category || ''
        return cat ? `${priceStr} · ${cat}` : priceStr
      })()
    : t('hero_desc')

  const visual = heroReady ? (
    <img
      src={imgSrc}
      alt={heroProduct ? getProductName(heroProduct) : ''}
      className="landing-hero-img"
      loading="eager"
    />
  ) : (
    <div className="landing-hero-img-placeholder" aria-hidden />
  )

  return (
    <section className="landing-hero">
      <div className="landing-hero-text">
        <p className="landing-hero-kicker">{kicker}</p>
        <h1 className="landing-hero-title">{title}</h1>
        <p className="landing-hero-desc">{desc}</p>
      </div>
      <div className="landing-hero-visual">
        {detailId ? (
          <Link
            to={`/products/${detailId}`}
            className="landing-hero-img-link"
            aria-label={heroProduct ? getProductName(heroProduct) || HERO_SKU : HERO_SKU}
          >
            {visual}
          </Link>
        ) : (
          visual
        )}
      </div>
    </section>
  )
}
