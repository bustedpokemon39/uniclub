import React, { useState } from 'react';
import CommentDialog from '../CommentDialog';
import InteractionButtons from '../InteractionButtons';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { TrendingUp, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SocialCardProps {
  id: string;
  userName: string;
  userAvatar: string | null;
  timestamp: string;
  content: string;
  imageUrl?: string;
  hashtags?: string[];
  group?: {
    _id: string;
    name: string;
    slug: string;
  };
  trending?: boolean;
  isCompact?: boolean;
  // Engagement data will be fetched by useEngagement hook in InteractionButtons
}

const SocialCard: React.FC<SocialCardProps> = ({ 
  id, 
  userName, 
  userAvatar, 
  timestamp, 
  content, 
  imageUrl, 
  hashtags = [],
  group,
  trending = false,
  isCompact = false 
}) => {
  const navigate = useNavigate();
  // State now managed by InteractionButtons component via useEngagement hook

  // DEBUG: Log social card data
  console.log('📱 SocialCard DEBUG:', {
    id,
    userName,
    trending,
    isCompact
  });

  const formatTimeAgo = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'some time ago';
    }
  };

  const handleCommentsClick = () => {
    navigate(`/comments/social/${id}`);
  };

  // Interaction handlers now managed by InteractionButtons component

  const renderHashtags = (text: string) => {
    const parts = text.split(/(#\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('#')) {
        return (
          <span 
            key={index} 
            className="text-emerald-600 dark:text-emerald-400 font-medium cursor-pointer hover:underline"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
                         <Card className="hover:shadow-lg transition-all duration-300 bg-white dark:bg-[#020B1A] border border-slate-300 dark:border-[#0F172A]">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              {userAvatar ? (
                <img 
                  src={userAvatar} 
                  alt={userName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg font-bold text-gray-500 dark:text-gray-300">
                  {userName?.charAt(0) || '?'}
                </span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">{userName}</h3>
                {trending && (
                  <Badge variant="secondary" className="text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Trending
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <span>{formatTimeAgo(timestamp)}</span>
                {group && (
                  <>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>{group.name}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </Button>
        </div>
        
        {/* Content */}
        <div className={`text-gray-900 dark:text-white leading-relaxed mb-4 ${
          isCompact ? 'text-sm line-clamp-3' : 'text-sm'
        }`}>
          {renderHashtags(content)}
        </div>
        
        {/* Media */}
        {imageUrl && (
          <div className="rounded-xl overflow-hidden mb-4">
            <img 
              src={imageUrl} 
              alt="Post content"
              className="w-full max-h-96 object-cover"
            />
          </div>
        )}
        
        {/* Hashtags */}
        {hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {hashtags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
        
        {/* Standardized Interactions */}
        <InteractionButtons
          contentType="SocialPost"
          contentId={id}
          onCommentClick={handleCommentsClick}
          shareTitle={`${userName}'s post`}
          shareType="social"
          layout="horizontal"
          size="md"
          showSave={true}
          showBorder={false}
          cardType="social"
        />
      </CardContent>
    </Card>
  );
};

export default SocialCard;
