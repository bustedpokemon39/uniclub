import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Image, Smile, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';

interface CreatePostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
}

const CreatePostDialog: React.FC<CreatePostDialogProps> = ({
  isOpen,
  onClose,
  onPostCreated
}) => {
  const { user, getAuthHeaders } = useAuth();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [postType, setPostType] = useState<'text' | 'image' | 'video'>('text');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setSelectedFiles(files);
      setPostType(files[0].type.startsWith('video/') ? 'video' : 'image');
    }
  };

  const extractHashtags = (text: string): string[] => {
    const hashtagRegex = /#[\w]+/g;
    return (text.match(hashtagRegex) || []).map(tag => tag.slice(1));
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    setHashtags(extractHashtags(newContent));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && selectedFiles.length === 0) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('content', content.trim());
      formData.append('postType', postType);
      formData.append('visibility', 'club-members');
      
      if (hashtags.length > 0) {
        formData.append('hashtags', JSON.stringify(hashtags));
      }

      // Add media files
      selectedFiles.forEach((file, index) => {
        formData.append('media', file);
      });

      const response = await fetch('/api/social/posts', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      // Invalidate and refetch social posts
      await queryClient.invalidateQueries({ queryKey: ['socialFeed'] });
      await queryClient.invalidateQueries({ queryKey: ['trendingPosts'] });

      // Reset form and close dialog
      setContent('');
      setSelectedFiles([]);
      setHashtags([]);
      setPostType('text');
      onClose();
      onPostCreated?.();
    } catch (error) {
      console.error('Error creating post:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
              {user?.profileImage ? (
                <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <textarea
                value={content}
                onChange={handleContentChange}
                placeholder="What's on your mind about AI? Use #hashtags to categorize your post!"
                className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none"
                rows={4}
              />
              
              {/* Show detected hashtags */}
              {hashtags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {hashtags.map((tag, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Selected files preview */}
              {selectedFiles.length > 0 && (
                <div className="relative mt-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="relative inline-block mr-2">
                      {file.type.startsWith('image/') ? (
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt="Selected" 
                          className="max-h-48 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-48 h-32 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Video: {file.name}
                          </span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelectedFiles([])}
                        className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center space-x-2">
                  <label className="p-2 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-500 cursor-pointer rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <Image className="w-5 h-5" />
                    <input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                </div>
                
                <button
                  type="submit"
                  disabled={(!content.trim() && selectedFiles.length === 0) || isSubmitting}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostDialog; 