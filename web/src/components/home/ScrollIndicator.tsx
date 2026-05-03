import styles from './ScrollIndicator.module.scss'

export function ScrollIndicator() {
  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>Explorar</span>
      <span className={`material-symbols-outlined ${styles.arrow}`}>arrow_downward</span>
    </div>
  )
}
