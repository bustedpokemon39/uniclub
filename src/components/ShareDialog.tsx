import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Share2, Users, Link, MessageCircle, Mail, Twitter, Facebook, Linkedin, Copy, Check } from 'lucide-react';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'news' | 'event' | 'social' | 'resource';
  url?: string;
}

const ShareDialog: React.FC<ShareDialogProps> = ({
  isOpen,
  onClose,
  title,
  type,
  url = window.location.href
}) => {
  const [copied, setCopied] = useState(false);
  const [sharedToFeed, setSharedToFeed] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShareToFeed = () => {
    console.log('Share to feed:', title);
    setSharedToFeed(true);
    setTimeout(() => setSharedToFeed(false), 2000);
    // Here you would implement the actual sharing to user's feed
  };

  const handleExternalShare = (platform: string) => {
    const encodedTitle = encodeURIComponent(title);
    const encodedUrl = encodeURIComponent(url);
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      email: `mailto:?subject=${encodedTitle}&body=Check out this ${type}: ${encodedUrl}`
    };

    if (shareUrls[platform as keyof typeof shareUrls]) {
      window.open(shareUrls[platform as keyof typeof shareUrls], '_blank', 'width=600,height=400');
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'news': return 'article';
      case 'event': return 'event';
      case 'social': return 'post';
      case 'resource': return 'resource';
      default: return 'content';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <Share2 className="w-5 h-5" />
            <span>Share {getTypeLabel(type)}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-1">
          {/* Title Preview */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
            <p className="text-sm text-gray-900 dark:text-white line-clamp-2 leading-relaxed">
              {title}
            </p>
          </div>

          {/* Internal Sharing */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Share within AI Club</h3>
            <div className="space-y-2">
              <button
                onClick={handleShareToFeed}
                className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                  sharedToFeed 
                    ? 'bg-emerald-100 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700'
                    : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200/60 dark:border-gray-600/60'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  sharedToFeed ? 'bg-emerald-500' : 'bg-emerald-100 dark:bg-emerald-900/40'
                }`}>
                  {sharedToFeed ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : (
                    <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className={`font-medium ${sharedToFeed ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                    {sharedToFeed ? 'Shared to your feed!' : 'Share to your feed'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {sharedToFeed ? 'Your followers can now see this' : 'Let your followers see this'}
                  </p>
                </div>
              </button>

              <button
                onClick={() => console.log('Send direct message')}
                className="w-full flex items-center space-x-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200/60 dark:border-gray-600/60 transition-all duration-200"
              >
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900 dark:text-white">Send direct message</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Share privately with specific members</p>
                </div>
              </button>
            </div>
          </div>

          {/* External Sharing */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Share externally</h3>
            <div className="space-y-2">
              <button
                onClick={handleCopyLink}
                className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                  copied 
                    ? 'bg-emerald-100 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700'
                    : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200/60 dark:border-gray-600/60'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  copied ? 'bg-emerald-500' : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  {copied ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : (
                    <Copy className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className={`font-medium ${copied ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                    {copied ? 'Link copied!' : 'Copy link'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {copied ? 'Ready to paste anywhere' : 'Share the link anywhere'}
                  </p>
                </div>
              </button>

              {/* Social Media Platforms */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleExternalShare('twitter')}
                  className="flex items-center space-x-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200/60 dark:border-gray-600/60 transition-all duration-200"
                >
                  <Twitter className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Twitter</span>
                </button>

                <button
                  onClick={() => handleExternalShare('linkedin')}
                  className="flex items-center space-x-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200/60 dark:border-gray-600/60 transition-all duration-200"
                >
                  <Linkedin className="w-5 h-5 text-blue-700" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">LinkedIn</span>
                </button>

                <button
                  onClick={() => handleExternalShare('facebook')}
                  className="flex items-center space-x-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200/60 dark:border-gray-600/60 transition-all duration-200"
                >
                  <Facebook className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Facebook</span>
                </button>

                <button
                  onClick={() => handleExternalShare('email')}
                  className="flex items-center space-x-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200/60 dark:border-gray-600/60 transition-all duration-200"
                >
                  <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Email</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog; 