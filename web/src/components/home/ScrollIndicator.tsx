import { MaterialIcon } from '../shared/MaterialIcon'
import styles from './ScrollIndicator.module.scss'

export function ScrollIndicator() {
  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>Explorar</span>
      <MaterialIcon name="arrow_downward" className={styles.arrow} />
    </div>
  )
}
