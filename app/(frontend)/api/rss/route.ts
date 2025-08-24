import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const siteTitle = process.env.NEXT_PUBLIC_SITE_TITLE || 'Portfolio Blog'
    const siteDescription = process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'Latest blog posts and updates'
    
    // Get all published posts
    const posts = await payload.find({
      collection: 'posts' as any,
      where: {
        status: {
          equals: 'published',
        },
      },
      limit: 50,
      sort: '-publishedAt',
    })

    // Generate RSS XML
    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteTitle}</title>
    <description>${siteDescription}</description>
    <link>${baseUrl}</link>
    <atom:link href="${baseUrl}/api/rss" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>Next.js</generator>
    ${posts.docs.map(post => {
      const postUrl = `${baseUrl}/blog/${post.slug}`
      const pubDate = new Date(post.publishedAt || post.createdAt).toUTCString()
      
      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${post.excerpt || post.title}]]></description>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      ${post.featuredImage && typeof post.featuredImage === 'object' ? 
        `<enclosure url="${post.featuredImage.url}" type="${post.featuredImage.mimeType}" length="${post.featuredImage.filesize}"/>` : 
        ''
      }
    </item>`
    }).join('')}
  </channel>
</rss>`

    const response = new NextResponse(rss, {
      headers: {
        'Content-Type': 'application/rss+xml',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    })

    return response

  } catch (error) {
    console.error('Error generating RSS feed:', error)
    return NextResponse.json(
      { error: 'Failed to generate RSS feed' },
      { status: 500 }
    )
  }
}