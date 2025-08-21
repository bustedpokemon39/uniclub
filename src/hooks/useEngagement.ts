import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';

interface EngagementData {
  liked: boolean;
  saved: boolean;
  shared: boolean;
  viewed: boolean;
}

interface EngagementStats {
  totalLikes: number;
  totalSaves: number;
  totalShares: number;
  totalViews: number;
}

export const useEngagement = (contentType: string, contentId: string) => {
  console.log('🎯 useEngagement HOOK CALLED:', { contentType, contentId });
  
  const queryClient = useQueryClient();
  
  const [engagement, setEngagement] = useState<EngagementData>({
    liked: false,
    saved: false,
    shared: false,
    viewed: false
  });
  const [stats, setStats] = useState<EngagementStats>({
    totalLikes: 0,
    totalSaves: 0,
    totalShares: 0,
    totalViews: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get auth token (check all possible storage keys - UserContext uses 'token')
  const getToken = () => 
    localStorage.getItem('token') || 
    sessionStorage.getItem('authToken') || 
    localStorage.getItem('authToken');

  // Fetch user's engagement status
  const fetchEngagement = useCallback(async () => {
    try {
      console.log('🔄 fetchEngagement called for:', contentType, contentId);
      const token = getToken();
      console.log('🔑 Token found:', token ? `${token.substring(0, 20)}...` : 'NONE');
      
      if (!token) {
        console.log('❌ No token for engagement fetch - skipping');
        return;
      }

      console.log('🎯 Fetching engagement for:', contentType, contentId);

      const response = await api.get(`/api/engagement/user/${contentType}/${contentId}`);

      console.log('🎯 Engagement response status:', response.status);
      console.log('🎯 Engagement data:', response.data);
      
      if (response.data.success && response.data.engagement) {
        console.log('✅ Setting engagement state:', response.data.engagement);
        setEngagement(response.data.engagement);
      } else {
        console.log('❌ No engagement data received or unsuccessful response');
      }
    } catch (error) {
      console.error('❌ Error fetching engagement:', error);
    }
  }, [contentType, contentId]);

  // Fetch engagement stats
  const fetchStats = useCallback(async () => {
    try {
      console.log('📊 Fetching stats for:', contentType, contentId);

      const response = await api.get(`/api/engagement/stats/${contentType}/${contentId}`);
      
      console.log('📊 Stats response status:', response.status);
      console.log('📊 Stats data:', response.data);
      
      if (response.data.success && response.data.stats) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
    }
  }, [contentType, contentId]);

  // Toggle like
  const toggleLike = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = getToken();
      if (!token) {
        setError('Please log in to like content');
        return;
      }

      console.log('❤️ Toggling like for:', contentType, contentId);

      const response = await api.post(`/api/engagement/like/${contentType}/${contentId}`);

      console.log('❤️ Like response status:', response.status);
      console.log('❤️ Like response data:', response.data);
      
      if (response.data.success) {
        setEngagement(prev => ({
          ...prev,
          liked: response.data.liked
        }));
        
        // Update stats optimistically
        setStats(prev => ({
          ...prev,
          totalLikes: prev.totalLikes + (response.data.liked ? 1 : -1)
        }));
        
        // Invalidate related queries to refresh data from server
        queryClient.invalidateQueries(['stats', contentType, contentId]);
        queryClient.invalidateQueries(['engagement', contentType, contentId]);
        queryClient.invalidateQueries([contentType.toLowerCase()]);
      }
    } catch (error: any) {
      console.error('❌ Error toggling like:', error);
      if (error.response?.status === 401) {
        const errorMessage = 'Please log in to like content';
        setError(errorMessage);
        // Show toast notification for better UX
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:required', { 
            detail: { message: errorMessage }
          }));
        }
      } else {
        setError(error.response?.data?.error || 'Failed to toggle like');
      }
    } finally {
      setLoading(false);
    }
  };

  // Toggle save
  const toggleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = getToken();
      if (!token) {
        setError('Please log in to save content');
        return;
      }

      console.log('💾 Toggling save for:', contentType, contentId);

      const response = await api.post(`/api/engagement/save/${contentType}/${contentId}`);

      console.log('💾 Save response status:', response.status);
      console.log('💾 Save response data:', response.data);
      
      if (response.data.success) {
        setEngagement(prev => ({
          ...prev,
          saved: response.data.saved
        }));
        
        // Update stats optimistically
        setStats(prev => ({
          ...prev,
          totalSaves: prev.totalSaves + (response.data.saved ? 1 : -1)
        }));
        
        // Invalidate related queries to refresh data from server
        queryClient.invalidateQueries(['stats', contentType, contentId]);
        queryClient.invalidateQueries(['engagement', contentType, contentId]);
        queryClient.invalidateQueries([contentType.toLowerCase()]);
      }
    } catch (error: any) {
      console.error('❌ Error toggling save:', error);
      if (error.response?.status === 401) {
        const errorMessage = 'Please log in to save content';
        setError(errorMessage);
        // Show toast notification for better UX
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:required', { 
            detail: { message: errorMessage }
          }));
        }
      } else {
        setError(error.response?.data?.error || 'Failed to toggle save');
      }
    } finally {
      setLoading(false);
    }
  };

  // Record share
  const recordShare = async () => {
    try {
      const token = getToken();
      if (!token) return;

      console.log('📤 Recording share for:', contentType, contentId);

      const response = await api.post(`/api/engagement/share/${contentType}/${contentId}`);

      console.log('📤 Share response status:', response.status);
      console.log('📤 Share response data:', response.data);
      
      if (response.data.success) {
        setEngagement(prev => ({
          ...prev,
          shared: true
        }));
        
        // Update stats
        setStats(prev => ({
          ...prev,
          totalShares: prev.totalShares + 1
        }));
        
        // Invalidate related queries to refresh data from server
        queryClient.invalidateQueries(['stats', contentType, contentId]);
        queryClient.invalidateQueries(['engagement', contentType, contentId]);
        queryClient.invalidateQueries([contentType.toLowerCase()]);
      }
    } catch (error) {
      console.error('❌ Error recording share:', error);
    }
  };

  // Load engagement data on mount
  useEffect(() => {
    console.log('🔄 useEffect TRIGGERED with:', { contentType, contentId });
    if (contentType && contentId) {
      console.log('🔄 Loading engagement data for:', contentType, contentId);
      fetchEngagement();
      fetchStats();
    } else {
      console.log('❌ Missing contentType or contentId:', { contentType, contentId });
    }
  }, [contentType, contentId]);

  return {
    engagement,
    stats,
    loading,
    error,
    toggleLike,
    toggleSave,
    recordShare,
    refetch: () => {
      fetchEngagement();
      fetchStats();
    }
  };
}; 