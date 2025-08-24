import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { searchParams } = new URL(request.url)
    
    const limit = parseInt(searchParams.get('limit') || '6')
    
    const projects = await payload.find({
      collection: 'projects' as any,
      where: {
        status: {
          equals: 'published',
        },
        featured: {
          equals: true,
        },
      },
      sort: 'order', // Featured projects sorted by order
      limit,
    })

    const response = NextResponse.json({
      docs: projects.docs,
      totalDocs: projects.totalDocs,
    })

    // Add caching headers for featured projects
    response.headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200')
    
    return response
  } catch (error) {
    console.error('Error fetching featured projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch featured projects' },
      { status: 500 }
    )
  }
}