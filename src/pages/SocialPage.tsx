import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import SocialCard from '../components/cards/SocialCard';
import CreatePostDialog from '../components/CreatePostDialog';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { TrendingUp, Users, Hash, Plus, Settings } from 'lucide-react';

interface FeedPost {
  _id: string;
  author: {
    _id: string;
    name: string;
    uniqueId: string;
    profile?: {
      avatar?: {
        data: string;
        contentType: string;
      };
    };
  };
  content: string;
  media?: Array<{
    type: string;
    url: string;
    filename: string;
  }>;
  postType: string;
  hashtags: string[];
  mentions: any[];
  groupId?: {
    _id: string;
    name: string;
    slug: string;
  };
  engagement: {
    likeCount: number;
    commentCount: number;
    shareCount: number;
    views: number;
  };
  // Direct engagement fields from SocialFeedService transformation
  likeCount?: number;
  commentCount?: number;
  shareCount?: number;
  views?: number;
  userInteractions?: {
    liked: boolean;
    saved: boolean;
    shared: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

const SocialPage: React.FC = () => {
  const { user: authUser, getAuthHeaders } = useAuth();
  const { user: userProfile } = useUser();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'feed' | 'trending' | 'groups'>('feed');
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  // Simple posts query (no authentication required)
  const {
    data: feedData,
    isLoading: feedLoading,
    error: feedError,
    refetch: refetchFeed
  } = useQuery({
    queryKey: ['socialPosts'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/social/posts?limit=50');
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Social posts data:', data); // Debug log
        
        // DEBUG: Log social post engagement data
        const posts = data.posts || data;
        console.log('📱 SocialPage API Response:', posts.slice(0, 3).map((p: any) => ({
          content: p.content?.substring(0, 30) + '...',
          engagement: p.engagement,
          likeCount: p.likeCount,
          commentCount: p.commentCount,
          shareCount: p.shareCount
        })));
        
        return data;
      } catch (error) {
        console.error('Error fetching social posts:', error);
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    retry: 2
  });

  // Trending posts query
  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ['trendingPosts'],
    queryFn: async () => {
      const response = await fetch('/api/social/trending?timeframe=24&limit=10');
      if (!response.ok) throw new Error('Failed to fetch trending posts');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    enabled: activeTab === 'trending'
  });

  // Groups query - fetch authentic groups from MongoDB
  const { data: groupsData, isLoading: groupsLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const response = await fetch('/api/groups?limit=10');
      if (!response.ok) throw new Error('Failed to fetch groups');
      return response.json();
    },
    staleTime: 10 * 60 * 1000,
    enabled: activeTab === 'groups'
  });

  // Engagement stats query removed - endpoint doesn't exist

  // User suggestions removed - endpoint doesn't exist

  // Transform feed data for display
  const allPosts = feedData?.posts || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Social Feed</h1>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Main Content */}
          <div>
            {/* Navigation Tabs */}
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="mb-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="feed">
                  <Hash className="w-4 h-4 mr-2" />
                  Feed
                </TabsTrigger>
                <TabsTrigger value="trending">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Trending
                </TabsTrigger>
                <TabsTrigger value="groups">
                  <Users className="w-4 h-4 mr-2" />
                  Groups
                </TabsTrigger>
              </TabsList>

              {/* Feed Tab */}
              <TabsContent value="feed" className="space-y-6">

                {/* Create Post Card */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                        {(authUser?.avatar?.data || userProfile?.profileImage) ? (
                          <img 
                            src={authUser?.avatar?.data || userProfile?.profileImage || ''} 
                            alt={authUser?.name || userProfile?.name || 'You'} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500 font-bold">
                            {(authUser?.name || userProfile?.name)?.charAt(0) || 'U'}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setIsCreatePostOpen(true)}
                        className="flex-1 justify-start text-gray-500 dark:text-gray-400 h-auto py-3 bg-slate-200 dark:bg-[#0A1426] border border-slate-300 dark:border-[#1E293B] hover:bg-slate-300 dark:hover:bg-[#0F172A]"
                      >
                        What's on your mind about AI?
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Feed Posts */}
                {feedLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Card key={i}>
                        <CardContent className="p-6">
                          <div className="flex space-x-3">
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-1/4" />
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-20 w-full" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : feedError ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-red-600 dark:text-red-400">Failed to load feed. Please try again later.</p>
                      <Button onClick={() => refetchFeed()} className="mt-4">Retry</Button>
                    </CardContent>
                  </Card>
                ) : allPosts.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-gray-600 dark:text-gray-400">No posts yet. Be the first to share something!</p>
                      <Button onClick={() => setIsCreatePostOpen(true)} className="mt-4">Create First Post</Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {allPosts
                      .filter(post => post && post.content) // Filter out null posts
                      .map((post: FeedPost) => (
                      <SocialCard
                        key={post._id}
                        id={post._id}
                        userName={post.author?.name || 'Unknown User'}
                        userAvatar={post.author?.profile?.avatar?.data ? 
                          post.author.profile.avatar.data : 
                          null
                        }
                        timestamp={post.createdAt}
                        content={post.content}
                        imageUrl={post.media?.[0]?.url}
                        hashtags={post.hashtags || []}
                        group={post.groupId}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Trending Tab */}
              <TabsContent value="trending">
                {trendingLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Card key={i} className="dark:bg-gray-950 border dark:border-gray-700">
                        <CardContent className="p-6">
                          <Skeleton className="h-24 w-full" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {(trendingData as any)?.posts?.map((post: FeedPost) => (
                      <SocialCard
                        key={post._id}
                        id={post._id}
                        userName={post.author.name}
                        userAvatar={post.author.profile?.avatar ? 
                          `data:${post.author.profile.avatar.contentType};base64,${post.author.profile.avatar.data}` : 
                          null
                        }
                        timestamp={post.createdAt}
                        content={post.content}
                        imageUrl={post.media?.[0]?.url}
                        trending={true}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Groups Tab */}
              <TabsContent value="groups">
                {groupsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Card key={i}>
                        <CardContent className="p-6">
                          <Skeleton className="h-32 w-full" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold">AI Study Groups</h2>
                      <Button variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Group
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {(groupsData as any)?.groups?.map((group: any) => (
                        <Card key={group._id} className="hover:shadow-lg transition-shadow cursor-pointer">
                          <CardHeader>
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-emerald-600" />
                              </div>
                              <div className="flex-1">
                                <CardTitle className="text-lg">{group.name}</CardTitle>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {group.memberCount || 0} members
                                </p>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                              {group.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary">{group.category}</Badge>
                              <Button size="sm">Join</Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    
                    {(groupsData as any)?.groups?.length === 0 && (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <p className="text-gray-600 dark:text-gray-400">No groups available yet. Be the first to create one!</p>
                          <Button className="mt-4">Create First Group</Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <CreatePostDialog
          isOpen={isCreatePostOpen}
          onClose={() => setIsCreatePostOpen(false)}
          onPostCreated={() => {
            setIsCreatePostOpen(false);
            refetchFeed();
          }}
        />
      </div>
    </div>
  );
};

export default SocialPage;
