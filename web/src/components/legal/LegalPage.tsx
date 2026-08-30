import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Footer } from '../home/Footer'
import { MaterialIcon } from '../shared/MaterialIcon'
import { usePageMeta } from '../../hooks/usePageMeta'
import styles from './legalPage.module.scss'

export interface LegalSection {
  title: string
  content?: string
  items?: string[]
  extra?: string
}

interface PageShellProps {
  title: string
  subtitle: string
  meta?: string
  children: ReactNode
  note?: string
}

export function PageShell({ title, subtitle, meta, children, note }: PageShellProps) {
  usePageMeta(`${title} | Merki`, subtitle)

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Link to="/" className={styles.backLink}>
          <MaterialIcon name="arrow_back" style={{ fontSize: 18 }} />
          Volver a Merki
        </Link>

        <header className={styles.header}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
          {meta && <p className={styles.lastUpdated}>{meta}</p>}
        </header>

        {children}

        {note && (
          <div className={styles.footerNote}>
            <p>{note}</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

interface LegalPageProps {
  title: string
  subtitle: string
  lastUpdated: string
  sections: LegalSection[]
  note?: string
}

export function LegalPage({ title, subtitle, lastUpdated, sections, note }: LegalPageProps) {
  return (
    <PageShell title={title} subtitle={subtitle} meta={`Última actualización: ${lastUpdated}`} note={note}>
      <div className={styles.content}>
        {sections.map((section, i) => (
          <section key={i} className={styles.section}>
            <h2 className={styles.sectionTitle}>{section.title}</h2>
            {section.content && <p className={styles.paragraph}>{section.content}</p>}
            {section.items && (
              <ul className={styles.list}>
                {section.items.map((item, j) => (
                  <li key={j} className={styles.listItem}>
                    {item}
                  </li>
                ))}
              </ul>
            )}
            {section.extra && <p className={styles.extra}>{section.extra}</p>}
          </section>
        ))}
      </div>
    </PageShell>
  )
}
