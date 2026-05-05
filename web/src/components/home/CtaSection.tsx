import { useCallback } from 'react'
import { ctaContent, appStoreUrls } from '../../constants/home/content'
import styles from './CtaSection.module.scss'

export function CtaSection() {
  const handleClick = useCallback((url: string) => {
    window.open(url, '_blank')
  }, [])

  return (
    <section className={styles.cta} id="cta-section">
      <div id="cta-card" className={styles.card}>
        <h2 className={styles.title}>{ctaContent.title}</h2>
        <p className={styles.description}>{ctaContent.description}</p>
        <div className={styles.buttons}>
          <button
            className={`${styles.btn} ${styles.btnDark}`}
            onClick={() => handleClick(appStoreUrls.ios)}
          >
            <span className="material-symbols-outlined">phone_iphone</span>
            {ctaContent.iosLabel}
          </button>
          <button
            className={`${styles.btn} ${styles.btnLight}`}
            onClick={() => handleClick(appStoreUrls.android)}
          >
            <span className="material-symbols-outlined">phone_android</span>
            {ctaContent.androidLabel}
          </button>
        </div>
      </div>
    </section>
  )
}
