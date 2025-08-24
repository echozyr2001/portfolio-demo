import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')
    const path = searchParams.get('path')
    const tag = searchParams.get('tag')
    
    // Check for secret to confirm this is a valid request
    if (secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json(
        { error: 'Invalid secret' },
        { status: 401 }
      )
    }

    if (path) {
      // Revalidate specific path
      revalidatePath(path)
      return NextResponse.json({ 
        revalidated: true, 
        path,
        now: Date.now() 
      })
    }

    if (tag) {
      // Revalidate by tag
      revalidateTag(tag)
      return NextResponse.json({ 
        revalidated: true, 
        tag,
        now: Date.now() 
      })
    }

    // Revalidate common paths if no specific path/tag provided
    const commonPaths = [
      '/',
      '/blog',
      '/projects'
    ]

    commonPaths.forEach(path => {
      revalidatePath(path)
    })

    return NextResponse.json({ 
      revalidated: true, 
      paths: commonPaths,
      now: Date.now() 
    })

  } catch (error) {
    console.error('Error revalidating:', error)
    return NextResponse.json(
      { error: 'Error revalidating' },
      { status: 500 }
    )
  }
}