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
    const featured = searchParams.get('featured')
    
    const whereClause: any = {
      status: {
        equals: status,
      },
    }
    
    // If featured filter is specified
    if (featured === 'true') {
      whereClause.featured = {
        equals: true,
      }
    }

    const projects = await payload.find({
      collection: 'projects' as any,
      where: whereClause,
      sort: featured === 'true' ? '-order' : 'order', // Featured projects sorted by order desc, others by order asc
      page,
      limit,
    })

    const response = NextResponse.json({
      docs: projects.docs,
      totalDocs: projects.totalDocs,
      totalPages: projects.totalPages,
      page: projects.page,
      hasNextPage: projects.hasNextPage,
      hasPrevPage: projects.hasPrevPage,
    })

    // Add caching headers
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    
    return response
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}