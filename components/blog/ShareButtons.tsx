'use client';

import { Button } from '@/components/ui/button';
import { Share2, Twitter, Facebook, Linkedin } from 'lucide-react';

export function ShareButtons({ title }: { title: string }) {
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = title;

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareTitle
    )}&url=${encodeURIComponent(shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      shareUrl
    )}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      shareUrl
    )}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      // You could add a toast notification here to inform the user
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
      <div>
        <h3 className="text-lg font-semibold text-[#2C2A25] mb-2">
          Share this post
        </h3>
        <p className="text-gray-600 text-sm">
          Found this helpful? Share it with others!
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={copyToClipboard}
          className="rounded-full"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Copy Link
        </Button>

        <Button variant="outline" size="sm" asChild className="rounded-full">
          <a
            href={shareLinks.twitter}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Twitter className="h-4 w-4 mr-2" />
            Twitter
          </a>
        </Button>

        <Button variant="outline" size="sm" asChild className="rounded-full">
          <a
            href={shareLinks.facebook}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Facebook className="h-4 w-4 mr-2" />
            Facebook
          </a>
        </Button>

        <Button variant="outline" size="sm" asChild className="rounded-full">
          <a
            href={shareLinks.linkedin}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Linkedin className="h-4 w-4 mr-2" />
            LinkedIn
          </a>
        </Button>
      </div>
    </div>
  );
}
