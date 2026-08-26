import { brandAssets, footerContent } from '../../constants/home/content'
import styles from './Footer.module.scss'

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        <div className={styles.brandCol}>
          <img src={brandAssets.logo} alt="Merki" className={styles.logo} />
          <p className={styles.copy}>
            &copy; {footerContent.year} {footerContent.brand}. Todos los derechos reservados.
          </p>
        </div>
        <div className={styles.linkCols}>
          {footerContent.links.map((link, i) => (
            <div key={i} className={styles.linkCol}>
              <a href={link.href} className={styles.link}>
                {link.label}
              </a>
            </div>
          ))}
        </div>
      </div>
    </footer>
  )
}
