import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { getStoredUser } from '../utils/authStorage'
import { IMG, PRODUCTS_A, PRODUCTS_B } from '../data/landingContent'
import LandingNavbar from '../components/landing/LandingNavbar'
import LandingHero from '../components/landing/LandingHero'
import LandingProductGrid from '../components/landing/LandingProductGrid'
import LandingFullBanner from '../components/landing/LandingFullBanner'
import LandingFeatured from '../components/landing/LandingFeatured'
import LandingFooter from '../components/landing/LandingFooter'
import './HomePage.css'

export default function HomePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const logoutStore = useAuthStore((s) => s.logout)
  const [user, setUser] = useState(getStoredUser)

  useEffect(() => {
    setUser(getStoredUser())
  }, [location.pathname])

  const handleLogout = () => {
    logoutStore()
    setUser(null)
    navigate('/')
  }

  const isLoggedIn = Boolean(localStorage.getItem('token') && user)
  const isAdmin =
    !!user &&
    (user.role === 'admin' || String(user.email || '').toLowerCase() === 'admin@gmail.com')

  return (
    <div className="landing">
      <LandingNavbar user={user} isLoggedIn={isLoggedIn} isAdmin={isAdmin} onLogout={handleLogout} />

      <main>
        <LandingHero />
        <LandingProductGrid sectionTitleKey="section_new" products={PRODUCTS_A} />
        <LandingFullBanner src={IMG.banner1} />
        <LandingProductGrid sectionTitleKey="section_best" products={PRODUCTS_B} />
        <LandingFeatured />
        <LandingFullBanner src={IMG.banner2} tall />
      </main>

      <LandingFooter />
    </div>
  )
}
