import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://master-of-courses.vercel.app', lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: 'https://master-of-courses.vercel.app/login', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.8 },
    { url: 'https://master-of-courses.vercel.app/register', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.8 },
    { url: 'https://master-of-courses.vercel.app/privacy', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: 'https://master-of-courses.vercel.app/terms', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]
}
