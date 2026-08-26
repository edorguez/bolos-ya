import { heroContent } from '../../constants/home/content'
import { ScrollIndicator } from './ScrollIndicator'
import { DownloadButtons } from './DownloadButtons'
import styles from './HeroSection.module.scss'

export function HeroSection() {
  return (
    <section className={styles.hero} id="hero">
      <div className={styles.blobs} aria-hidden="true">
        {heroContent.heroImages.map((img, i) => (
          <img
            key={i}
            src={img.src}
            alt=""
            className={`${styles.blob} ${styles[img.className]} gsap-hero-blob`}
          />
        ))}
      </div>

      <div className={styles.content}>
        <div className={`${styles.badge} gsap-hero-text`}>
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1", color: 'var(--color-secondary)' }}
          >
            {heroContent.badgeIcon}
          </span>
          <span>{heroContent.badge}</span>
        </div>
        <h1 className={`${styles.title} gsap-hero-text`}>
          {heroContent.title}
          <br />
          <span className={styles.titleAccent}>{heroContent.titleAccent}</span>
        </h1>
        <p className={`${styles.description} gsap-hero-text`}>{heroContent.description}</p>
        <div className={`${styles.buttons} gsap-hero-text`}>
          <DownloadButtons />
        </div>
      </div>

      <div className="gsap-scroll-indicator">
        <ScrollIndicator />
      </div>
    </section>
  )
}
