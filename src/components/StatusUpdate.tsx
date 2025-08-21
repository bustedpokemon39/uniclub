import React, { useState } from 'react';
import { Image, Smile, X } from 'lucide-react';
import { useUser } from '../context/UserContext';

const StatusUpdate: React.FC = () => {
  const { user } = useUser();
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle post submission
    console.log('Post submitted:', { content, image: selectedImage });
    setContent('');
    setSelectedImage(null);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
      <form onSubmit={handleSubmit}>
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
            {user.profileImage ? (
              <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                {user.name.charAt(0)}
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none"
              rows={3}
            />
            
            {selectedImage && (
              <div className="relative mt-2">
                <img 
                  src={selectedImage} 
                  alt="Selected" 
                  className="max-h-48 rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-2">
                <label className="p-2 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-500 cursor-pointer rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <Image className="w-5 h-5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
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
                disabled={!content.trim() && !selectedImage}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default StatusUpdate; 