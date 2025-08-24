import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payload = await getPayload({ config })
    const { id } = params
    
    // Check if preview mode is enabled
    const { searchParams } = new URL(request.url)
    const previewToken = searchParams.get('token')
    
    // Basic preview token validation (you should implement proper authentication)
    const expectedToken = process.env.PREVIEW_TOKEN || 'preview-secret'
    if (previewToken !== expectedToken) {
      return NextResponse.json(
        { error: 'Invalid preview token' },
        { status: 401 }
      )
    }
    
    const project = await payload.findByID({
      collection: 'projects' as any,
      id,
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    const response = NextResponse.json(project)
    
    // No caching for preview content
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    
    return response
  } catch (error) {
    console.error('Error fetching preview project:', error)
    return NextResponse.json(
      { error: 'Failed to fetch preview project' },
      { status: 500 }
    )
  }
}