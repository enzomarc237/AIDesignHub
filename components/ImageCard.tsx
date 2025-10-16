
import React from 'react';
import type { Screenshot } from '../types';
import Tag from './Tag';

interface ImageCardProps {
    screenshot: Screenshot;
    onClick: () => void;
}

const ImageCard: React.FC<ImageCardProps> = ({ screenshot, onClick }) => {
    return (
        <div 
            className="group cursor-pointer bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 transform hover:-translate-y-1"
            onClick={onClick}
        >
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
    );
};

export default ImageCard;
