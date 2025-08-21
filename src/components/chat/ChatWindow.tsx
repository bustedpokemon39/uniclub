import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageCircle, Sparkles } from 'lucide-react';
import { useUser } from '../../context/UserContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatWindowProps {
  onClose: () => void;
  articleId: string;
  articleTitle: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ onClose, articleId, articleTitle }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useUser();

  // Use Vite proxy for API requests - all /api requests go through proxy

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!isAuthenticated) return;
      
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`/api/chat/${articleId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setMessages(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    };

    fetchChatHistory();
  }, [articleId, isAuthenticated]);

  const handleSend = async () => {
    if (!input.trim()) return;

    if (!isAuthenticated) {
      alert('Please log in to use the chat feature.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to use the chat feature.');
      return;
    }

    const newMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`/api/chat/${articleId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: input })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.messages && Array.isArray(data.messages)) {
          // Only add the assistant's response (last message), since user message is already added
          const assistantMessage = data.messages.find(msg => msg.role === 'assistant');
          if (assistantMessage) {
            setMessages(prev => [...prev, assistantMessage]);
          }
        }
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div 
      className="fixed inset-x-4 bottom-24 sm:bottom-6 sm:right-6 sm:left-auto sm:w-96 max-h-[75vh] rounded-2xl shadow-2xl border border-emerald-700/30 flex flex-col z-[1000] overflow-hidden animate-scale-in"
      style={{
        background: 'rgba(0, 70, 32, 0.95)',
        backdropFilter: 'blur(10px)'
      }}
    >
      {/* Header - Dark emerald with high contrast */}
      <div 
        className="flex items-center justify-between p-4 border-b border-emerald-600/30"
        style={{ background: 'rgba(0, 50, 18, 0.9)' }}
      >
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <div className="flex-shrink-0 w-8 h-8 bg-emerald-400/20 rounded-full flex items-center justify-center border border-emerald-500/30">
            <Sparkles className="w-4 h-4 text-emerald-300" />
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold text-emerald-100 text-sm truncate">
              AI Discussion
            </h2>
            <p className="text-xs text-emerald-200/70 truncate">
              {articleTitle}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 p-2 hover:bg-emerald-600/30 rounded-full transition-colors"
        >
          <X className="w-4 h-4 text-emerald-200" />
        </button>
      </div>

      {/* Messages Area - Scroll containment and darker background */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[400px]"
        style={{ 
          background: 'rgba(0, 50, 18, 0.85)',
          overscrollBehavior: 'contain'
        }}
      >
        {messages.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-emerald-400/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
              <MessageCircle className="w-6 h-6 text-emerald-300" />
            </div>
            <p className="text-sm text-emerald-200 mb-1">Start a conversation!</p>
            <p className="text-xs text-emerald-200/60">Ask questions about this article</p>
          </div>
        )}
        
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'text-white shadow-sm border border-emerald-400/30'
                  : 'text-emerald-100 border border-emerald-600/20'
              }`}
              style={{
                background: message.role === 'user' 
                  ? 'rgba(16, 185, 129, 0.9)' // Bright emerald for user messages
                  : 'rgba(0, 90, 40, 0.7)' // Darker emerald for assistant messages
              }}
            >
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
              <span className="text-xs opacity-75 mt-2 block">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div 
              className="border border-emerald-600/20 rounded-2xl px-4 py-3"
              style={{ background: 'rgba(0, 90, 40, 0.7)' }}
            >
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-emerald-300 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-emerald-300 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-emerald-300 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Dark emerald with high contrast */}
      <div 
        className="p-4 border-t border-emerald-600/30"
        style={{ background: 'rgba(0, 50, 18, 0.9)' }}
      >
        {!isAuthenticated ? (
          <div className="text-center py-3">
            <p className="text-sm text-emerald-200 mb-2">Please log in to use AI chat</p>
            <div className="text-xs text-emerald-200/60">
              Get personalized insights about this article
            </div>
          </div>
        ) : (
          <div className="flex items-end space-x-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about this article..."
              className="flex-1 min-h-[40px] max-h-32 p-3 rounded-xl border border-emerald-600/40 text-emerald-100 placeholder-emerald-300/60 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-colors text-sm"
              style={{
                background: 'rgba(0, 90, 40, 0.6)',
                backdropFilter: 'blur(5px)'
              }}
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="flex-shrink-0 p-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-700/50 disabled:text-emerald-300/50 text-white rounded-xl transition-colors disabled:cursor-not-allowed shadow-sm border border-emerald-400/30"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow; 