'use client';

import { useState, useMemo } from 'react';
import type { IdeaData } from '@/lib/ideas';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


interface IdeasClientPageProps {
    ideas: IdeaData[];
    categories: string[];
    statuses: string[];
}

export function IdeasClientPage({ ideas, categories, statuses }: IdeasClientPageProps) {
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All Statuses');

  const filteredIdeas = useMemo(() => {
    return ideas.filter(idea => {
        const categoryMatch = categoryFilter === 'All Categories' || idea.category === categoryFilter;
        const statusMatch = statusFilter === 'All Statuses' || idea.status === statusFilter;
        return categoryMatch && statusMatch;
    });
  }, [ideas, categoryFilter, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New':
        return 'bg-blue-100 text-blue-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
                {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
            </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
                {statuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
            </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredIdeas.length > 0 ? (
          filteredIdeas.map((idea) => (
            <Card key={idea.slug} className="bg-white shadow-md flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="text-xl font-bold text-[#2C2A25] pr-4">
                        {idea.title}
                    </CardTitle>
                    <Badge className={`flex-shrink-0 ${getStatusColor(idea.status)}`}>
                        {idea.status}
                    </Badge>
                </div>
                <CardDescription className="text-sm text-gray-500 pt-1">
                  {idea.category}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-base text-gray-700">
                  {idea.description}
                </p>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-16">
            <h2 className="text-2xl font-semibold text-[#2C2A25] mb-4">
              No ideas match the current filters.
            </h2>
          </div>
        )}
      </div>
    </>
  );
}
