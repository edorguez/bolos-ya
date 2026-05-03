import { heroContent } from '../../constants/home/content'
import styles from './PhoneMockup.module.scss'

export function PhoneMockup() {
  return (
    <div className={`${styles.container} gsap-float-target`}>
      <div className={styles.mockup}>
        <div className={styles.screen}>
          <img
            alt="App Mockup"
            className={styles.image}
            src={heroContent.mockupImage}
          />
        </div>
      </div>
      <div className={styles.widget}>
        <div className={styles.widgetIcon}>
          <span className="material-symbols-outlined">currency_exchange</span>
        </div>
        <div>
          <p className={styles.widgetLabel}>{heroContent.floatingWidget.label}</p>
          <p className={styles.widgetValue}>{heroContent.floatingWidget.value}</p>
        </div>
      </div>
    </div>
  )
}
