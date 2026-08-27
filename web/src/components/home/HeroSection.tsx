import { heroContent } from '../../constants/home/content'
import { ScrollIndicator } from './ScrollIndicator'
import { DownloadButtons } from './DownloadButtons'
import styles from './HeroSection.module.scss'

export function HeroSection() {
  return (
    <section className={styles.hero} id="hero">
      <div className={styles.content}>
        <img
          src={heroContent.illustration}
          alt="Ilustración de marca Merki"
          className={`${styles.heroImage} gsap-hero-text`}
        />
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
