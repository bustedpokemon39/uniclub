import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import ChatWindow from './ChatWindow';

interface ChatBubbleProps {
  articleId?: string;
  articleTitle?: string;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ 
  articleId = '683fa28628b70ed750ba90c0', 
  articleTitle = 'AI Club Discussion' 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Debug log to ensure component is rendering
  console.log('🤖 ChatBubble rendering with articleId:', articleId, 'title:', articleTitle);

  return (
    <>
      {/* Chat Bubble - Only show when chat window is closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-4 sm:bottom-6 sm:right-6 p-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-[9998] group border border-emerald-400/20"
          aria-label="Open AI discussion chat"
        >
          <MessageCircle className="w-6 h-6 transition-transform group-hover:scale-110" />
          
          {/* Subtle pulse indicator */}
          <div className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping opacity-75"></div>
        </button>
      )}

      {/* Chat Window - Only show when open */}
      {isOpen && (
        <ChatWindow onClose={() => setIsOpen(false)} articleId={articleId} articleTitle={articleTitle} />
      )}
    </>
  );
};

export default ChatBubble; 