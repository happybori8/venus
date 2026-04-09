export default function LandingProductCard({ product, lang }) {
  return (
    <article className="landing-product-card">
      <div className="landing-product-img-wrap">
        <img src={product.img} alt="" className="landing-product-img" loading="lazy" />
      </div>
      <h3 className="landing-product-name">{lang === 'ko' ? product.nameKo : product.nameEn}</h3>
      <p className="landing-product-price">{lang === 'ko' ? product.priceKo : product.priceEn}</p>
    </article>
  )
}
