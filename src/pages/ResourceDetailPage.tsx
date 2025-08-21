import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Download, ExternalLink, Eye, Heart, MessageCircle, Share2, Clock, Tag, User } from 'lucide-react';
import InteractionButtons from '../components/InteractionButtons';

const ResourceDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);

  // Fetch resource data from API
  const { data: resource, isLoading, error } = useQuery({
    queryKey: ['resource', id],
    queryFn: async () => {
      const response = await fetch(`/api/resources/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch resource');
      }
      const data = await response.json();
      const resource = data.resource || data;
      
      // DEBUG: Log resource engagement data
      console.log('📚 ResourceDetailPage API Response:', {
        title: resource.title?.substring(0, 30) + '...',
        likes: resource.likes,
        saves: resource.saves,
        shares: resource.shares,
        views: resource.views
      });
      
      return resource;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3
  });

  // Initialize likes when resource loads
  React.useEffect(() => {
    if (resource?.likes) {
      setLikes(resource.likes);
    }
  }, [resource]);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
    // TODO: Call API to update likes
  };

  const handleDownload = () => {
    if (resource?.fileUrl) {
      window.open(resource.fileUrl, '_blank');
      // TODO: Call API to track download
    }
  };

  const handleView = () => {
    if (resource?.fileUrl) {
      window.open(resource.fileUrl, '_blank');
      // TODO: Call API to track view
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'Document':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'Video':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293L12 11l.707-.707A1 1 0 0113.414 10H15M6 6h12M6 18h12" />
          </svg>
        );
      case 'Tutorial':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'Tool':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Resource Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The resource you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/resources')}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Back to Resources
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 z-10">
        <div className="px-4 py-4">
          <button
            onClick={() => navigate('/resources')}
            className="flex items-center text-emerald-600 dark:text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Resources
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {/* Resource Header */}
        <div className="mb-8">
          {/* Resource Type & Category */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
              <span className="text-emerald-600 dark:text-emerald-400">
                {getResourceIcon(resource.type)}
              </span>
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                {resource.type}
              </span>
            </div>
            
            <div className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {resource.category}
              </span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {resource.title}
          </h1>

          {/* Description */}
          <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-6">
            {resource.description}
          </p>

          {/* Meta Information */}
          <div className="space-y-3 mb-6">
            {/* Dynamic Views/Downloads based on resource type */}
            {(resource.type === 'Document' || resource.type === 'Tool') ? (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Download className="w-4 h-4" />
                <span className="text-sm">{resource.downloadCount || 0} downloads</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Eye className="w-4 h-4" />
                <span className="text-sm">{resource.views || 0} views</span>
              </div>
            )}
            
            {resource.fileSize && resource.type !== 'Video' && resource.type !== 'Tutorial' && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{resource.fileSize}</span>
              </div>
            )}

            {/* Engagement Section - Moved up */}
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
              <InteractionButtons
                contentType="Resource"
                contentId={resource._id}
                engagement={{
                  likes: resource.likes || 0,
                  saves: resource.saves || 0,
                  shares: resource.shares || 0
                }}
                onCommentClick={() => navigate(`/comments/resource/${resource._id}`)}
                shareTitle={resource.title}
                shareType="resource"
                layout="horizontal"
                size="md"
                showSave={true}
                showBorder={false}
                noBg={true}
              />
            </div>

            {resource.uploadedBy && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <User className="w-4 h-4" />
                <span className="text-sm">
                  {resource.uploadedBy.name || 'AI Club Admin'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {resource.tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-8">
          <div className="flex gap-4">
            {resource.type === 'Document' ? (
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-600 dark:hover:border-emerald-400 rounded-xl transition-all duration-200 font-medium text-sm"
              >
                <Download className="w-5 h-5" />
                Download PDF
              </button>
            ) : (
              <button
                onClick={handleView}
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-600 dark:hover:border-emerald-400 rounded-xl transition-all duration-200 font-medium text-sm"
              >
                <ExternalLink className="w-5 h-5" />
                {resource.type === 'Video' ? 'Watch Video' : 'View Resource'}
              </button>
            )}
          </div>
        </div>

        {/* Related Resources */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Related Resources
          </h3>
          <div className="text-gray-600 dark:text-gray-400">
            <p>Related resources will be shown here based on tags and category.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceDetailPage;
