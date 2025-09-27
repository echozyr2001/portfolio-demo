'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ExternalLink, Github, Star } from 'lucide-react';
import type { ProjectData } from '@/lib/projects';

interface ProjectsListProps {
  allProjects: ProjectData[];
}

export function ProjectsList({ allProjects }: ProjectsListProps) {
  const [filter, setFilter] = useState<'all' | 'featured'>('all');

  const filteredProjects = useMemo(() => {
    if (filter === 'featured') {
      return allProjects.filter((p) => p.featured);
    }
    return allProjects;
  }, [allProjects, filter]);

  if (allProjects.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold text-[#2C2A25] mb-4">
          No projects yet
        </h2>
        <p className="text-gray-600">Check back soon for new projects!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Filter Buttons */}
      <div className="flex gap-4 mb-8">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          className={
            filter === 'all'
              ? 'bg-[#A2ABB1] text-white hover:bg-[#8A9AA3]'
              : 'border-[#A2ABB1] text-[#A2ABB1] hover:bg-[#A2ABB1] hover:text-white'
          }
        >
          All Projects
        </Button>
        <Button
          variant={filter === 'featured' ? 'default' : 'outline'}
          onClick={() => setFilter('featured')}
          className={
            filter === 'featured'
              ? 'bg-[#A2ABB1] text-white hover:bg-[#8A9AA3]'
              : 'border-[#A2ABB1] text-[#A2ABB1] hover:bg-[#A2ABB1] hover:text-white'
          }
        >
          <Star className="h-4 w-4 mr-2" />
          Featured
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProjects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: ProjectData }) {
  return (
    <Card className="overflow-hidden bg-white shadow-md hover:shadow-lg transition-all duration-300 group">
      {/* Project Image */}
      {project.featuredImage && (
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={project.featuredImage}
            alt={project.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {project.featured && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-yellow-500 text-yellow-900 border-yellow-600">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            </div>
          )}
        </div>
      )}

      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold text-[#2C2A25] group-hover:text-[#A2ABB1] transition-colors line-clamp-2">
          <Link href={`/projects/${project.slug}`}>{project.title}</Link>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Short Description */}
        <p className="text-gray-600 text-sm line-clamp-3">
          {project.shortDescription}
        </p>

        {/* Technologies */}
        {project.technologies && project.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {project.technologies.slice(0, 3).map((tech, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tech}
              </Badge>
            ))}
            {project.technologies.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{project.technologies.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <Link href={`/projects/${project.slug}`}>
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-auto text-[#A2ABB1] hover:text-[#8A9AA3] font-medium"
            >
              View Details
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>

          <div className="flex gap-2">
            {project.projectUrl && (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="p-2 h-auto text-gray-500 hover:text-[#A2ABB1]"
              >
                <a
                  href={project.projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View Live Project"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}

            {project.githubUrl && (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="p-2 h-auto text-gray-500 hover:text-[#A2ABB1]"
              >
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View Source Code"
                >
                  <Github className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}