import { useNavigate } from 'react-router-dom'
import { FiShoppingCart } from 'react-icons/fi'
import { useLanguage } from '../../context/LanguageContext'

export default function LandingNavbar({ user, isLoggedIn, isAdmin, onLogout }) {
  const navigate = useNavigate()
  const { lang, setLang, t } = useLanguage()

  return (
    <header className="landing-header">
      <div className="landing-header-inner">
        <nav className="landing-nav-left" aria-label={t('nav_primary_aria')}>
          <button type="button" className="landing-nav-link">
            {t('nav_shop')}
          </button>
          <button type="button" className="landing-nav-link">
            {t('nav_brand')}
          </button>
          <button type="button" className="landing-nav-link">
            {t('nav_event')}
          </button>
          <button type="button" className="landing-nav-link">
            {t('nav_support')}
          </button>
        </nav>

        <button
          type="button"
          className="landing-logo"
          onClick={() => navigate('/')}
          aria-label={t('logo_aria')}
        >
          Venus
        </button>

        <div className="landing-nav-right">
          <div className="landing-lang" role="group" aria-label={t('lang_aria')}>
            <button
              type="button"
              className={`landing-lang-btn ${lang === 'ko' ? 'is-active' : ''}`}
              onClick={() => setLang('ko')}
            >
              KO
            </button>
            <span className="landing-auth-sep" aria-hidden>
              |
            </span>
            <button
              type="button"
              className={`landing-lang-btn ${lang === 'en' ? 'is-active' : ''}`}
              onClick={() => setLang('en')}
            >
              EN
            </button>
          </div>

          <button
            type="button"
            className="landing-cart-btn"
            onClick={() => navigate('/cart')}
            aria-label={t('cart')}
          >
            <FiShoppingCart className="landing-cart-icon" aria-hidden />
            <span className="landing-cart-label">{t('cart')}</span>
          </button>

          {isLoggedIn && user?.name && (
            <span className="landing-greeting">{t('greeting', { name: user.name })}</span>
          )}

          {isLoggedIn ? (
            <>
              <button type="button" className="landing-auth-btn landing-auth-logout" onClick={onLogout}>
                {t('logout')}
              </button>
              <span className="landing-auth-sep" aria-hidden>
                |
              </span>
              <button
                type="button"
                className={`landing-auth-btn ${isAdmin ? 'landing-auth-admin' : ''}`}
                onClick={() => navigate(isAdmin ? '/admin' : '/mypage')}
              >
                {isAdmin ? t('admin') : t('mypage')}
              </button>
            </>
          ) : (
            <>
              <button type="button" className="landing-auth-btn" onClick={() => navigate('/login')}>
                {t('login')}
              </button>
              <span className="landing-auth-sep" aria-hidden>
                |
              </span>
              <button type="button" className="landing-auth-btn" onClick={() => navigate('/register')}>
                {t('register')}
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
