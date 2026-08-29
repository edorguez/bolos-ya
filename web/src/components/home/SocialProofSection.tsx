import { stats, testimonials } from '../../constants/home/content'
import { Counter } from './Counter'
import styles from './SocialProofSection.module.scss'

export function SocialProofSection() {
  return (
    <section id="testimonios" className={styles.section}>
      <h2 className={`${styles.title} gsap-reveal`}>Amigos de Merki</h2>

      <div className={`${styles.stats} gsap-reveal`}>
        {stats.map((stat, i) => (
          <div key={i} className={styles.stat}>
            <span className={`${styles.statValue} ${i === 0 ? styles.statPrimary : styles.statSecondary}`}>
              <Counter target={stat.value} suffix={stat.suffix} isFloat={stat.isFloat} />
            </span>
            <span className={styles.statLabel}>{stat.label}</span>
          </div>
        ))}
      </div>

      <div className={styles.carousel}>
        <div className={styles.track}>
          {testimonials.map((t, i) => (
            <article key={i} className={`${styles.card} gsap-reveal`}>
              <div className={styles.cardHeader}>
                <div className={styles.avatar}>
                  <img src={t.avatar} alt={t.name} loading="lazy" />
                </div>
                <div>
                  <p className={styles.name}>{t.name}</p>
                  <p className={styles.role}>{t.role}</p>
                </div>
              </div>
              <p className={styles.quote}>“{t.text}”</p>
            </article>
          ))}
          {testimonials.map((t, i) => (
            <article key={`clone-${i}`} className={styles.card} aria-hidden="true">
              <div className={styles.cardHeader}>
                <div className={styles.avatar}>
                  <img src={t.avatar} alt="" loading="lazy" />
                </div>
                <div>
                  <p className={styles.name}>{t.name}</p>
                  <p className={styles.role}>{t.role}</p>
                </div>
              </div>
              <p className={styles.quote}>“{t.text}”</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
