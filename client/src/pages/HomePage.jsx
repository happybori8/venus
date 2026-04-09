import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { getStoredUser } from '../utils/authStorage'
import { IMG } from '../data/landingContent'
import LandingNavbar from '../components/landing/LandingNavbar'
import LandingHero from '../components/landing/LandingHero'
import LandingMaskPackGrid from '../components/landing/LandingMaskPackGrid'
import LandingCleanserGrid from '../components/landing/LandingCleanserGrid'
import LandingFullBanner from '../components/landing/LandingFullBanner'
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
        <LandingMaskPackGrid />
        <LandingFullBanner src={IMG.banner1} />
        <LandingCleanserGrid />
        <LandingFullBanner src={IMG.banner2} tall />
      </main>

      <LandingFooter />
    </div>
  )
}
