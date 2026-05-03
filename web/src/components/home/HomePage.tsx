import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '../../hooks/home/useReducedMotion'
import { ProgressBar } from './ProgressBar'
import { HeroSection } from './HeroSection'
import { StorySection } from './StorySection'
import { FeaturesSection } from './FeaturesSection'
import { SocialProofSection } from './SocialProofSection'
import { CtaSection } from './CtaSection'
import { Footer } from './Footer'
import { MobileStickyCta } from './MobileStickyCta'
import styles from '../../App.module.scss'

gsap.registerPlugin(ScrollTrigger)

export function HomePage() {
  const reduced = useReducedMotion()
  const ctxRef = useRef<gsap.Context | null>(null)

  useEffect(() => {
    if (reduced) return
    if (ctxRef.current) ctxRef.current.revert()

    const ctx = gsap.context(() => {
      const isDesktop = window.matchMedia('(min-width: 1024px)').matches

      const heroTl = gsap.timeline({ defaults: { duration: 0.8, ease: 'power3.out' } })
      heroTl
        .from('.gsap-hero-text > *', { y: 30, opacity: 0, stagger: 0.1 })
        .from('.gsap-float', { y: 20, opacity: 0, ease: 'back.out(1.5)' }, '-=0.4')

      gsap.to('.gsap-float-target', {
        y: -12,
        rotation: -3,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })

      gsap.to('#hero', {
        opacity: 0.3,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '#story-pin',
          start: 'top bottom',
          end: 'top top',
          scrub: 1,
        },
      })

      gsap.to('.gsap-scroll-indicator', {
        opacity: 0,
        scrollTrigger: {
          trigger: '#story-pin',
          start: 'top bottom-=100',
          end: 'top top',
          scrub: 0.5,
        },
      })

      ScrollTrigger.create({
        trigger: '#story-pin',
        pin: true,
        start: 'top top',
        end: '+=200%',
        scrub: 1.5,
      })

      gsap
        .timeline({
          scrollTrigger: {
            trigger: '#story-pin',
            start: 'top top',
            end: '+=200%',
            scrub: 1.5,
          },
        })
        .to('#story-problem', {
          xPercent: isDesktop ? -100 : 0,
          yPercent: isDesktop ? 0 : -100,
          opacity: 0,
          ease: 'power2.inOut',
          duration: 0.6,
        })
        .fromTo(
          '#story-solution',
          {
            xPercent: isDesktop ? 50 : 0,
            yPercent: isDesktop ? 0 : 100,
            opacity: 0,
          },
          {
            xPercent: 0,
            yPercent: 0,
            opacity: 1,
            ease: 'power2.inOut',
            duration: 0.6,
          },
          0.2
        )

      ScrollTrigger.create({
        trigger: '#features-pin',
        pin: true,
        start: 'top top',
        end: '+=300%',
        scrub: 1.5,
      })

      const fStarts = [0, 0.33, 0.66]

      for (let i = 0; i < 3; i++) {
        const s = fStarts[i]
        const enter = s
        const stayEnd = s + 0.33

        gsap.fromTo(
          `#f-text-${i}`,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '#features-pin',
              start: `+=${enter * 100}%`,
              end: `+=${(enter + 0.15) * 100}%`,
              scrub: 1.5,
            },
          }
        )
        gsap.to(`#f-text-${i}`, {
          y: -30,
          opacity: 0,
          ease: 'power2.in',
          scrollTrigger: {
            trigger: '#features-pin',
            start: `+=${(enter + 0.15) * 100}%`,
            end: `+=${stayEnd * 100}%`,
            scrub: 1.5,
          },
        })

        gsap.fromTo(
          `#f-screen-${i}`,
          { opacity: 0, zIndex: 0 },
          {
            opacity: 1,
            zIndex: 10,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '#features-pin',
              start: `+=${enter * 100}%`,
              end: `+=${(enter + 0.15) * 100}%`,
              scrub: 1.5,
            },
          }
        )
        gsap.to(`#f-screen-${i}`, {
          opacity: 0,
          zIndex: 0,
          ease: 'power2.in',
          scrollTrigger: {
            trigger: '#features-pin',
            start: `+=${(enter + 0.15) * 100}%`,
            end: `+=${stayEnd * 100}%`,
            scrub: 1.5,
          },
        })
      }

      ScrollTrigger.create({
        trigger: '#social-pin',
        pin: true,
        start: 'top top',
        end: '+=200%',
        scrub: 1,
      })

      gsap.from('#cta-card', {
        scale: 0.8,
        opacity: 0,
        y: 50,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '#cta-section',
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      })
    })

    ctxRef.current = ctx
    ScrollTrigger.refresh()
    return () => ctx.revert()
  }, [reduced])

  return (
    <div className={styles.app}>
      <ProgressBar />
      <main>
        <HeroSection />
        <StorySection />
        <FeaturesSection />
        <SocialProofSection />
        <CtaSection />
      </main>
      <Footer />
      <MobileStickyCta />
    </div>
  )
}
