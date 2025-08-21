import React, { useState, useEffect } from 'react';
import { Send, CheckCircle } from 'lucide-react';
import { useUser } from '../context/UserContext';

interface CommentInputProps {
  onSubmit: (content: string) => Promise<void>;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

const CommentInput: React.FC<CommentInputProps> = ({
  onSubmit,
  placeholder = "Write a comment...",
  loading = false,
  disabled = false,
  className = ""
}) => {
  const { user } = useUser();
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const getAvatarSrc = () => {
    // Use the same logic as ProfilePictureUpload component
    if (user?.profileImage && typeof user.profileImage === 'string' && user.profileImage.startsWith('data:')) {
      return user.profileImage;
    }
    
    if (user?.name) {
      // Generate a simple avatar based on user's name
      const name = user.name;
      const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
      const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
      const colorIndex = name.charCodeAt(0) % colors.length;
      const color = colors[colorIndex];
      
      return `data:image/svg+xml;base64,${btoa(`
        <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18" fill="${color}"/>
          <text x="20" y="26" font-family="Arial" font-size="14" fill="white" text-anchor="middle">${initials}</text>
        </svg>
      `)}`;
    }
    
    // Default avatar
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="18" fill="#6b7280"/>
        <text x="20" y="26" font-family="Arial" font-size="14" fill="white" text-anchor="middle">?</text>
      </svg>
    `)}`;
  };

  const handleSubmit = async () => {
    if (!content.trim() || submitting || disabled) return;

    try {
      setSubmitting(true);
      await onSubmit(content.trim());
      setContent(''); // Clear the input after successful submission
      setShowSuccess(true);
    } catch (error) {
      console.error('Error submitting comment:', error);
      // Don't clear the content on error so user can retry
    } finally {
      setSubmitting(false);
    }
  };

  // Hide success message after 2 seconds
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };



  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-start space-x-3">
        {/* Avatar - smaller size */}
        <div className="flex-shrink-0 pt-1">
          <img 
            src={getAvatarSrc()} 
            alt={user?.name || 'User'}
            className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
          />
        </div>
        
        {/* Input container - full width */}
        <div className="flex-1 min-w-0">
          <div className="relative">
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share your thoughts..."
              disabled={disabled || submitting}
              className="w-full py-3 px-4 pr-16 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm shadow-sm"
            />
            
            {/* Send button */}
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || submitting || disabled}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
              title="Send comment"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Post'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="mt-2 text-sm text-green-600 dark:text-green-400">
          Comment posted!
        </div>
      )}
    </div>
  );
};

export default CommentInput;
