import { heroContent } from '../../constants/home/content'
import { ScrollIndicator } from './ScrollIndicator'
import { DownloadButtons } from './DownloadButtons'
import { PhoneMockup } from './PhoneMockup'
import styles from './HeroSection.module.scss'

export function HeroSection() {
  return (
    <section className={`${styles.hero} dark-section`} id="hero">
      <div className={styles.glow} />
      <div className={styles.grid}>
        <div className={`${styles.textCol} gsap-hero-text`}>
          <div className={styles.badge}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", color: 'var(--accent-sunny)' }}>
              {heroContent.badgeIcon}
            </span>
            <span>{heroContent.badge}</span>
          </div>
          <h1 className={styles.title}>
            {heroContent.title}
            <br />
            <span className="gradient-text">{heroContent.titleAccent}</span>
          </h1>
          <p className={styles.description}>{heroContent.description}</p>
          <DownloadButtons variant="light" />
        </div>
        <div className={styles.mockupCol}>
          <div className="gsap-float">
            <PhoneMockup />
          </div>
        </div>
      </div>
      <div className="gsap-scroll-indicator">
        <ScrollIndicator />
      </div>
    </section>
  )
}
