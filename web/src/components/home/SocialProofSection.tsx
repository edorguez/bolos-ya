import { stats, testimonials } from '../../constants/home/content'
import { Counter } from './Counter'
import { Marquee } from './Marquee'
import styles from './SocialProofSection.module.scss'

export function SocialProofSection() {
  return (
    <section id="social-pin" className={styles.pinSpacer}>
      <div className={styles.pinContainer}>
        <div className={styles.inner}>
          <h2 className={styles.title}>Amado por miles de venezolanos</h2>
          <div className={styles.stats}>
            {stats.map((stat, i) => (
              <div key={i} className={styles.stat} id={`stat-${i}`}>
                <span className={`${styles.statValue} ${i === 0 ? styles.statPrimary : styles.statSecondary}`}>
                  <Counter target={stat.value} suffix={stat.suffix} isFloat={stat.isFloat} />
                </span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
        <Marquee items={testimonials} />
      </div>
    </section>
  )
}
