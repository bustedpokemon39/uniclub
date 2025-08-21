
import React, { useState } from 'react';
import { Heart, MessageSquare, Bookmark, Share2 } from 'lucide-react';

interface ReactionButtonsProps {
  likes?: number;
  comments?: number;
  shares?: number;
  onComment?: () => void;
  isBookmarked?: boolean;
  onBookmark?: () => void;
  size?: 'sm' | 'md';
}

const ReactionButtons: React.FC<ReactionButtonsProps> = ({
  likes = 0,
  comments = 0,
  shares = 0,
  onComment,
  isBookmarked = false,
  onBookmark,
  size = 'md'
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [currentLikes, setCurrentLikes] = useState(likes);
  const [bookmarked, setBookmarked] = useState(isBookmarked);

  const reactions = [
    { emoji: '👍', label: 'Like' },
    { emoji: '❤️', label: 'Love' },
    { emoji: '😮', label: 'Wow' },
    { emoji: '😂', label: 'Haha' },
    { emoji: '😢', label: 'Sad' },
    { emoji: '😡', label: 'Angry' }
  ];

  const handleLike = () => {
    setIsLiked(!isLiked);
    setCurrentLikes(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    onBookmark?.();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Check this out!',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';
  const buttonPadding = size === 'sm' ? 'p-1.5' : 'p-2';

  return (
    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
      <div className="flex items-center space-x-4">
        {/* Like/Reaction Button */}
        <div className="relative">
          <button
            onClick={handleLike}
            onMouseEnter={() => setShowReactions(true)}
            onMouseLeave={() => setShowReactions(false)}
            className={`flex items-center space-x-1 ${buttonPadding} rounded-full transition-all duration-200 ${
              isLiked 
                ? 'text-red-500 bg-red-50 dark:bg-red-900/20' 
                : 'text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
            }`}
          >
            <Heart className={`${iconSize} ${isLiked ? 'fill-current' : ''}`} />
            <span className={`${textSize} font-medium`}>{currentLikes}</span>
          </button>

          {/* Reaction Popup */}
          {showReactions && (
            <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-2 py-1 shadow-lg flex space-x-1 z-10">
              {reactions.map((reaction, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsLiked(true);
                    setCurrentLikes(prev => prev + 1);
                    setShowReactions(false);
                  }}
                  className="hover:scale-125 transition-transform duration-200 text-lg"
                  title={reaction.label}
                >
                  {reaction.emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Comment Button */}
        <button
          onClick={onComment}
          className={`flex items-center space-x-1 ${buttonPadding} rounded-full text-gray-500 dark:text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200`}
        >
          <MessageSquare className={iconSize} />
          <span className={`${textSize} font-medium`}>{comments}</span>
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className={`flex items-center space-x-1 ${buttonPadding} rounded-full text-gray-500 dark:text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-200`}
        >
          <Share2 className={iconSize} />
          <span className={`${textSize} font-medium`}>{shares}</span>
        </button>
      </div>

      {/* Bookmark Button */}
      <button
        onClick={handleBookmark}
        className={`${buttonPadding} rounded-full transition-all duration-200 ${
          bookmarked 
            ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
            : 'text-gray-500 dark:text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
        }`}
      >
        <Bookmark className={`${iconSize} ${bookmarked ? 'fill-current' : ''}`} />
      </button>
    </div>
  );
};

export default ReactionButtons;
