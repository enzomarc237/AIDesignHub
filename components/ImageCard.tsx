
import React from 'react';
import type { Screenshot } from '../types';
import Tag from './Tag';

interface ImageCardProps {
    screenshot: Screenshot;
    onClick: () => void;
    isSelected: boolean;
    onToggleSelection: () => void;
}

const ImageCard: React.FC<ImageCardProps> = ({ screenshot, onClick, isSelected, onToggleSelection }) => {
    const handleSelectionClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent opening the modal
        onToggleSelection();
    };
    
    return (
        <div 
            className={`group relative bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 transform hover:-translate-y-1 ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
        >
            <div 
                className="absolute top-2 right-2 z-10 w-6 h-6 bg-gray-900/50 rounded-full flex items-center justify-center cursor-pointer border-2 border-white/50 transition-all duration-200 hover:bg-gray-700"
                onClick={handleSelectionClick}
            >
                <div className={`w-3 h-3 rounded-full transition-all duration-200 ${isSelected ? 'bg-blue-400' : 'bg-transparent'}`}></div>
            </div>

            <div onClick={onClick} className="cursor-pointer">
                <div className="relative overflow-hidden">
                    <img 
                        src={screenshot.imageUrl} 
                        alt={screenshot.title} 
                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                </div>
                <div className="p-4">
                    <h3 className="text-white font-semibold truncate" title={screenshot.title}>{screenshot.title}</h3>
                    <div className="mt-2 flex flex-wrap gap-1 h-12 overflow-y-auto">
                        {screenshot.tags.slice(0, 3).map(tag => (
                            <Tag key={tag} label={tag} />
                        ))}
                        {screenshot.tags.length > 3 && <Tag label={`+${screenshot.tags.length-3}`} />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageCard;