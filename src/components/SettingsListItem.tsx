import React from 'react';
import { ChevronRight } from 'lucide-react';

interface SettingsListItemProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  type: 'toggle' | 'navigation';
  value?: boolean;
  onChange?: (value: boolean) => void;
  onClick?: () => void;
  colorClass?: string;
}

const SettingsListItem: React.FC<SettingsListItemProps> = ({
  icon,
  label,
  description,
  type,
  value,
  onChange,
  onClick,
  colorClass = 'text-gray-600'
}) => {
  return (
    <div 
      className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
      onClick={type === 'navigation' ? onClick : undefined}
    >
      <div className="flex items-center space-x-3">
        <div className={`${colorClass}`}>
          {icon}
        </div>
        <span className="text-gray-900 dark:text-gray-100 font-medium">{label}</span>
        {description && <div className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">{description}</div>}
      </div>
      
      {type === 'toggle' ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onChange?.(!value);
          }}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
            value ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              value ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      ) : (
        <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
      )}
    </div>
  );
};

export default SettingsListItem; 