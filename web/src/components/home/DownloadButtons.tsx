import { useCallback } from 'react'
import { appStoreUrls } from '../../constants/home/content'
import styles from './DownloadButtons.module.scss'

interface DownloadButtonsProps {
  variant?: 'light' | 'dark'
  className?: string
}

export function DownloadButtons({ variant = 'light', className = '' }: DownloadButtonsProps) {
  const handleClick = useCallback((store: 'ios' | 'android') => {
    const btn = document.activeElement as HTMLElement | null
    btn?.classList.add(styles.ripple)
    setTimeout(() => btn?.classList.remove(styles.ripple), 600)
    window.open(appStoreUrls[store], '_blank')
  }, [])

  const iosClass = `${styles.btn} ${styles.btnIos} ${variant === 'dark' ? styles.btnDark : ''}`
  const androidClass = `${styles.btn} ${styles.btnAndroid} ${variant === 'dark' ? styles.btnDark : ''}`

  return (
    <div className={`${styles.wrapper} ${className}`}>
      <button className={iosClass} onClick={() => handleClick('ios')}>
        <span className="material-symbols-outlined" style={{ fontSize: 32 }}>ios</span>
        <div className={styles.btnText}>
          <span className={styles.btnSub}>Consíguelo en el</span>
          <span className={styles.btnMain}>App Store</span>
        </div>
      </button>
      <button className={androidClass} onClick={() => handleClick('android')}>
        <span className="material-symbols-outlined" style={{ fontSize: 32 }}>play_arrow</span>
        <div className={styles.btnText}>
          <span className={styles.btnSub}>Disponible en</span>
          <span className={styles.btnMain}>Google Play</span>
        </div>
      </button>
    </div>
  )
}
