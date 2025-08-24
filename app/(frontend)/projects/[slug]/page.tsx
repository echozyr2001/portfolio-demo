import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProjectBySlug, getAllPublishedProjectSlugs } from '@/lib/payload-server'
import { ProjectDetail } from '@/components/projects/ProjectDetail'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { GrainEffect } from '@/components/GrainEffect'

interface ProjectPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params
  const projects = await getProjectBySlug(slug)

  if (projects.docs.length === 0) {
    return {
      title: 'Project Not Found',
    }
  }

  const project = projects.docs[0]
  
  return {
    title: `${project.title} | Projects`,
    description: project.shortDescription || `Learn more about ${project.title} project.`,
    openGraph: {
      title: project.title,
      description: project.shortDescription || `Learn more about ${project.title} project.`,
      type: 'website',
      images: project.featuredImage ? [
        {
          url: typeof project.featuredImage === 'object' ? project.featuredImage.url : '',
          alt: typeof project.featuredImage === 'object' ? project.featuredImage.alt : project.title,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.shortDescription || `Learn more about ${project.title} project.`,
      images: project.featuredImage && typeof project.featuredImage === 'object' ? [project.featuredImage.url] : [],
    },
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params
  const projects = await getProjectBySlug(slug)

  if (projects.docs.length === 0) {
    notFound()
  }

  const project = projects.docs[0]

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
        <ProjectDetail project={project} />
      </main>
      
      <Footer />
    </div>
  )
}

// Generate static params for all published projects
export async function generateStaticParams() {
  const projects = await getAllPublishedProjectSlugs()

  return projects.docs.map((project) => ({
    slug: project.slug,
  }))
}