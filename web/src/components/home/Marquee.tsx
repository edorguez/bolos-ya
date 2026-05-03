import type { Testimonial } from '../../constants/home/content'
import styles from './Marquee.module.scss'

interface MarqueeProps {
  items: Testimonial[]
}

function TestimonialCard({ name, text, rating }: Testimonial) {
  return (
    <div className={styles.card}>
      <div className={styles.stars}>
        {Array.from({ length: rating }, (_, i) => (
          <span key={i} className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            star
          </span>
        ))}
      </div>
      <p className={styles.text}>"{text}"</p>
      <p className={styles.author}>- {name}</p>
    </div>
  )
}

export function Marquee({ items }: MarqueeProps) {
  return (
    <div className={styles.marquee}>
      <div className={styles.content}>
        {items.map((item, i) => (
          <TestimonialCard key={i} {...item} />
        ))}
        {items.map((item, i) => (
          <TestimonialCard key={`dup-${i}`} {...item} />
        ))}
      </div>
    </div>
  )
}
