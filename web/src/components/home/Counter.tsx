import { useEffect, useRef, useState } from 'react'

interface CounterProps {
  target: number
  suffix?: string
  isFloat?: boolean
  duration?: number
}

export function Counter({ target, suffix = '', isFloat = false, duration = 2000 }: CounterProps) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const startTime = performance.now()

          const animate = (now: number) => {
            const elapsed = now - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            const current = eased * target

            setCount(isFloat ? parseFloat(current.toFixed(1)) : Math.round(current))

            if (progress < 1) {
              requestAnimationFrame(animate)
            }
          }

          requestAnimationFrame(animate)
          observer.disconnect()
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [target, isFloat, duration])

  return (
    <span ref={ref}>
      {count}{suffix}
    </span>
  )
}
