import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GrainEffect } from "@/components/GrainEffect";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowLeft } from "lucide-react";
import { getAllWeeklySlugs, getWeeklyBySlug } from "@/lib/weeklies";
import { mdxComponents } from "@/lib/mdx-components";

interface WeeklyPageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: WeeklyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const weekly = await getWeeklyBySlug(slug);

  if (!weekly) {
    return {
      title: "Weekly Report Not Found",
    };
  }

  return {
    title: `${weekly.frontmatter.title} | Weeklies`,
    description: weekly.frontmatter.excerpt,
  };
}

export async function generateStaticParams() {
  const slugs = getAllWeeklySlugs();
  return slugs.map((slug) => ({ slug }));
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default async function WeeklyPage({ params }: WeeklyPageProps) {
  const { slug } = await params;
  const weekly = await getWeeklyBySlug(slug);

  if (!weekly) {
    notFound();
  }

  const { frontmatter, content } = weekly;

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
        <article className="max-w-4xl mx-auto px-4 md:px-8 py-16">
          <div className="mb-8">
            <Link href="/weeklies">
              <Button
                variant="ghost"
                className="text-[#A2ABB1] hover:text-[#8A9AA3]"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Weeklies
              </Button>
            </Link>
          </div>

          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-[#2C2A25] mb-6 leading-tight">
              {frontmatter.title}
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(frontmatter.date)}</span>
            </div>
          </header>

          <div className="prose prose-lg max-w-none mb-12 text-gray-800 prose-headings:text-gray-900 prose-a:text-blue-600 prose-strong:text-gray-900">
            <MDXRemote source={content} components={mdxComponents} />
          </div>

          <Separator className="my-12" />

          <div className="text-center">
            <Link href="/weeklies">
              <Button
                variant="default"
                className="rounded-full bg-[#A2ABB1] text-white px-8 h-12 hover:bg-[#8A9AA3] transition-colors duration-300"
              >
                View All Weeklies
              </Button>
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
