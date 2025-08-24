import { getFeaturedProjects } from '@/lib/payload-server'
import { HomeClient } from '@/components/HomeClient'

export default async function Home() {
	// Fetch featured projects for the homepage
	const featuredProjects = await getFeaturedProjects(6)
	return <HomeClient featuredProjects={featuredProjects.docs} />
}
