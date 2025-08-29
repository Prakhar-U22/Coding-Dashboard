import React from 'react';
import { AlertCircle } from 'lucide-react';

export const ErrorMessage = ({ message }) => {
  return (
    <div className="bg-red-900/50 text-red-300 border-l-4 border-red-500 p-4 rounded-md flex items-center gap-3 animate-fade-in mt-4">
      <AlertCircle className="w-6 h-6 flex-shrink-0" />
      <div>
        <p className="font-semibold">Error</p>
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
};
