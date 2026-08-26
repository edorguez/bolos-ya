import { showcaseContent } from '../../constants/home/content'
import styles from './ProductShowcase.module.scss'

export function ProductShowcase() {
  return (
    <section id="soluciones" className={styles.section}>
      <div className={styles.stage}>
        <img
          src={showcaseContent.coin1.src}
          alt=""
          aria-hidden="true"
          className={`${styles.coin} ${styles.coinTop} gsap-coin-top`}
          loading="lazy"
        />
        <img
          src={showcaseContent.coin2.src}
          alt=""
          aria-hidden="true"
          className={`${styles.coin} ${styles.coinBottom} gsap-coin-bottom`}
          loading="lazy"
        />

        <div className={styles.phoneWrap}>
          <div className={`${styles.phone} gsap-showcase-phone`}>
            <div className={styles.screen}>
              <div className={styles.walletHeader}>
                <h4 className={styles.walletTitle}>{showcaseContent.title}</h4>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-graphite)' }}>
                  notifications
                </span>
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
                      <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>
                        shopping_cart
                      </span>
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
                      <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>
                        arrow_downward
                      </span>
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
          <img src={showcaseContent.character.src} alt="" className={styles.bubbleAvatar} />
          <p className={styles.bubbleText}>{showcaseContent.bubbleText}</p>
        </div>
      </div>
    </section>
  )
}
