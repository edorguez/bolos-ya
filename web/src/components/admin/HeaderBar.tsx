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
      <span className={styles.brand}>Portal Admin</span>
    </div>
  )
}
