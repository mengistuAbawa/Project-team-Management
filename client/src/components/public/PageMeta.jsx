import { useEffect } from 'react';

function setMeta(attribute, key, content) {
  const selector = `meta[${attribute}="${key}"]`;
  let meta = document.head.querySelector(selector);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, key);
    document.head.appendChild(meta);
  }
  meta.content = content;
}

export function PageMeta({ title, description, noindex = false }) {
  useEffect(() => {
    const pageTitle = `${title} | PTMS`;
    document.title = pageTitle;
    setMeta('name', 'description', description);
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');

    if (noindex) {
      document.head.querySelector('link[rel="canonical"]')?.remove();
      return;
    }

    const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
    const canonicalUrl = new URL(window.location.pathname, siteUrl).href;
    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    setMeta('property', 'og:title', pageTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:url', canonicalUrl);
    setMeta('property', 'og:image', new URL('/social-preview.svg', siteUrl).href);
    setMeta('property', 'og:image:alt', 'PTMS project and team management workspace preview');
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', pageTitle);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', new URL('/social-preview.svg', siteUrl).href);
  }, [title, description, noindex]);

  return null;
}
