import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Screenshot, DesignSpecification } from './types';
import { analyzeImageForDesign, generateWithContext } from './services/geminiService';
import Header from './components/Header';
import ImageGrid from './components/ImageGrid';
import ImageDetailModal from './components/ImageDetailModal';
import Spinner from './components/Spinner';
import ContextActionBar from './components/ContextActionBar';
import ContextPromptModal from './components/ContextPromptModal';

const App: React.FC = () => {
    const [screenshots, setScreenshots] = useState<Screenshot[]>(() => {
        try {
            const saved = localStorage.getItem('screenshots');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error("Failed to load screenshots from local storage:", error);
            return [];
        }
    });

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedScreenshot, setSelectedScreenshot] = useState<Screenshot | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [contextSelection, setContextSelection] = useState<string[]>([]);
    const [isContextModalOpen, setIsContextModalOpen] = useState<boolean>(false);

    useEffect(() => {
        try {
            localStorage.setItem('screenshots', JSON.stringify(screenshots));
        } catch (error) {
            console.error("Failed to save screenshots to local storage:", error);
        }
    }, [screenshots]);

    const handleFileUpload = useCallback(async (file: File) => {
        setIsLoading(true);
        setError(null);
        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const imageUrl = reader.result as string;
                const base64String = imageUrl.split(',')[1];

                const designSpecs = await analyzeImageForDesign(base64String, file.type);
                
                const newScreenshot: Screenshot = {
                    id: uuidv4(),
                    title: file.name,
                    description: '',
                    tags: [],
                    imageUrl,
                    designSpecs,
                };
                setScreenshots(prev => [newScreenshot, ...prev]);
            };
            reader.readAsDataURL(file);
        } catch (err) {
            console.error("Error during file processing or AI analysis:", err);
            setError("Failed to analyze the design. Please check your API key and try again.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleUpdateScreenshot = useCallback((updatedScreenshot: Screenshot) => {
        setScreenshots(prev => prev.map(s => s.id === updatedScreenshot.id ? updatedScreenshot : s));
    }, []);

    const handleDeleteScreenshot = useCallback((screenshotId: string) => {
        setScreenshots(prev => prev.filter(s => s.id !== screenshotId));
        setSelectedScreenshot(null);
    }, []);

    const handleToggleContextSelection = useCallback((screenshotId: string) => {
        setContextSelection(prev => 
            prev.includes(screenshotId)
                ? prev.filter(id => id !== screenshotId)
                : [...prev, screenshotId]
        );
    }, []);

    const handleClearContextSelection = useCallback(() => {
        setContextSelection([]);
    }, []);
    
    const handleContextSubmit = useCallback(async (prompt: string): Promise<string> => {
        const contextScreenshots = screenshots.filter(s => contextSelection.includes(s.id));
        
        const imagesToProcess = contextScreenshots.map(s => {
            const base64ImageData = s.imageUrl.split(',')[1];
            const mimeType = s.imageUrl.substring(s.imageUrl.indexOf(':') + 1, s.imageUrl.indexOf(';'));
            return { base64ImageData, mimeType };
        });

        if (imagesToProcess.length === 0) {
            throw new Error("No images selected for context.");
        }
        
        return await generateWithContext(prompt, imagesToProcess);
    }, [contextSelection, screenshots]);

    const contextScreenshots = useMemo(() => 
        screenshots.filter(s => contextSelection.includes(s.id)),
        [contextSelection, screenshots]
    );

    const filteredScreenshots = useMemo(() => {
        const trimmedSearch = searchTerm.trim();
        if (!trimmedSearch) return screenshots;

        const searchTokens = trimmedSearch.toLowerCase().split(/\s+/).filter(Boolean);

        return screenshots.filter(screenshot => {
            const searchableContent = [
                screenshot.title,
                screenshot.description,
                ...screenshot.tags,
                screenshot.designSpecs?.generalDesignInfo?.perceivedStyle || '',
                screenshot.designSpecs?.layoutStructure?.description || ''
            ].join(' ').toLowerCase();

            return searchTokens.every(token => searchableContent.includes(token));
        });
    }, [screenshots, searchTerm]);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
            <Header onFileUpload={handleFileUpload} searchTerm={searchTerm} onSearchTermChange={setSearchTerm} isLoading={isLoading} />
            
            <main className="p-4 sm:p-6 lg:p-8">
                {isLoading && <Spinner message="AI is analyzing your design..." />}
                {error && <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg my-4">{error}</div>}
                
                {!isLoading && screenshots.length === 0 && (
                    <div className="text-center py-20">
                        <h2 className="text-2xl font-semibold text-gray-400 mb-2">Your Inspiration Hub is Empty</h2>
                        <p className="text-gray-500">Upload your first UI screenshot to get started.</p>
                    </div>
                )}

                <ImageGrid 
                    screenshots={filteredScreenshots} 
                    onSelectScreenshot={setSelectedScreenshot}
                    contextSelection={contextSelection}
                    onToggleContextSelection={handleToggleContextSelection}
                />
            </main>

            {selectedScreenshot && (
                <ImageDetailModal
                    screenshot={selectedScreenshot}
                    onClose={() => setSelectedScreenshot(null)}
                    onUpdate={handleUpdateScreenshot}
                    onDelete={handleDeleteScreenshot}
                />
            )}

            {contextSelection.length > 0 && (
                <ContextActionBar 
                    count={contextSelection.length}
                    onUseAsContext={() => setIsContextModalOpen(true)}
                    onClearSelection={handleClearContextSelection}
                />
            )}

            <ContextPromptModal 
                isOpen={isContextModalOpen}
                onClose={() => setIsContextModalOpen(false)}
                onSubmit={handleContextSubmit}
                contextScreenshots={contextScreenshots}
            />
        </div>
    );
};

export default App;