import { Link } from 'react-router-dom'
import { getProductName } from '../../utils/productLocale'

export default function LandingProductCard({ product, detailId }) {
  const toId = detailId ?? product.detailId ?? product._id
  const displayName = getProductName(product)
  const imgSrc = product.img || product.images?.[0] || 'https://placehold.co/600?text=No+Image'
  const img = <img src={imgSrc} alt="" className="landing-product-img" loading="lazy" />
  const priceLine = product.priceKo ?? product.priceDisplay
  return (
    <article className="landing-product-card">
      <div className="landing-product-img-wrap">
        {toId ? (
          <Link
            to={`/products/${toId}`}
            className="landing-product-img-link"
            aria-label={displayName}
          >
            {img}
          </Link>
        ) : (
          img
        )}
      </div>
      <h3 className="landing-product-name">{displayName}</h3>
      <p className="landing-product-price">{priceLine}</p>
    </article>
  )
}
