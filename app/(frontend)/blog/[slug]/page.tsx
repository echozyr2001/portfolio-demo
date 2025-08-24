import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPostBySlug, getAllPublishedPostSlugs } from '@/lib/payload-server'
import { BlogPost } from '@/components/blog/BlogPost'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { GrainEffect } from '@/components/GrainEffect'

interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const posts = await getPostBySlug(slug)

  if (posts.docs.length === 0) {
    return {
      title: 'Post Not Found',
    }
  }

  const post = posts.docs[0]
  
  return {
    title: post.seo?.title || post.title,
    description: post.seo?.description || post.excerpt || `Read "${post.title}" on my blog.`,
    openGraph: {
      title: post.seo?.title || post.title,
      description: post.seo?.description || post.excerpt || `Read "${post.title}" on my blog.`,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: ['Portfolio Owner'],
      images: post.featuredImage ? [
        {
          url: typeof post.featuredImage === 'object' ? post.featuredImage.url : '',
          alt: typeof post.featuredImage === 'object' ? post.featuredImage.alt : post.title,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seo?.title || post.title,
      description: post.seo?.description || post.excerpt || `Read "${post.title}" on my blog.`,
      images: post.featuredImage && typeof post.featuredImage === 'object' ? [post.featuredImage.url] : [],
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const posts = await getPostBySlug(slug)

  if (posts.docs.length === 0) {
    notFound()
  }

  const post = posts.docs[0]

  return (
    <div className="min-h-screen bg-[#D9D5D2] flex flex-col">
      <GrainEffect
        opacity={0.7}
        blendMode="difference"
        zIndex={60}
        grainIntensity={0.1}
      />
      
      <Header />
      
      <main className="flex-1 bg-[#F6F4F1]">
        <BlogPost post={post} />
      </main>
      
      <Footer />
    </div>
  )
}

// Generate static params for all published posts
export async function generateStaticParams() {
  const posts = await getAllPublishedPostSlugs()

  return posts.docs.map((post) => ({
    slug: post.slug,
  }))
}