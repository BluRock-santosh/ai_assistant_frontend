import React from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

// Define the DynamicSuggestion type
export type DynamicSuggestion = {
  id: string;
  text: string;
  icon?: React.ReactNode;
};

interface DynamicSuggestionsProps {
  suggestions: DynamicSuggestion[];
  onSuggestionClick: (suggestion: DynamicSuggestion) => void;
  visible: boolean;
}

const DynamicSuggestions: React.FC<DynamicSuggestionsProps> = ({
  suggestions,
  onSuggestionClick,
  visible
}) => {
  if (!visible || suggestions.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: 10, height: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="mt-3 space-y-2"
      >
        <div className="text-xs text-gray-500 font-medium mb-2">
          💡 Suggestions based on your message:
        </div>
        
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <motion.div
              key={suggestion.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.2 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSuggestionClick(suggestion)}
                className={`
                  text-xs font-semibold transition-all duration-200
                  border-2 border-blue-400 bg-blue-50 text-blue-700 shadow-sm
                  hover:bg-blue-100 hover:border-blue-500 hover:text-blue-800
                  focus-visible:ring-2 focus-visible:ring-blue-300
                  rounded-lg px-3 py-1 flex items-center gap-1
                `}
              >
                <span className="mr-1">{suggestion.icon}</span>
                {suggestion.text}
              </Button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DynamicSuggestions; 