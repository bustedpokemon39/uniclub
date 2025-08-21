import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { usePopup } from '../context/PopupContext';
import { useUser } from '../context/UserContext';
import { Heart, TrendingUp, Send, MessageCircle, MoreHorizontal, Reply } from 'lucide-react';

interface Comment {
  id: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
  reactions: {
    likes: number;
    userReaction?: boolean;
  };
  replies: Comment[];
}

interface CommentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  contentType: 'news' | 'event' | 'social' | 'resource';
  comments: Comment[];
}

const CommentDialog: React.FC<CommentDialogProps> = ({
  isOpen,
  onClose,
  title,
  contentType,
  comments: initialComments
}) => {
  const { closeUserProfile } = usePopup();
  const { user } = useUser();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'recent'>('popular');

  // Get current user's avatar
  const getAvatarSrc = () => {
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

  // Sort comments by popularity (likes + replies) or recency
  const sortedComments = useMemo(() => {
    return [...comments].sort((a, b) => {
      if (sortBy === 'popular') {
        const aPopularity = a.reactions.likes + a.replies.length;
        const bPopularity = b.reactions.likes + b.replies.length;
        return bPopularity - aPopularity;
      }
      // Sort by recency (assuming timestamp can be converted to Date)
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }, [comments, sortBy]);

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      userName: 'You',
      userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      content: newComment,
      timestamp: new Date().toISOString(),
      reactions: { likes: 0, userReaction: false },
      replies: []
    };

    setComments([comment, ...comments]);
    setNewComment('');
  };

  const handleAddReply = (parentId: string) => {
    if (!replyContent.trim()) return;

    const reply: Comment = {
      id: Date.now().toString(),
      userName: 'You',
      userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      content: replyContent,
      timestamp: new Date().toISOString(),
      reactions: { likes: 0, userReaction: false },
      replies: []
    };

    setComments(comments.map(comment => 
      comment.id === parentId 
        ? { ...comment, replies: [...comment.replies, reply] }
        : comment
    ));
    setReplyContent('');
    setReplyTo(null);
  };

  const handleLikeToggle = (commentId: string, isReply = false, parentId?: string) => {
    if (isReply && parentId) {
      // Handle like on reply
      setComments(comments.map(comment => 
        comment.id === parentId 
          ? {
              ...comment,
              replies: comment.replies.map(reply =>
                reply.id === commentId
                  ? {
                      ...reply,
                      reactions: {
                        likes: reply.reactions.userReaction 
                          ? Number(reply.reactions.likes) - 1
                          : Number(reply.reactions.likes) + 1,
                        userReaction: !reply.reactions.userReaction
                      }
                    }
                  : reply
              )
            }
          : comment
      ));
    } else {
      // Handle like on main comment
      setComments(comments.map(comment => 
        comment.id === commentId 
          ? {
              ...comment,
              reactions: {
                likes: comment.reactions.userReaction 
                  ? Number(comment.reactions.likes) - 1
                  : Number(comment.reactions.likes) + 1,
                userReaction: !comment.reactions.userReaction
              }
            }
          : comment
      ));
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const commentTime = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - commentTime.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const CommentItem: React.FC<{ comment: Comment; isReply?: boolean; parentId?: string }> = ({ 
    comment, 
    isReply = false,
    parentId
  }) => {
    const [showMenu, setShowMenu] = useState(false);
    
    return (
      <div className={`group ${isReply ? 'ml-10 mt-2' : 'mt-0'}`}>
        <div className="flex space-x-3">
          {/* Avatar */}
          <div>
            <img 
              src={comment.userAvatar} 
              alt={comment.userName}
              className="w-8 h-8 rounded-full object-cover"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Comment bubble */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 shadow-sm border border-gray-100 dark:border-gray-700 relative group-hover:shadow-md transition-all duration-200">
              {/* Header */}
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-sm text-gray-900 dark:text-white">
                    {comment.userName}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTimestamp(comment.timestamp)}
                  </span>
                  {!isReply && comment.reactions.likes > 3 && (
                    <div className="flex items-center space-x-1 bg-gradient-to-r from-orange-400 to-pink-400 px-2 py-0.5 rounded-full">
                      <TrendingUp className="w-3 h-3 text-white" />
                      <span className="text-xs text-white font-medium">Hot</span>
                    </div>
                  )}
                </div>
                
                {/* More menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                  >
                    <MoreHorizontal className="w-4 h-4 text-gray-500" />
                  </button>
                  
                  {showMenu && (
                    <div className="absolute right-0 top-8 bg-white dark:bg-gray-700 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 py-2 z-10 min-w-[140px]">
                      <button className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 w-full text-left transition-colors">
                        <span>Report</span>
                      </button>
                      <button className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 w-full text-left transition-colors">
                        <span>Copy link</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Content */}
              <p className="text-sm text-gray-900 dark:text-white leading-relaxed break-words">
                {comment.content}
              </p>
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center space-x-6 mt-2 px-1">
              <button 
                onClick={() => handleLikeToggle(comment.id, isReply, parentId)}
                className={`flex items-center space-x-1.5 group/like transition-all duration-200 ${
                  comment.reactions.userReaction 
                    ? 'text-red-500' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-red-500'
                }`}
              >
                <div className="relative">
                  <Heart className={`w-4 h-4 transition-all duration-200 ${
                    comment.reactions.userReaction 
                      ? 'fill-red-500 scale-110' 
                      : 'group-hover/like:scale-110'
                  }`} />
                  {comment.reactions.userReaction && (
                    <div className="absolute inset-0 w-4 h-4 bg-red-500 rounded-full animate-ping opacity-25"></div>
                  )}
                </div>
                <span className="text-xs font-medium">
                  {comment.reactions.likes > 0 ? comment.reactions.likes : ''}
                </span>
              </button>
              
              {!isReply && (
                <button 
                  onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                  className="flex items-center space-x-1.5 text-gray-500 dark:text-gray-400 hover:text-emerald-500 transition-all duration-200 group/reply"
                >
                  <Reply className="w-4 h-4 group-hover/reply:scale-110 transition-transform duration-200" />
                  <span className="text-xs font-medium">Reply</span>
                </button>
              )}
              
              {comment.replies.length > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                </span>
              )}
            </div>

            {/* Reply input */}
            {replyTo === comment.id && !isReply && (
              <div className="mt-3 animate-in slide-in-from-top-2 duration-200">
                <div className="flex space-x-3">
                  <img 
                    src={getAvatarSrc()} 
                    alt={user?.name || "You"}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="relative">
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write a reply..."
                        className="w-full p-3 pr-12 text-sm border border-gray-200 dark:border-gray-700 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 transition-all duration-200"
                        rows={2}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAddReply(comment.id);
                          }
                        }}
                      />
                      <button
                        onClick={() => handleAddReply(comment.id)}
                        disabled={!replyContent.trim()}
                        className="absolute right-2 bottom-2 p-1.5 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex justify-between items-center mt-2 px-1">
                      <button 
                        onClick={() => setReplyTo(null)}
                        className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <span className="text-xs text-gray-400">Press Enter to send</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Replies */}
            {comment.replies.length > 0 && (
              <div className="mt-3 space-y-2 border-l-2 border-gray-100 dark:border-gray-700 pl-4">
                {comment.replies.map((reply) => (
                  <CommentItem key={reply.id} comment={reply} isReply parentId={comment.id} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const handleClose = () => {
    closeUserProfile();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col rounded-3xl top-[10%] translate-y-0 z-[100] bg-emerald-200 dark:bg-gray-900">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-full">
              <MessageCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2">
                {title}
              </DialogTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {sortedComments.length} {sortedComments.length === 1 ? 'comment' : 'comments'}
              </p>
            </div>
          </div>
          
          {/* Sort Options */}
          <div className="flex space-x-2">
            <button
              onClick={() => setSortBy('popular')}
              className={`px-4 py-2 text-sm rounded-full font-medium transition-all duration-200 ${
                sortBy === 'popular' 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' 
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              🔥 Popular
            </button>
            <button
              onClick={() => setSortBy('recent')}
              className={`px-4 py-2 text-sm rounded-full font-medium transition-all duration-200 ${
                sortBy === 'recent' 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' 
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              ⏰ Recent
            </button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          {/* Add Comment Section */}
          <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
            <div className="flex space-x-3">
              <div>
                <img 
                  src={getAvatarSrc()} 
                  alt={user?.name || "You"}
                  className="w-8 h-8 rounded-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="relative">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full p-3 pr-12 border border-gray-200 dark:border-gray-700 rounded-2xl resize-none focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-300 dark:focus:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 transition-all duration-200 text-sm"
                    rows={1}
                    style={{
                      minHeight: '40px',
                      maxHeight: '120px'
                    }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddComment();
                      }
                    }}
                  />
                  <button 
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 text-gray-400 hover:text-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                {newComment.length > 0 && (
                  <div className="flex justify-end mt-2 px-1">
                    <span className={`text-xs ${
                      newComment.length > 1800 
                        ? 'text-red-500' 
                        : newComment.length > 1500 
                          ? 'text-yellow-500' 
                          : 'text-gray-400'
                    }`}>
                      {newComment.length}/2000
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="p-6">
            {sortedComments.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No comments yet</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Be the first to share your thoughts!</p>
                <button 
                  onClick={() => document.querySelector('textarea')?.focus()}
                  className="px-4 py-2 bg-emerald-500 text-white text-sm rounded-full hover:bg-emerald-600 transition-colors"
                >
                  Start the conversation
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {sortedComments.map((comment, index) => (
                  <div key={comment.id} className={`${index > 0 ? 'border-t border-gray-100 dark:border-gray-700 pt-6' : ''}`}>
                    <CommentItem comment={comment} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentDialog;
