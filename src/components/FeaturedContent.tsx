import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, BookOpen, Download, Users, Clock, FileText, ArrowRight, Play } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface FeaturedItem {
  _id: string;
  type: 'event' | 'article' | 'asset';
  title: string;
  subtitle: string;
  description: string;
  imageUrl?: string;
  gradient: string;
  ctaText: string;
  badge?: string;
  metadata?: {
    date?: string;
    time?: string;
    attendees?: number;
    readTime?: string;
    fileSize?: string;
    downloads?: number;
  };
}

const FeaturedContent: React.FC = () => {
  const navigate = useNavigate();

  // Fetch AI-curated featured content
  const { data: featuredContent = {}, isLoading } = useQuery({
    queryKey: ['featuredContent'],
    queryFn: async () => {
      const response = await fetch('/api/curation/featured');
      if (!response.ok) throw new Error('Failed to fetch featured content');
      const result = await response.json();
      return result.data || {};
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  });

  // Transform AI-curated content to match FeaturedItem interface
  const featuredItems: FeaturedItem[] = [];

  // Add featured news
  if (featuredContent.news) {
    featuredItems.push({
      _id: featuredContent.news._id,
      type: 'article' as const,
      title: featuredContent.news.title,
      subtitle: featuredContent.news.source,
      description: featuredContent.news.summary?.quickSummary || featuredContent.news.excerpt || '',
      imageUrl: featuredContent.news.imageUrl,
      gradient: 'from-emerald-600 to-green-600',
      ctaText: 'Read Article',
      badge: 'AI FEATURED',
      metadata: {
        readTime: '5 min read'
      }
    });
  }

  // Add featured events
  if (featuredContent.events) {
    featuredItems.push({
      _id: featuredContent.events._id,
      type: 'event' as const,
      title: featuredContent.events.title,
      subtitle: featuredContent.events.location?.address || 'Event',
      description: featuredContent.events.description,
      imageUrl: featuredContent.events.imageUrl,
      gradient: 'from-blue-600 to-cyan-600',
      ctaText: 'View Event',
      badge: 'AI FEATURED',
      metadata: {
        date: featuredContent.events.startDate ? new Date(featuredContent.events.startDate).toLocaleDateString() : '',
        attendees: featuredContent.events.engagement?.rsvpCount || 0
      }
    });
  }

  // Add featured resources
  if (featuredContent.resource) {
    featuredItems.push({
      _id: featuredContent.resource._id,
      type: 'asset' as const,
      title: featuredContent.resource.title,
      subtitle: featuredContent.resource.type || 'Learning Resource',
      description: featuredContent.resource.description,
      imageUrl: featuredContent.resource.thumbnailUrl,
      gradient: 'from-purple-600 to-pink-600',
      ctaText: featuredContent.resource.type === 'PDF' ? 'Download PDF' : 'View Resource',
      badge: 'AI FEATURED',
      metadata: {
        fileSize: featuredContent.resource.fileSize,
        downloads: featuredContent.resource.downloadCount || 0
      }
    });
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'event':
        return <Calendar className="w-5 h-5 text-white" />;
      case 'article':
        return <BookOpen className="w-5 h-5 text-white" />;
      case 'asset':
        return <Download className="w-5 h-5 text-white" />;
      default:
        return <FileText className="w-5 h-5 text-white" />;
    }
  };

  const handleItemClick = (item: FeaturedItem) => {
    switch (item.type) {
      case 'event':
        navigate(`/event/${item._id}`);
        break;
      case 'article':
        navigate(`/article/${item._id}`);
        break;
      case 'asset':
        navigate(`/resource/${item._id}`);
        break;
    }
  };

  const handleCtaClick = (e: React.MouseEvent, item: FeaturedItem) => {
    e.stopPropagation();
    handleItemClick(item);
  };

  return (
    <section>
      {/* Header */}
      <div className="mb-5 px-4">
        <div className="flex items-center space-x-2">
          <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full"></div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Featured</h2>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="px-4">
          <div className="w-72 h-96 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse"></div>
        </div>
      )}

      {/* No featured content state */}
      {!isLoading && featuredItems.length === 0 && (
        <div className="px-4">
          <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-2xl border border-emerald-300 dark:border-gray-700">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <p className="text-sm">No featured content available right now.</p>
            <p className="text-xs text-gray-400 mt-1">Check back later for featured articles and updates.</p>
          </div>
        </div>
      )}

      {/* Horizontal Scrolling Cards */}
      {!isLoading && featuredItems.length > 0 && (
        <div className="overflow-x-auto scrollbar-hide overscroll-contain">
          <div className="flex space-x-4 pb-4 pl-4 pr-4" style={{ width: 'max-content' }}>
            {featuredItems.map((item, index) => (
              <div
                key={item._id}
                className="w-72 flex-shrink-0 bg-white dark:bg-gray-800 border border-emerald-300 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer group animate-fade-up hover:scale-105"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => handleItemClick(item)}
              >
                {/* Header Section */}
                <div className={`h-32 relative overflow-hidden bg-gradient-to-r ${item.gradient}`}>
                  {/* Show cover image for all types if available */}
                  {item.imageUrl ? (
                    <>
                      <img 
                        src={item.imageUrl} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to gradient background if image fails to load
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} mix-blend-multiply`} />
                    </>
                  ) : (
                    // Fallback to gradient background if no image
                    <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient}`} />
                  )}
                  
                  {/* Badge */}
                  {item.badge && (
                    <div className={`absolute top-3 left-3 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg ${
                      item.type === 'article' 
                        ? 'bg-emerald-800/95 dark:bg-gray-900/90 border border-emerald-700/50 dark:border-gray-700/20'
                        : item.type === 'event'
                        ? 'bg-blue-800/95 dark:bg-gray-900/90 border border-blue-700/50 dark:border-gray-700/20'
                        : 'bg-purple-800/95 dark:bg-gray-900/90 border border-purple-700/50 dark:border-gray-700/20'
                    }`}>
                      <span className="text-white dark:text-white text-xs font-bold">{item.badge}</span>
                    </div>
                  )}
                  
                  {/* Icon */}
                  <div className={`absolute bottom-3 left-3 w-12 h-12 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg ${
                    item.type === 'article' 
                      ? 'bg-emerald-800/95 dark:bg-gray-900/90 border border-emerald-700/50 dark:border-gray-700/20'
                      : item.type === 'event'
                      ? 'bg-blue-800/95 dark:bg-gray-900/90 border border-blue-700/50 dark:border-gray-700/20'
                      : 'bg-purple-800/95 dark:bg-gray-900/90 border border-purple-700/50 dark:border-gray-700/20'
                  }`}>
                    {getIcon(item.type)}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Title and Subtitle */}
                  <div className="mb-3">
                    <h3 className="text-gray-900 dark:text-white font-bold text-base leading-tight mb-1 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm font-medium line-clamp-1">
                      {item.subtitle}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-gray-700 dark:text-gray-400 text-sm leading-relaxed mb-3">
                    {item.description}
                  </p>

                  {/* Metadata */}
                  <div className={`flex items-center flex-wrap gap-3 text-xs mb-4 ${
                    item.type === 'article' 
                      ? 'text-emerald-700 dark:text-gray-400'
                      : item.type === 'event'
                      ? 'text-blue-700 dark:text-gray-400'
                      : 'text-purple-700 dark:text-gray-400'
                  }`}>
                    {item.type === 'event' && item.metadata && (
                      <>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-blue-600" />
                          <span>{item.metadata.date}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-blue-600" />
                          <span>{item.metadata.time}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-3 h-3 text-blue-600" />
                          <span>{item.metadata.attendees} attending</span>
                        </div>
                      </>
                    )}
                    {item.type === 'article' && item.metadata && (
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-emerald-600" />
                        <span>{item.metadata.readTime}</span>
                      </div>
                    )}
                    {item.type === 'asset' && item.metadata && (
                      <>
                        <div className="flex items-center space-x-1">
                          <FileText className="w-3 h-3 text-purple-600" />
                          <span>{item.metadata.fileSize}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Download className="w-3 h-3 text-purple-600" />
                          <span>{item.metadata.downloads} downloads</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={(e) => handleCtaClick(e, item)}
                    className={`w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg transition-colors font-medium ${
                      item.type === 'article' 
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                        : item.type === 'event'
                        ? 'bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                        : 'bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                    }`}
                  >
                    <span className="font-medium">{item.ctaText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default FeaturedContent; 