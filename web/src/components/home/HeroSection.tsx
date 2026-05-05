import { heroContent } from '../../constants/home/content'
import { ScrollIndicator } from './ScrollIndicator'
import { DownloadButtons } from './DownloadButtons'
import { PhoneMockup } from './PhoneMockup'
import styles from './HeroSection.module.scss'

export function HeroSection() {
  return (
    <section className={styles.hero} id="hero">
      <div className={styles.grid}>
        <div className={`${styles.textCol} gsap-hero-text`}>
          <div className={styles.illustrations}>
            <div className={`${styles.blob} ${styles.blob1}`}>
              <span>$</span>
            </div>
            <div className={`${styles.blob} ${styles.blob2}`}>
              <span className={styles.blobText}>Bs</span>
            </div>
            <div className={`${styles.blob} ${styles.blob3}`}>
              <span>%</span>
            </div>
            <div className={`${styles.blob} ${styles.blob4}`}>
              <span className={styles.blobText}>USD</span>
            </div>
          </div>
          <div className={styles.badge}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", color: 'var(--color-sunburst-yellow)' }}>
              {heroContent.badgeIcon}
            </span>
            <span>{heroContent.badge}</span>
          </div>
          <h1 className={styles.title}>
            {heroContent.title}
            <br />
            <span className={styles.titleAccent}>{heroContent.titleAccent}</span>
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
