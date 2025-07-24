import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { ContentStatus } from '@prisma/client';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://brigada-portal.vercel.app';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/docs`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/members`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  try {
    // Get published documents
    const documents = await prisma.document.findMany({
      where: {
        status: ContentStatus.PUBLISHED,
      },
      select: {
        slug: true,
        updatedAt: true,
        publishedAt: true,
      },
    });

    // Get active members
    const members = await prisma.member.findMany({
      select: {
        name: true,
        updatedAt: true,
      },
    });

    // Generate member slug from name (same logic as in members page)
    const generateSlug = (name: string): string => {
      return name.toLowerCase().replace(/\s+/g, '-');
    };

    // Document pages
    const documentPages: MetadataRoute.Sitemap = documents.map((doc) => ({
      url: `${baseUrl}/docs/${doc.slug}`,
      lastModified: doc.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    // Member pages
    const memberPages: MetadataRoute.Sitemap = members.map((member) => ({
      url: `${baseUrl}/members/${encodeURIComponent(generateSlug(member.name))}`,
      lastModified: member.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));

    return [...staticPages, ...documentPages, ...memberPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return only static pages if database fails
    return staticPages;
  }
}
