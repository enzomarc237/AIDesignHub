import React from 'react';
import MagicIcon from './icons/MagicIcon';

interface ContextActionBarProps {
    count: number;
    onUseAsContext: () => void;
    onClearSelection: () => void;
}

const ContextActionBar: React.FC<ContextActionBarProps> = ({ count, onUseAsContext, onClearSelection }) => {
    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20">
            <div className="bg-gray-700/80 backdrop-blur-md rounded-lg shadow-2xl flex items-center gap-4 p-3 border border-gray-600">
                <p className="text-white font-semibold">
                    <span className="bg-blue-500 text-white rounded-full px-2.5 py-0.5 mr-2 text-sm">{count}</span>
                    {count === 1 ? 'item selected' : 'items selected'}
                </p>
                <button 
                    onClick={onUseAsContext}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors duration-200"
                >
                    <MagicIcon />
                    Use as Context
                </button>
                <button
                    onClick={onClearSelection}
                    className="text-gray-300 hover:text-white font-semibold py-2 px-2 rounded-lg transition-colors duration-200"
                >
                   &times; Clear
                </button>
            </div>
        </div>
    );
};

export default ContextActionBar;
