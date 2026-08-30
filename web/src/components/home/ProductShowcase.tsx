import { showcaseContent } from '../../constants/home/content'
import { MaterialIcon } from '../shared/MaterialIcon'
import styles from './ProductShowcase.module.scss'

export function ProductShowcase() {
  return (
    <section id="la-app" className={styles.section}>
      <div className={styles.stage}>
        <div className={styles.phoneWrap}>
          <div className={`${styles.phone} gsap-showcase-phone`}>
            <div className={styles.screen}>
              <div className={styles.walletHeader}>
                <h4 className={styles.walletTitle}>{showcaseContent.title}</h4>
                <MaterialIcon name="notifications" style={{ color: 'var(--color-graphite)' }} />
              </div>

              <div className={styles.balanceCard}>
                <span className={styles.balanceLabel}>{showcaseContent.balanceLabel}</span>
                <span className={styles.balanceValue}>{showcaseContent.balanceValue}</span>
              </div>

              <div className={styles.transactions}>
                <span className={styles.transactionsLabel}>{showcaseContent.transactionsLabel}</span>
                <div className={styles.txRow}>
                  <div className={styles.txLeft}>
                    <div className={`${styles.txBadge} ${styles.txBadgeNeutral}`}>
                      <MaterialIcon name="shopping_cart" style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <div className={styles.txMeta}>
                      <span className={styles.txName}>Supermercado</span>
                      <span className={styles.txDate}>Hoy, 10:30 AM</span>
                    </div>
                  </div>
                  <span className={styles.txAmount}>-$45.00</span>
                </div>

                <div className={styles.txRow}>
                  <div className={styles.txLeft}>
                    <div className={`${styles.txBadge} ${styles.txBadgeNeutral}`}>
                      <span className={`${styles.receiveDot}`} />
                      <MaterialIcon name="arrow_downward" style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <div className={styles.txMeta}>
                      <span className={styles.txName}>Transferencia</span>
                      <span className={styles.txDate}>Ayer</span>
                    </div>
                  </div>
                  <span className={`${styles.txAmount} ${styles.txPositive}`}>+$100.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`${styles.bubble} gsap-showcase-bubble`}>
          <img src={showcaseContent.character.src} alt="" width="40" height="40" className={styles.bubbleAvatar} />
          <p className={styles.bubbleText}>{showcaseContent.bubbleText}</p>
        </div>
      </div>
    </section>
  )
}
