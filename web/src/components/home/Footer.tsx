import { footerContent } from '../../constants/home/content'
import styles from './Footer.module.scss'

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.brand}>{footerContent.brand}</div>
      <div className={styles.links}>
        {footerContent.links.map((link, i) => (
          <a key={i} href={link.href} className={styles.link}>
            {link.label}
          </a>
        ))}
      </div>
      <p className={styles.copy}>
        &copy; {footerContent.year} {footerContent.brand}. {footerContent.tagline}
      </p>
    </footer>
  )
}
