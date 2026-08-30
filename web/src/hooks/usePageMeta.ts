import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SITE_URL = 'https://somosmerki.app'

function upsertMeta(selector: string, attribute: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attribute, '')
    document.head.appendChild(el)
  }
  el.setAttribute(attribute, value)
}

function upsertCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

/**
 * Sets the document title, description and canonical URL for a page.
 * Used on SPA routes so each page exposes its own meta tags to crawlers.
 */
export function usePageMeta(title: string, description?: string) {
  const { pathname } = useLocation()

  useEffect(() => {
    document.title = title

    upsertCanonical(`${SITE_URL}${pathname === '/' ? '/' : pathname}`)

    upsertMeta('meta[property="og:title"]', 'content', title)
    upsertMeta('meta[name="twitter:title"]', 'content', title)

    if (description) {
      upsertMeta('meta[name="description"]', 'content', description)
      upsertMeta('meta[property="og:description"]', 'content', description)
      upsertMeta('meta[name="twitter:description"]', 'content', description)
    }
  }, [title, description, pathname])
}
