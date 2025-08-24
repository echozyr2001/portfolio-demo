'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Calendar, Clock } from 'lucide-react'
import { BlogPost } from '@/app/(frontend)/types'

interface BlogListProps {
  initialPosts: BlogPost[]
}

// Utility functions moved outside component scope
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const calculateReadingTime = (content: string) => {
  const wordsPerMinute = 200
  const words = content.split(/\s+/).length
  const minutes = Math.ceil(words / wordsPerMinute)
  return `${minutes} min read`
}

export function BlogList({ initialPosts }: BlogListProps) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialPosts.length >= 12)
  const [page, setPage] = useState(1)

  const loadMorePosts = async () => {
    if (loading || !hasMore) return

    setLoading(true)
    try {
      const response = await fetch(`/api/blog?page=${page + 1}&limit=12`)
      const data = await response.json()
      
      if (data.docs && data.docs.length > 0) {
        setPosts(prev => [...prev, ...data.docs])
        setPage(prev => prev + 1)
        setHasMore(data.hasNextPage)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Error loading more posts:', error)
    } finally {
      setLoading(false)
    }
  }



  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold text-[#2C2A25] mb-4">
          No blog posts yet
        </h2>
        <p className="text-gray-600">
          Check back soon for new content!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Featured Post (First Post) */}
      {posts.length > 0 && (
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-[#2C2A25] mb-6">Featured Post</h2>
          <FeaturedPostCard post={posts[0]} />
        </div>
      )}

      {/* Regular Posts Grid */}
      {posts.length > 1 && (
        <>
          <h2 className="text-2xl font-semibold text-[#2C2A25] mb-6">All Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.slice(1).map((post) => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>
        </>
      )}

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center mt-12">
          <Button
            onClick={loadMorePosts}
            disabled={loading}
            className="rounded-full bg-[#A2ABB1] text-white px-8 h-12 hover:bg-[#8A9AA3] transition-colors duration-300"
          >
            {loading ? 'Loading...' : 'Load More Posts'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  )
}

function FeaturedPostCard({ post }: { post: BlogPost }) {
  return (
    <Card className="overflow-hidden bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="md:flex">
        {post.featuredImage && (
          <div className="md:w-1/2 relative aspect-video md:aspect-auto">
            <Image
              src={post.featuredImage.url}
              alt={post.featuredImage.alt}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className={`${post.featuredImage ? 'md:w-1/2' : 'w-full'} p-8`}>
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(post.publishedAt)}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {calculateReadingTime(post.content)}
            </div>
          </div>
          
          <h3 className="text-2xl font-bold text-[#2C2A25] mb-4 hover:text-[#A2ABB1] transition-colors">
            <Link href={`/blog/${post.slug}`}>
              {post.title}
            </Link>
          </h3>
          
          {post.excerpt && (
            <p className="text-gray-600 mb-6 line-clamp-3">
              {post.excerpt}
            </p>
          )}
          
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.slice(0, 3).map((tagObj, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tagObj.tag}
                </Badge>
              ))}
            </div>
          )}
          
          <Link href={`/blog/${post.slug}`}>
            <Button
              variant="outline"
              className="rounded-full border-[#A2ABB1] text-[#A2ABB1] hover:bg-[#A2ABB1] hover:text-white"
            >
              Read More
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}

function BlogPostCard({ post }: { post: BlogPost }) {
  return (
    <Card className="overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow duration-300 group">
      {post.featuredImage && (
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={post.featuredImage.url}
            alt={post.featuredImage.alt}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(post.publishedAt)}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {calculateReadingTime(post.content)}
          </div>
        </div>
        
        <h3 className="text-xl font-semibold text-[#2C2A25] group-hover:text-[#A2ABB1] transition-colors line-clamp-2">
          <Link href={`/blog/${post.slug}`}>
            {post.title}
          </Link>
        </h3>
      </CardHeader>
      
      <CardContent className="pt-0">
        {post.excerpt && (
          <p className="text-gray-600 mb-4 line-clamp-3 text-sm">
            {post.excerpt}
          </p>
        )}
        
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {post.tags.slice(0, 2).map((tagObj, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tagObj.tag}
              </Badge>
            ))}
            {post.tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{post.tags.length - 2}
              </Badge>
            )}
          </div>
        )}
        
        <Link href={`/blog/${post.slug}`}>
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-auto text-[#A2ABB1] hover:text-[#8A9AA3] font-medium"
          >
            Read More
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}