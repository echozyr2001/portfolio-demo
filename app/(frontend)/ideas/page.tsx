import { Metadata } from 'next';
import { getSortedIdeasData, getAllIdeaCategories, getAllIdeaStatuses } from '@/lib/ideas';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { GrainEffect } from '@/components/GrainEffect';
import { IdeasClientPage } from './IdeasClientPage';

export const metadata: Metadata = {
  title: 'Ideas | Portfolio',
  description: 'A collection of my ideas and concepts, waiting to be explored.',
};

export default function IdeasPage() {
    const ideas = getSortedIdeasData();
    const categories = getAllIdeaCategories();
    const statuses = getAllIdeaStatuses();

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
                <div className="max-w-6xl mx-auto px-4 md:px-8 py-16">
                    <div className="mb-16">
                        <h1 className="text-6xl md:text-8xl font-bold text-[#2C2A25] mb-4">
                            Ideas
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl">
                            A collection of my ideas and concepts, waiting to be explored.
                        </p>
                    </div>
                    <IdeasClientPage ideas={ideas} categories={categories} statuses={statuses} />
                </div>
            </main>
            <Footer />
        </div>
    );
}
