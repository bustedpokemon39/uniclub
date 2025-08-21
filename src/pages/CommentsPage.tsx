import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Heart, MessageSquare, MessageCircle, User, Calendar } from 'lucide-react';
import CommentList from '../components/CommentList';
import CommentInput from '../components/CommentInput';
import { useComments } from '../hooks/useComments';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { ScrollArea } from '../components/ui/scroll-area';

// Define post types for the preview section
interface BasePost {
  _id: string;
  title?: string;
  content?: string;
  description?: string;
  createdAt?: string;
  publishedAt?: string;
  startDate?: string;
  imageUrl?: string;
  source?: string;
  excerpt?: string;
  location?: {
    address?: string;
  } | string;
  author?: {
    name: string;
    profile?: {
      avatar?: {
        data: string;
      };
    };
  };
  organizer?: any;
  uploadedBy?: any;
  engagement?: {
    comments?: number;
    likes?: number;
    shares?: number;
    rsvpCount?: number;
  };
  media?: Array<{
    url: string;
  }>;
}

const CommentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // DEBUG: Log current user data to verify authentication
  console.log('🔍 DEBUG - CommentsPage user data:', {
    user,
    hasUser: !!user,
    userId: user?.id,
    userIdAlt: user?._id,
    userName: user?.name,
    userEmail: user?.email
  });

  // Get type and id from route params
  const { type, id } = useParams<{ type: string; id: string }>();


  // Scroll to top when component mounts or type/id changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [type, id]);

  // Fetch post data based on type and id
  const { data: post, isLoading: postLoading, error: postError } = useQuery({
    queryKey: ['post', type, id],
    queryFn: async () => {
      if (!type || !id) {
        console.log('🚫 Post query skipped - missing type or id:', { type, id });
        return null;
      }
      
      let endpoint = '';
      switch (type) {
        case 'news':
          endpoint = `/api/news/${id}`;
          break;
        case 'event':
          endpoint = `/api/events/${id}`;
          break;
        case 'resource':
          endpoint = `/api/resources/${id}`;
          break;
        case 'social':
          endpoint = `/api/social/posts/${id}`;
          break;
        default:
          console.log('🚫 Unknown post type:', type);
          return null;
      }
      
      console.log('🔄 Fetching post data:', { type, id, endpoint });
      
      try {
        const response = await api.get(endpoint);
        console.log('✅ Post data received:', response.data);
        
        // Extract post data from response structure based on content type
        if (response.data.success) {
          if (type === 'social' && response.data.post) {
            console.log('📦 Extracted social post:', response.data.post);
            return response.data.post;
          } else if (type === 'resource' && response.data.resource) {
            console.log('📦 Extracted resource:', response.data.resource);
            return response.data.resource;
          } else if (response.data.post) {
            console.log('📦 Extracted post:', response.data.post);
            return response.data.post;
          }
        }
        
        // Fallback for other content types that return data directly
        return response.data;
      } catch (error) {
        console.error('❌ Post fetch error:', error);
        throw error;
      }
    },
    enabled: !!type && !!id
  });

  // Debug post query state
  console.log('📊 Post Query State:', {
    type,
    id,
    postLoading,
    hasPost: !!post,
    postError: postError?.message,
    enabled: !!type && !!id
  });

  // Use the new useComments hook for dynamic comment management
  const {
    comments,
    commentCount,
    loading: commentsLoading,
    error: commentsError,
    addComment,
    likeComment,
    editComment,
    deleteComment,
    refetch: refetchComments,
    loadMore,
    hasMore,
    pagination
  } = useComments(type || '', id || '', { 
    sort: 'newest',
    autoFetch: true 
  });

  const handleAddComment = async (content: string) => {
    try {
      await addComment(content);
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    }
  };

  const handleReply = async (parentId: string, content: string) => {
    try {
      await addComment(content, parentId);
    } catch (error) {
      console.error('Error adding reply:', error);
      alert('Failed to add reply. Please try again.');
    }
  };

  const handleLike = async (commentId: string) => {
    try {
      await likeComment(commentId);
    } catch (error) {
      console.error('Error liking comment:', error);
      alert('Failed to like comment. Please try again.');
    }
  };

  const handleEdit = async (commentId: string, content: string) => {
    try {
      await editComment(commentId, content);
    } catch (error) {
      console.error('Error editing comment:', error);
      alert('Failed to edit comment. Please try again.');
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      await deleteComment(commentId);
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment. Please try again.');
    }
  };

  const PostPreview: React.FC = () => {
    if (!post || postLoading) {
      return postLoading ? (
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-4 bg-muted rounded w-3/4 mb-3"></div>
            <div className="h-3 bg-muted rounded w-full mb-2"></div>
            <div className="h-3 bg-muted rounded w-5/6"></div>
          </CardContent>
        </Card>
      ) : null;
    }

    // UNIFIED LAYOUT FOR ALL CONTENT TYPES
    const getImageUrl = () => {
      switch (type) {
        case 'news': return post.imageUrl;
        case 'event': return post.imageUrl;
        case 'resource': return post.thumbnailUrl;
        case 'social': return post.media?.[0]?.url;
        default: return null;
      }
    };

    const getTitle = () => {
      switch (type) {
        case 'news': return post.title;
        case 'event': return post.title;
        case 'resource': return post.title;
        case 'social': return post.content;
        default: return 'Content';
      }
    };

    const getDescription = () => {
      switch (type) {
        case 'news': return post.excerpt;
        case 'event': return post.description;
        case 'resource': return post.description;
        case 'social': return null; // Content is already the title
        default: return null;
      }
    };

    const getDate = () => {
      switch (type) {
        case 'news': return post.publishedAt;
        case 'event': return post.createdAt;
        case 'resource': return post.dateAdded || post.createdAt;
        case 'social': return post.createdAt;
        default: return new Date();
      }
    };

    const getAuthor = () => {
      switch (type) {
        case 'news': return post.source;
        case 'event': return 'Event';
        case 'resource': return post.uploadedBy?.name || 'Resource';
        case 'social': return post.author?.name || 'User';
        default: return 'Content';
      }
    };

    const getContentType = () => {
      switch (type) {
        case 'news': return { label: 'News', variant: 'default' as const };
        case 'event': return { label: 'Event', variant: 'secondary' as const };
        case 'resource': return { label: 'Resource', variant: 'outline' as const };
        case 'social': return { label: 'Discussion', variant: 'destructive' as const };
        default: return { label: 'Content', variant: 'default' as const };
      }
    };

    const imageUrl = getImageUrl();
    const title = getTitle();
    const description = getDescription();
    const date = getDate();
    const author = getAuthor();
    const contentTypeInfo = getContentType();

    return (
      <Card className="overflow-hidden">
        {imageUrl && (
          <div className="aspect-video w-full overflow-hidden">
            <img 
              src={imageUrl} 
              alt={title} 
              className="w-full h-full object-cover transition-transform hover:scale-105" 
            />
          </div>
        )}
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <Badge variant={contentTypeInfo.variant}>{contentTypeInfo.label}</Badge>
            <div className="flex items-center text-muted-foreground text-sm">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(date).toLocaleDateString()}
            </div>
          </div>
          
          <h1 className="text-xl font-bold mb-3 line-clamp-2">{title}</h1>
          
          {description && (
            <p className="text-muted-foreground mb-4 line-clamp-2">{description}</p>
          )}
          
          <div className="flex items-center">
            <Avatar className="w-10 h-10 mr-3">
              <AvatarImage 
                src={
                  type === 'social' ? post.author?.profile?.avatar?.data : 
                  type === 'resource' ? post.uploadedBy?.profile?.avatar?.data : 
                  undefined
                } 
                className="object-cover"
              />
              <AvatarFallback className="bg-primary/10 text-primary">
                <User className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{author}</p>
              <p className="text-xs text-muted-foreground">Author</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Creative Header Layout */}
      <div className="sticky top-0 z-40 w-full border-b bg-white/95 dark:bg-gray-800/95 backdrop-blur shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          {/* Creative flowing layout */}
          <div className="flex items-center space-x-4">
            {/* Back button - clean and minimal */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
            </button>
            
            {/* Flowing title section */}
            <div className="flex items-center space-x-3 flex-1">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">Comments</h1>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content with proper spacing */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Post Preview */}
        <PostPreview />

        {/* Comments Section */}
        <div className="space-y-6">
          {/* Add Comment Section - Full width and clean */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center mb-4">
              <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Join the conversation</h3>
            </div>
            <CommentInput 
              onSubmit={handleAddComment}
              loading={commentsLoading}
              placeholder="Share your thoughts..."
            />
          </div>

          {/* Comments Error */}
          {commentsError && (
            <Card className="border-destructive">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
                    <Heart className="w-5 h-5 text-destructive" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">Failed to load comments</h3>
                    <p className="text-sm text-muted-foreground mt-1">{commentsError}</p>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => refetchComments()}
                      className="mt-3"
                    >
                      Try again
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comments List - Clean and wide */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <MessageCircle className="w-5 h-5 mr-2 text-blue-600" />
                Discussion
              </h3>
            </div>
            <div className="p-6">
              <CommentList
                comments={comments}
                loading={commentsLoading}
                // REMOVED onLike - no comment likes allowed
                // REMOVED onReply - no replies allowed
                onEdit={handleEdit}
                onDelete={handleDelete}
                onLoadMore={hasMore ? loadMore : undefined}
                hasMore={hasMore}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentsPage; 