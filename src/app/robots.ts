import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://careeragent.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/chat/', '/games/', '/results/', '/parent/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
