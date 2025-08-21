import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Search } from 'lucide-react';

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchDialog: React.FC<SearchDialogProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Mock search results - in real app this would connect to your search API
    if (query.trim()) {
      const mockResults = [
        { type: 'Article', title: 'AI Ethics in Modern Applications', category: 'News' },
        { type: 'Event', title: 'Machine Learning Workshop', category: 'Events' },
        { type: 'Resource', title: 'Deep Learning Guide', category: 'Resources' },
        { type: 'Post', title: 'CNN Implementation Discussion', category: 'Social' },
      ].filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(mockResults);
    } else {
      setSearchResults([]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl animate-scale-in max-h-[50vh] overflow-hidden flex flex-col rounded-3xl top-[10%] translate-y-0">
        <DialogHeader className="px-3 pt-3">
          <DialogTitle className="text-base font-bold text-gray-900 dark:text-white">Search</DialogTitle>
        </DialogHeader>

        <div className="relative px-3 mb-2">
          <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search articles, events, resources..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-7 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-600 dark:text-white"
          />
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-3">
          {searchQuery && searchResults.length > 0 && (
            <div className="space-y-2">
              {searchResults.map((result, index) => (
                <div 
                  key={index}
                  className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">{result.title}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{result.category}</p>
                    </div>
                    <span className="text-xs bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
                      {result.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {searchQuery && searchResults.length === 0 && (
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">No results found for "{searchQuery}"</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;
