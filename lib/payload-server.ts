import 'server-only'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function getPayloadClient() {
  return await getPayload({ config })
}

export async function getFeaturedProjects(limit = 6) {
  const payload = await getPayloadClient()
  
  return await payload.find({
    collection: 'projects' as any,
    where: {
      status: {
        equals: 'published',
      },
      featured: {
        equals: true,
      },
    },
    sort: 'order',
    limit,
  })
}

export async function getPublishedPosts(limit = 12) {
  const payload = await getPayloadClient()
  
  return await payload.find({
    collection: 'posts' as any,
    where: {
      status: {
        equals: 'published',
      },
    },
    sort: '-publishedAt',
    limit,
  })
}

export async function getPublishedProjects(limit = 20) {
  const payload = await getPayloadClient()
  
  return await payload.find({
    collection: 'projects' as any,
    where: {
      status: {
        equals: 'published',
      },
    },
    sort: 'order',
    limit,
  })
}

export async function getPostBySlug(slug: string) {
  const payload = await getPayloadClient()
  
  return await payload.find({
    collection: 'posts' as any,
    where: {
      slug: {
        equals: slug,
      },
      status: {
        equals: 'published',
      },
    },
    limit: 1,
  })
}

export async function getProjectBySlug(slug: string) {
  const payload = await getPayloadClient()
  
  return await payload.find({
    collection: 'projects' as any,
    where: {
      slug: {
        equals: slug,
      },
      status: {
        equals: 'published',
      },
    },
    limit: 1,
  })
}

export async function getAllPublishedPostSlugs() {
  const payload = await getPayloadClient()
  
  return await payload.find({
    collection: 'posts' as any,
    where: {
      status: {
        equals: 'published',
      },
    },
    limit: 1000,
  })
}

export async function getAllPublishedProjectSlugs() {
  const payload = await getPayloadClient()
  
  return await payload.find({
    collection: 'projects' as any,
    where: {
      status: {
        equals: 'published',
      },
    },
    limit: 1000,
  })
}