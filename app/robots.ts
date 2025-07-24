import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://brigada-portal.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/docs', '/docs/*', '/members', '/members/*', '/login', '/register'],
        disallow: ['/api/*', '/admin/*', '/profile', '/pending-approval', '/*.json$', '/manifest.json'],
      },
      {
        userAgent: 'Googlebot',
        allow: ['/', '/docs', '/docs/*', '/members', '/members/*'],
        disallow: ['/api/*', '/admin/*', '/profile', '/pending-approval', '/login', '/register'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
