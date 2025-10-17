
import React from 'react';
import type { Screenshot } from '../types';
import ImageCard from './ImageCard';

interface ImageGridProps {
    screenshots: Screenshot[];
    onSelectScreenshot: (screenshot: Screenshot) => void;
    contextSelection: string[];
    onToggleContextSelection: (screenshotId: string) => void;
}

const ImageGrid: React.FC<ImageGridProps> = ({ screenshots, onSelectScreenshot, contextSelection, onToggleContextSelection }) => {
    if (screenshots.length === 0) {
        return null; // The parent component handles the empty state message
    }
    
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {screenshots.map(screenshot => (
                <ImageCard
                    key={screenshot.id}
                    screenshot={screenshot}
                    onClick={() => onSelectScreenshot(screenshot)}
                    isSelected={contextSelection.includes(screenshot.id)}
                    onToggleSelection={() => onToggleContextSelection(screenshot.id)}
                />
            ))}
        </div>
    );
};

export default ImageGrid;