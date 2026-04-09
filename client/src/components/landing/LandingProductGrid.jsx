import { useLanguage } from '../../context/LanguageContext'
import LandingProductCard from './LandingProductCard'

export default function LandingProductGrid({ sectionTitleKey, products }) {
  const { lang, t } = useLanguage()

  return (
    <section className="landing-section landing-products">
      <div className="landing-section-inner">
        <h2 className="landing-section-title">{t(sectionTitleKey)}</h2>
        <div className="landing-product-grid">
          {products.map((p) => (
            <LandingProductCard key={p.id} product={p} lang={lang} />
          ))}
        </div>
      </div>
    </section>
  )
}
