import { useLanguage } from '../../context/LanguageContext'
import { IMG, FEATURED_LIST } from '../../data/landingContent'

export default function LandingFeatured() {
  const { lang, t } = useLanguage()

  return (
    <section className="landing-featured">
      <div className="landing-featured-visual">
        <img src={IMG.featured} alt="" className="landing-featured-img" loading="lazy" />
      </div>
      <div className="landing-featured-panel">
        <h2 className="landing-featured-title">{t('featured_title')}</h2>
        <p className="landing-featured-sub">{t('featured_sub')}</p>
        <ul className="landing-featured-list">
          {FEATURED_LIST.map((item) => (
            <li key={item.id} className="landing-featured-item">
              <img src={item.thumb} alt="" className="landing-featured-thumb" loading="lazy" />
              <div className="landing-featured-meta">
                <span className="landing-featured-name">{lang === 'ko' ? item.nameKo : item.nameEn}</span>
                <span className="landing-featured-price">{lang === 'ko' ? item.priceKo : item.priceEn}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
