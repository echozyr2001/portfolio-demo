import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Github } from 'lucide-react'

export interface ProjectCardProps {
  title: string
  description: string
  image?: string
  technologies: string[]
  projectUrl?: string
  githubUrl?: string
  className?: string
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  title,
  description,
  image,
  technologies,
  projectUrl,
  githubUrl,
  className = ''
}) => {
  return (
    <Card className={`my-6 overflow-hidden ${className}`}>
      {image && (
        <div className="relative aspect-video">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}
      
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <div className="flex items-center gap-2">
            {githubUrl && (
              <Button variant="ghost" size="icon" asChild>
                <Link href={githubUrl} target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4" />
                  <span className="sr-only">View on GitHub</span>
                </Link>
              </Button>
            )}
            {projectUrl && (
              <Button variant="ghost" size="icon" asChild>
                <Link href={projectUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  <span className="sr-only">View project</span>
                </Link>
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">{description}</p>
        
        <div className="flex flex-wrap gap-2">
          {technologies.map((tech) => (
            <Badge key={tech} variant="secondary">
              {tech}
            </Badge>
          ))}
        </div>
        
        <div className="flex gap-2">
          {projectUrl && (
            <Button asChild>
              <Link href={projectUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Project
              </Link>
            </Button>
          )}
          {githubUrl && (
            <Button variant="outline" asChild>
              <Link href={githubUrl} target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4 mr-2" />
                View Code
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default ProjectCard