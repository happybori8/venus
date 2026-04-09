import { useLanguage } from '../../context/LanguageContext'
import { IMG } from '../../data/landingContent'

export default function LandingHero() {
  const { t } = useLanguage()

  return (
    <section className="landing-hero">
      <div className="landing-hero-text">
        <p className="landing-hero-kicker">{t('hero_kicker')}</p>
        <h1 className="landing-hero-title">{t('hero_title')}</h1>
        <p className="landing-hero-desc">{t('hero_desc')}</p>
      </div>
      <div className="landing-hero-visual">
        <img src={IMG.hero} alt="" className="landing-hero-img" />
      </div>
    </section>
  )
}
