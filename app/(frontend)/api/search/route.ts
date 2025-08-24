import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { searchParams } = new URL(request.url)
    
    const query = searchParams.get('q')
    const type = searchParams.get('type') // 'posts', 'projects', or 'all'
    const limit = parseInt(searchParams.get('limit') || '10')
    
    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        results: [],
        message: 'Query must be at least 2 characters long'
      })
    }

    const results: any = {
      posts: [],
      projects: [],
      total: 0
    }

    // Search in blog posts
    if (type === 'posts' || type === 'all' || !type) {
      const posts = await payload.find({
        collection: 'posts' as any,
        where: {
          and: [
            {
              status: {
                equals: 'published',
              },
            },
            {
              or: [
                {
                  title: {
                    contains: query,
                  },
                },
                {
                  content: {
                    contains: query,
                  },
                },
                {
                  excerpt: {
                    contains: query,
                  },
                },
              ],
            },
          ],
        },
        limit: type === 'posts' ? limit : Math.ceil(limit / 2),
        sort: '-publishedAt',
      })

      results.posts = posts.docs.map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        type: 'post',
        url: `/blog/${post.slug}`,
        publishedAt: post.publishedAt,
        featuredImage: post.featuredImage,
      }))
    }

    // Search in projects
    if (type === 'projects' || type === 'all' || !type) {
      const projects = await payload.find({
        collection: 'projects' as any,
        where: {
          and: [
            {
              status: {
                equals: 'published',
              },
            },
            {
              or: [
                {
                  title: {
                    contains: query,
                  },
                },
                {
                  description: {
                    contains: query,
                  },
                },
                {
                  shortDescription: {
                    contains: query,
                  },
                },
              ],
            },
          ],
        },
        limit: type === 'projects' ? limit : Math.ceil(limit / 2),
        sort: 'order',
      })

      results.projects = projects.docs.map(project => ({
        id: project.id,
        title: project.title,
        slug: project.slug,
        shortDescription: project.shortDescription,
        type: 'project',
        url: `/projects/${project.slug}`,
        featuredImage: project.featuredImage,
        technologies: project.technologies,
      }))
    }

    results.total = results.posts.length + results.projects.length

    const response = NextResponse.json(results)
    
    // Add caching headers for search results
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')
    
    return response

  } catch (error) {
    console.error('Error searching:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}