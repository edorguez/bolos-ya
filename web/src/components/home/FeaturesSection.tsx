import { features } from '../../constants/home/content'
import styles from './FeaturesSection.module.scss'

export function FeaturesSection() {
  return (
    <section id="caracteristicas" className={styles.section}>
      <h2 className={styles.heading}>Diseñado para tu día a día</h2>
      <div className={styles.grid}>
        {features.map((f, i) => (
          <article key={i} className={`${styles.card} gsap-reveal`}>
            <div className={styles.panel}>
              <img src={f.image} alt="" className={styles.panelImage} loading="lazy" />
            </div>
            <div className={styles.body}>
              <div className={styles.titleRow}>
                <span className={`material-symbols-outlined ${styles.icon}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                  {f.icon}
                </span>
                <h3 className={styles.cardTitle}>{f.title}</h3>
              </div>
              <p className={styles.cardDesc}>{f.description}</p>
              {f.chips && (
                <div className={styles.chips}>
                  {f.chips.map(chip => (
                    <span
                      key={chip.label}
                      className={`${styles.chip} ${chip.variant === 'primary' ? styles.chipPrimary : styles.chipNeutral}`}
                    >
                      {chip.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
