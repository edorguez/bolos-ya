import { sidebarContent } from '../../constants/admin/content'
import { brandAssets } from '../../constants/home/content'
import styles from './HeaderBar.module.scss'

interface HeaderBarProps {
  onToggle: () => void
}

export function HeaderBar({ onToggle }: HeaderBarProps) {
  return (
    <div className={styles.bar}>
      <button className={styles.hamburger} onClick={onToggle} aria-label="Toggle menu">
        <span className="material-symbols-outlined">menu</span>
      </button>
      <img src={brandAssets.logo} alt={sidebarContent.title} className={styles.logo} />
    </div>
  )
}
