import { useNavigate, useLocation } from 'react-router-dom'
import { FiShoppingCart } from 'react-icons/fi'
import { t } from '../../i18n/t'
import useCartStore from '../../store/cartStore'

export default function LandingNavbar({ user, isLoggedIn, isAdmin, onLogout }) {
  const navigate = useNavigate()
  const location = useLocation()
  const cartKindCount = useCartStore((s) => s.items.length)

  const path = location.pathname
  const navShopActive = path === '/products' || path.startsWith('/products/')
  const navBrandActive = path === '/brand'
  const navSupportActive = path === '/support'

  return (
    <header className="landing-header">
      <div className="landing-header-inner">
        <nav className="landing-nav-left" aria-label={t('nav_primary_aria')}>
          <button
            type="button"
            className={`landing-nav-link${navShopActive ? ' is-active' : ''}`}
            onClick={() => navigate('/products')}
          >
            {t('nav_shop')}
          </button>
          <button
            type="button"
            className={`landing-nav-link${navBrandActive ? ' is-active' : ''}`}
            onClick={() => navigate('/brand')}
          >
            {t('nav_brand')}
          </button>
          <button
            type="button"
            className={`landing-nav-link${navSupportActive ? ' is-active' : ''}`}
            onClick={() => navigate('/support')}
          >
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
          <button
            type="button"
            className="landing-cart-btn"
            onClick={() => navigate('/cart')}
            aria-label={
              cartKindCount > 0
                ? t('cart_aria_with_count', { count: cartKindCount })
                : t('cart')
            }
          >
            <span className="landing-cart-btn-inner">
              <FiShoppingCart className="landing-cart-icon" aria-hidden />
              <span className="landing-cart-label">{t('cart')}</span>
              {cartKindCount > 0 ? (
                <span className="landing-cart-badge" aria-hidden>
                  {cartKindCount > 99 ? '99+' : cartKindCount}
                </span>
              ) : null}
            </span>
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
