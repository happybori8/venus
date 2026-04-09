export default function LandingFullBanner({ src, tall = false }) {
  return (
    <section className={`landing-fullbanner ${tall ? 'landing-fullbanner--tall' : ''}`} aria-hidden>
      <img src={src} alt="" className="landing-fullbanner-img" loading="lazy" />
    </section>
  )
}
