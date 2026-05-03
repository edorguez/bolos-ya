import { useCallback } from 'react'
import { ctaContent, appStoreUrls } from '../../constants/home/content'
import styles from './CtaSection.module.scss'

export function CtaSection() {
  const handleClick = useCallback((url: string) => {
    window.open(url, '_blank')
  }, [])

  return (
    <section className={styles.cta} id="cta-section">
      <div className={styles.blob1} />
      <div className={styles.blob2} />
      <div id="cta-card" className={styles.card}>
        <h2 className={styles.title}>{ctaContent.title}</h2>
        <p className={styles.description}>{ctaContent.description}</p>
        <div className={styles.buttons}>
          <button
            className={`${styles.btn} ${styles.btnIos}`}
            onClick={() => handleClick(appStoreUrls.ios)}
          >
            <span className="material-symbols-outlined">apple</span>
            {ctaContent.iosLabel}
          </button>
          <button
            className={`${styles.btn} ${styles.btnAndroid}`}
            onClick={() => handleClick(appStoreUrls.android)}
          >
            <span className="material-symbols-outlined">android</span>
            {ctaContent.androidLabel}
          </button>
        </div>
      </div>
    </section>
  )
}
