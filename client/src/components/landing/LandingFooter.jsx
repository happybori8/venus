import { useLanguage } from '../../context/LanguageContext'

export default function LandingFooter() {
  const { t } = useLanguage()

  return (
    <footer className="landing-footer">
      <div className="landing-footer-inner">
        <div className="landing-footer-company">
          <p className="landing-footer-brand">{t('footer_brand')}</p>
          <p className="landing-footer-lines">
            {t('footer_company')
              .split('\n')
              .map((line, i) => (
                <span key={i} className="landing-footer-line">
                  {line}
                  <br />
                </span>
              ))}
          </p>
        </div>
        <div className="landing-footer-links">
          <div className="landing-footer-col">
            <span className="landing-footer-heading">{t('footer_about_heading')}</span>
            <a href="#/">{t('footer_about_1')}</a>
            <a href="#/">{t('footer_about_2')}</a>
            <a href="#/">{t('footer_about_3')}</a>
          </div>
          <div className="landing-footer-col">
            <span className="landing-footer-heading">{t('footer_policy_heading')}</span>
            <a href="#/">{t('footer_policy_1')}</a>
            <a href="#/">{t('footer_policy_2')}</a>
          </div>
          <div className="landing-footer-social">
            <span className="landing-footer-heading">{t('footer_follow_heading')}</span>
            <div className="landing-footer-icons">
              <span className="landing-footer-icon" aria-label="Instagram">
                IG
              </span>
              <span className="landing-footer-icon" aria-label="YouTube">
                YT
              </span>
            </div>
          </div>
        </div>
      </div>
      <p className="landing-footer-copy">{t('footer_copy')}</p>
    </footer>
  )
}
