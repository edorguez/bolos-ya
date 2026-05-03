import { features } from '../../constants/home/content'
import styles from './FeaturesSection.module.scss'

export function FeaturesSection() {
  return (
    <section id="features-pin" className={styles.pinSpacer}>
      <div className={styles.pinContainer}>
        <div className={styles.layout}>
          <div className={styles.textCol}>
            {features.map((f, i) => (
              <div
                key={i}
                id={`f-text-${i}`}
                className={`${styles.featureBlock} ${i > 0 ? styles.featureHidden : ''}`}
              >
                <div className={`${styles.featureIcon} ${styles[`icon${f.color.charAt(0).toUpperCase() + f.color.slice(1)}`]}`}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.875rem' }}>
                    {f.icon}
                  </span>
                </div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.description}</p>
              </div>
            ))}
          </div>
          <div className={styles.mockupCol}>
            <div className={styles.mockup}>
              <div className={styles.mockupScreen}>
                <div className={styles.mockupHeader}>
                  <span className={styles.mockupBrand}>Bolos Ya</span>
                  <span className="material-symbols-outlined">menu</span>
                </div>
                <div className={styles.mockupContent}>
                  {['qr_code_scanner', 'map', 'cloud_off'].map((icon, i) => (
                    <div
                      key={i}
                      id={`f-screen-${i}`}
                      className={`${styles[`screenBase`]} ${styles[`screen${i}`]} ${i > 0 ? styles.screenHidden : ''}`}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '3.75rem' }}>
                        {icon}
                      </span>
                      {i === 2 && <p className={styles.screenLabel}>Modo Offline Activo</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
