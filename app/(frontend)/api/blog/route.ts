import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || 'published'
    
    const posts = await payload.find({
      collection: 'posts' as any,
      where: {
        status: {
          equals: status,
        },
      },
      sort: '-publishedAt',
      page,
      limit,
    })

    const response = NextResponse.json({
      docs: posts.docs,
      totalDocs: posts.totalDocs,
      totalPages: posts.totalPages,
      page: posts.page,
      hasNextPage: posts.hasNextPage,
      hasPrevPage: posts.hasPrevPage,
    })

    // Add caching headers
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    
    return response
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    )
  }
}