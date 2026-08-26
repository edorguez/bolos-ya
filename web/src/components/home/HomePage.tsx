import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '../../hooks/home/useReducedMotion'
import { ProgressBar } from './ProgressBar'
import { TopNavBar } from './TopNavBar'
import { HeroSection } from './HeroSection'
import { FeaturesSection } from './FeaturesSection'
import { ProductShowcase } from './ProductShowcase'
import { SocialProofSection } from './SocialProofSection'
import { CtaSection } from './CtaSection'
import { Footer } from './Footer'
import { MobileStickyCta } from './MobileStickyCta'
import styles from '../../App.module.scss'

gsap.registerPlugin(ScrollTrigger)

export function HomePage() {
  const reduced = useReducedMotion()
  const ctxRef = useRef<gsap.Context | null>(null)
  const tiltRef = useRef<{ raf: number; x: number; y: number; tx: number; ty: number }>({ raf: 0, x: 0, y: 0, tx: 0, ty: 0 })

  useEffect(() => {
    if (reduced) return
    if (ctxRef.current) ctxRef.current.revert()

    const ctx = gsap.context(() => {
      const isDesktop = window.matchMedia('(min-width: 1024px)').matches

      // Hero entrance — staggered reveal
      gsap.from('.gsap-hero-text', {
        y: 32,
        opacity: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: 'power3.out',
      })

      // Hero blobs — pop in + idle bob
      gsap.from('.gsap-hero-blob', {
        scale: 0,
        opacity: 0,
        duration: 1,
        ease: 'back.out(1.6)',
        stagger: 0.15,
        delay: 0.3,
      })

      gsap.utils.toArray<HTMLElement>('.gsap-hero-blob').forEach((el, i) => {
        gsap.to(el, {
          y: 'random(-14, 14)',
          rotation: 'random(-5, 5)',
          duration: 3 + i,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      })

      // Hero parallax on scroll
      gsap.to('.gsap-hero-blob', {
        yPercent: 30,
        ease: 'none',
        scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1 },
      })

      // Scroll indicator fades as you leave hero
      gsap.to('.gsap-scroll-indicator', {
        opacity: 0,
        scrollTrigger: { trigger: '#hero', start: 'top top', end: '60% top', scrub: 0.5 },
      })

      // Feature cards + social cards — staggered batch reveal per section
      gsap.set('.gsap-reveal', { y: 40, opacity: 0 })
      ScrollTrigger.batch('.gsap-reveal', {
        start: 'top 88%',
        onEnter: batch =>
          gsap.to(batch, {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.12,
            ease: 'power2.out',
            overwrite: true,
          }),
      })

      // Product showcase — phone entrance + coin parallax + bubble pop
      if (isDesktop) {
        gsap.from('.gsap-showcase-phone', {
          y: 90,
          rotationY: -18,
          rotationX: 6,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: '#soluciones', start: 'top 75%', toggleActions: 'play none none reverse' },
        })

        gsap.to('.gsap-coin-top', {
          yPercent: 40,
          ease: 'none',
          scrollTrigger: { trigger: '#soluciones', start: 'top bottom', end: 'bottom top', scrub: 1 },
        })
        gsap.to('.gsap-coin-bottom', {
          yPercent: -40,
          ease: 'none',
          scrollTrigger: { trigger: '#soluciones', start: 'top bottom', end: 'bottom top', scrub: 1 },
        })

        gsap.from('.gsap-showcase-bubble', {
          scale: 0,
          opacity: 0,
          duration: 0.7,
          ease: 'back.out(1.8)',
          delay: 0.5,
          scrollTrigger: { trigger: '#soluciones', start: 'top 70%', toggleActions: 'play none none reverse' },
        })
      }

      // CTA card — pop in
      gsap.from('#cta-card', {
        scale: 0.85,
        opacity: 0,
        y: 40,
        duration: 0.9,
        ease: 'power2.out',
        scrollTrigger: { trigger: '#cta-section', start: 'top 85%', toggleActions: 'play none none reverse' },
      })
    })

    ctxRef.current = ctx
    ScrollTrigger.refresh()
    return () => ctx.revert()
  }, [reduced])

  // Mouse tilt for the showcase phone (desktop only, GPU-friendly transform)
  useEffect(() => {
    if (reduced) return
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches
    if (!isDesktop) return

    const phone = document.querySelector('.gsap-showcase-phone') as HTMLElement | null
    if (!phone) return

    const tilt = tiltRef.current

    const onMove = (e: MouseEvent) => {
      const rect = phone.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      tilt.tx = ((e.clientX - cx) / rect.width) * 10
      tilt.ty = ((e.clientY - cy) / rect.height) * 8
    }

    const loop = () => {
      tilt.x += (tilt.tx - tilt.x) * 0.08
      tilt.y += (tilt.ty - tilt.y) * 0.08
      phone.style.transform = `rotateY(${tilt.x}deg) rotateX(${-tilt.y}deg)`
      tilt.raf = requestAnimationFrame(loop)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    tilt.raf = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(tilt.raf)
    }
  }, [reduced])

  return (
    <div className={styles.app}>
      <ProgressBar />
      <TopNavBar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <ProductShowcase />
        <SocialProofSection />
        <CtaSection />
      </main>
      <Footer />
      <MobileStickyCta />
    </div>
  )
}
