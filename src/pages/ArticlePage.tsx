import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Eye } from 'lucide-react';
import CommentDialog from '../components/CommentDialog';
import ArticleContent from '../components/ArticleContent';
import ChatBubble from '../components/chat/ChatBubble';
import InteractionButtons from '../components/InteractionButtons';

const ArticlePage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showComments, setShowComments] = useState(false);

  // Dynamic publisher logo system - relies on database-first approach
  // No hardcoded mapping needed - logos are fetched dynamically during curation

  // Fetch article data from API
  const { data: article, isLoading, error } = useQuery({
    queryKey: ['article', id],
    queryFn: async () => {
      const response = await fetch(`/api/news/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch article');
      }
      const articleData = await response.json();
      
      // DEBUG: Log article engagement data
      console.log('📰 ArticlePage API Response:', {
        title: articleData.title?.substring(0, 30) + '...',
        engagement: articleData.engagement
      });
      
      return articleData;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3
  });



  // Format timestamp for display
  const formatTimestamp = (timestamp: string | Date) => {
    if (!timestamp) return 'Recently';
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Just now';
    if (diffInHours === 1) return '1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };



  // Remove the hardcoded sample comments and use API data instead
  const { data: commentsData, isLoading: commentsLoading } = useQuery({
    queryKey: ['comments', 'article', id],
    queryFn: async () => {
      if (!id) return { comments: [] };
      const response = await fetch(`/api/comments/article/${id}`);
      if (!response.ok) return { comments: [] };
      return response.json();
    },
    enabled: !!id
  });

  const comments = commentsData?.comments || [];

  // Loading state
  if (isLoading) {
    return (
      <div className="px-4 py-6 bg-white dark:bg-gray-900 min-h-screen">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !article) {
    return (
      <div className="px-4 py-6 bg-white dark:bg-gray-900 min-h-screen">
        <div className="text-center py-12">
          <div className="text-red-500 dark:text-red-400 mb-4">
            <h3 className="text-lg font-semibold mb-2">Article not found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The article you're looking for doesn't exist or has been removed.
            </p>
          </div>
          <button
            onClick={() => navigate('/news')}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Back to News
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 bg-white dark:bg-gray-900 min-h-screen">

      {/* Article Image */}
      {article.imageUrl && (
        <div className="relative h-48 overflow-hidden rounded-xl mb-6">
          <img 
            src={article.imageUrl} 
            alt={article.title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          {article.isTrending && (
            <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              🔥 Trending
            </div>
          )}
        </div>
      )}

      {/* Article Content */}
      <div className="space-y-4">
        {/* Categories */}
        {article.categories && (
          <div className="flex flex-wrap gap-2">
            {article.categories.map((tag: string, index: number) => (
              <span 
                key={index}
                className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-xs font-medium px-3 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
          {article.title}
        </h1>
        
        {/* Article Info Container */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center min-w-0 gap-x-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center overflow-hidden bg-gray-200 dark:bg-gray-700">
                <img 
                  src={article.publisherLogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(article.source || 'T')}&background=10b981&color=fff&size=32`}
                  alt={article.source}
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(article.source || 'T')}&background=10b981&color=fff&size=32`;
                    target.src = fallbackUrl;
                  }}
                />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-gray-900 dark:text-white text-sm truncate max-w-[160px] sm:max-w-xs">{article.source}</div>
                {article.originalAuthor && article.originalAuthor !== article.source && article.originalAuthor !== 'Tech News Bot' && (
                  <div className="text-gray-500 dark:text-gray-400 text-xs truncate max-w-[160px] sm:max-w-xs">by {article.originalAuthor}</div>
                )}
              </div>
            </div>
            <div className="text-gray-500 dark:text-gray-400 text-sm font-medium whitespace-nowrap ml-auto pl-2 mt-2 sm:mt-0">
              {formatTimestamp(article.publishedAt)}
            </div>
          </div>
          
          {/* Engagement Section - Right after publisher section */}
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg">
            <InteractionButtons
              contentType="News"
              contentId={id || ''}
              engagement={article.engagement}
              onCommentClick={() => setShowComments(true)}
              shareTitle={article.title}
              shareType="news"
              layout="horizontal"
              size="md"
              showSave={true}
              showBorder={false}
              noBg={true}
            />
          </div>

        </div>

                 {/* Article Content */}
         <ArticleContent 
           content={article.content}
           summary={article.summary}
           originalUrl={article.originalUrl}
         />
      </div>

      <CommentDialog
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        title={article.title}
        contentType="news"
        comments={comments}
      />

      <ChatBubble 
        articleId={id || '683fa28628b70ed750ba90c0'} 
        articleTitle={article?.title || 'Article Discussion'} 
      />
    </div>
  );
};

export default ArticlePage;
