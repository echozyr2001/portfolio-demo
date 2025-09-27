import { getFeaturedProjects } from '@/lib/projects'
import { HomeClient } from '@/components/HomeClient'

export default function Home() {
	// Fetch featured projects for the homepage
	const featuredProjects = getFeaturedProjects()
	return <HomeClient featuredProjects={featuredProjects} />
}
