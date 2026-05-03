import { useRef } from 'react'
import { useScrollProgress } from '../../hooks/home/useScrollProgress'
import styles from './ProgressBar.module.scss'

export function ProgressBar() {
  const barRef = useRef<HTMLDivElement>(null!)
  useScrollProgress(barRef)

  return <div ref={barRef} className={styles.bar} />
}
