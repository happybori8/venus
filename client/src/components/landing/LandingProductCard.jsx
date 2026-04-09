import { Link } from 'react-router-dom'

export default function LandingProductCard({ product, lang, detailId }) {
  const toId = detailId ?? product.detailId
  const img = (
    <img src={product.img} alt="" className="landing-product-img" loading="lazy" />
  )
  return (
    <article className="landing-product-card">
      <div className="landing-product-img-wrap">
        {toId ? (
          <Link
            to={`/products/${toId}`}
            className="landing-product-img-link"
            aria-label={lang === 'ko' ? product.nameKo : product.nameEn}
          >
            {img}
          </Link>
        ) : (
          img
        )}
      </div>
      <h3 className="landing-product-name">{lang === 'ko' ? product.nameKo : product.nameEn}</h3>
      <p className="landing-product-price">{lang === 'ko' ? product.priceKo : product.priceEn}</p>
    </article>
  )
}
