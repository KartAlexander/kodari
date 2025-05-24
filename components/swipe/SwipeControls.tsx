import React from 'react';
import { X, Heart } from 'lucide-react';
import Button from '../ui/Button';

interface SwipeControlsProps {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

const SwipeControls: React.FC<SwipeControlsProps> = ({ onSwipeLeft, onSwipeRight }) => {
  return (
    <div className="flex justify-center gap-6 mt-6">
      <Button
        variant="outline"
        size="lg"
        className="h-14 w-14 rounded-full border-2 border-error-400 text-error-500 hover:bg-error-50"
        onClick={onSwipeLeft}
      >
        <X size={24} />
      </Button>
      
      <Button
        variant="outline"
        size="lg"
        className="h-14 w-14 rounded-full border-2 border-success-400 text-success-500 hover:bg-success-50"
        onClick={onSwipeRight}
      >
        <Heart size={24} />
      </Button>
    </div>
  );
};

export default SwipeControls;