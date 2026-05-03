import { storyContent } from '../../constants/home/content'
import styles from './StorySection.module.scss'

export function StorySection() {
  return (
    <section id="story-pin" className={styles.pinSpacer}>
      <div className={styles.pinContainer}>
        <div id="story-problem" className={styles.problem}>
          <h2 className={styles.problemTitle}>{storyContent.problem.title}</h2>
          <p className={styles.description}>{storyContent.problem.description}</p>
          <div className={styles.iconBox}>
            <span className="material-symbols-outlined" style={{ fontSize: '3.75rem', color: 'var(--outline)' }}>
              calculate
            </span>
          </div>
        </div>
        <div id="story-solution" className={styles.solution}>
          <h2 className={styles.solutionTitle}>{storyContent.solution.title}</h2>
          <p className={styles.description}>{storyContent.solution.description}</p>
          <div className={styles.points}>
            {storyContent.solution.points.map((point, i) => (
              <div key={i} className={styles.pointCard}>
                <span className={`material-symbols-outlined ${styles.pointIcon} ${i === 0 ? styles.pointIconPrimary : styles.pointIconSecondary}`}>
                  {point.icon}
                </span>
                <div>
                  <h4 className={styles.pointTitle}>{point.title}</h4>
                  <p className={styles.pointDesc}>{point.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
