import { ctaContent } from '../../constants/home/content'
import { DownloadButtons } from './DownloadButtons'
import styles from './CtaSection.module.scss'

export function CtaSection() {
  return (
    <section className={styles.cta} id="cta-section">
      <div id="cta-card" className={styles.card}>
        <div className={styles.blob} aria-hidden="true" />
        <div className={styles.copy}>
          <h2 className={styles.title}>{ctaContent.title}</h2>
          <p className={styles.description}>{ctaContent.description}</p>
        </div>
        <div className={styles.buttons}>
          <DownloadButtons />
        </div>
      </div>
    </section>
  )
}
