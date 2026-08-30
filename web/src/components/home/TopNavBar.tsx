import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { brandAssets, footerContent, navLinks } from '../../constants/home/content'
import styles from './TopNavBar.module.scss'

export function TopNavBar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>
        <a href="#hero" className={styles.brand} aria-label="Merki">
          <img src={brandAssets.logo} alt="Merki" className={styles.logo} />
        </a>

        <nav className={styles.links} aria-label="Principal">
          {navLinks.map(link => (
            <a key={link.label} href={link.href} className={styles.link} onClick={() => setMenuOpen(false)}>
              {link.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          className={styles.toggle}
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(open => !open)}
        >
          <span className="material-symbols-outlined">{menuOpen ? 'close' : 'menu'}</span>
        </button>
      </div>

      <div className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`}>
        {navLinks.map(link => (
          <a
            key={link.label}
            href={link.href}
            className={styles.mobileLink}
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </a>
        ))}

        <div className={styles.mobileDivider} />

        {footerContent.links.map(link => (
          <Link
            key={link.label}
            to={link.href}
            className={styles.mobileLink}
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </header>
  )
}
