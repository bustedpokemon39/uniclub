import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import UserProfile from './UserProfile';
import ProfilePictureUpload from './ProfilePictureUpload';
import { Search, User, X, Calendar, Users, Newspaper } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { usePopup } from '../context/PopupContext';

interface LayoutProps {
  children: React.ReactNode;
}

interface SearchResult {
  id: string;
  type: 'event' | 'member' | 'news';
  title: string;
  description: string;
  icon: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useUser();
  const { showUserProfile, openUserProfile, closeUserProfile } = usePopup();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Redirect to auth page if not authenticated (except if already on auth page)
  useEffect(() => {
    console.log('🔍 Layout auth check - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated, 'pathname:', location.pathname);
    
    if (!isLoading && !isAuthenticated && location.pathname !== '/auth') {
      console.log('🚨 User not authenticated, redirecting to /auth');
      navigate('/auth');
    }
  }, [isAuthenticated, isLoading, location.pathname, navigate]);

  // Focus search input when expanded
  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  // Handle click outside to close search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchExpanded(false);
        setSearchQuery('');
        setSearchResults([]);
      }
    };

    if (isSearchExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchExpanded]);

  // Mock search function - replace with actual API call
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Mock results - replace with actual API results
    const results: SearchResult[] = [
      {
        id: '1',
        type: 'event' as const,
        title: 'AI Workshop',
        description: 'Learn about machine learning basics',
        icon: <Calendar className="w-5 h-5 text-emerald-500" />
      },
      {
        id: '2',
        type: 'member' as const,
        title: 'John Doe',
        description: 'AI Club Member',
        icon: <Users className="w-5 h-5 text-emerald-500" />
      },
      {
        id: '3',
        type: 'news' as const,
        title: 'Latest AI Trends',
        description: 'Stay updated with AI developments',
        icon: <Newspaper className="w-5 h-5 text-emerald-500" />
      }
    ].filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase())
    );

    setSearchResults(results);
    setIsSearching(false);
  };

  const handleSearchClick = () => {
    setIsSearchExpanded(true);
  };

  const handleSearchClose = () => {
    setIsSearchExpanded(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    performSearch(query);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  const handleResultClick = (result: SearchResult) => {
    // Handle navigation based on result type
    switch (result.type) {
      case 'event':
        navigate('/events');
        break;
      case 'member':
        navigate('/members');
        break;
      case 'news':
        navigate('/news');
        break;
    }
    handleSearchClose();
  };

  // Don't render layout for auth page
  if (location.pathname === '/auth') {
    return <>{children}</>;
  }

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>;
  }

  // Don't render layout if not authenticated (will redirect anyway)
  if (!isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500 mx-auto mb-4"></div>
        <p className="text-gray-400">Redirecting to login...</p>
      </div>
    </div>;
  }

  // Get user's first name for welcome message
  const getFirstName = (fullName: string) => {
    if (!fullName) return 'User';
    return fullName.split(' ')[0];
  };

  return (
    <div className="mobile-container bg-white dark:bg-gray-900 min-h-screen">
      {/* Fixed Top Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50">
                 <div className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 dark:from-gray-800 dark:via-gray-900 dark:to-black rounded-b-3xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/20 dark:bg-white/10 flex items-center justify-center">
                <img src="/Assets/Logo.png" alt="AI Biz Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-white text-lg font-bold font-avigea tracking-[1px]">AI Biz</h1>
                <p className="text-white/80 dark:text-white/70 text-sm mt-[-5px]">
                  Welcome back, {getFirstName(user.name)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative" ref={searchContainerRef}>
                <button 
                  onClick={handleSearchClick}
                  className={`w-10 h-10 bg-white/20 dark:bg-white/10 rounded-xl hover:bg-white/30 dark:hover:bg-white/20 transition-all duration-300 flex items-center justify-center ${
                    isSearchExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'
                  }`}
                >
                  <Search className="w-5 h-5 text-white" />
                </button>
                
                {isSearchExpanded && (
                  <div className="absolute right-0 top-0 z-50">
                                         <div className="w-[320px] bg-white/80 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transform transition-all duration-300 origin-top-right">
                                                                      <form 
                           onSubmit={handleSearchSubmit}
                           className="flex items-center px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90"
                         >
                        <Search className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={searchQuery}
                          onChange={handleSearchChange}
                          placeholder="Search events, news, members..."
                          className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleSearchClose}
                          className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors ml-2"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </form>

                                             {/* Search Results */}
                       <div className="max-h-[300px] overflow-y-auto bg-white/80 dark:bg-gray-800/80">
                        {isSearching ? (
                          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 dark:border-gray-500 mx-auto mb-2"></div>
                            Searching...
                          </div>
                        ) : searchResults.length > 0 ? (
                          <div className="py-2">
                            {searchResults.map((result) => (
                                                                                              <button
                                   key={result.id}
                                   onClick={() => handleResultClick(result)}
                                   className="w-full px-4 py-2 flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                 >
                                {result.icon}
                                <div className="flex-1 text-left">
                                  <div className="text-gray-900 dark:text-white font-medium">{result.title}</div>
                                  <div className="text-gray-700 dark:text-gray-300 text-sm">{result.description}</div>
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : searchQuery ? (
                          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                            No results found
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <button 
                onClick={openUserProfile}
                className="w-10 h-10 bg-white/20 dark:bg-white/10 rounded-xl hover:bg-white/30 dark:hover:bg-white/20 transition-colors overflow-hidden flex items-center justify-center"
              >
                <ProfilePictureUpload 
                  size="md"
                  showUploadButton={false}
                  className="w-full h-full rounded-xl"
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-16 w-full bg-white dark:bg-gray-900 pt-[88px]">
        <div className="bg-white dark:bg-gray-900">
          {children}
        </div>
      </main>

      {/* User Profile Modal */}
      <UserProfile 
        isOpen={showUserProfile} 
        onClose={closeUserProfile}
      />

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <BottomNavigation onNavigate={closeUserProfile} />
      </div>
    </div>
  );
};

export default Layout;
