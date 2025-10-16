
import React, { useState, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Screenshot, DesignSpecification } from './types';
import { analyzeImageForDesign } from './services/geminiService';
import Header from './components/Header';
import ImageGrid from './components/ImageGrid';
import ImageDetailModal from './components/ImageDetailModal';
import Spinner from './components/Spinner';

const App: React.FC = () => {
    const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedScreenshot, setSelectedScreenshot] = useState<Screenshot | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');

    const handleFileUpload = useCallback(async (file: File) => {
        setIsLoading(true);
        setError(null);
        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = (reader.result as string).split(',')[1];
                const imageUrl = URL.createObjectURL(file);

                const designSpecs = await analyzeImageForDesign(base64String, file.type);
                
                const newScreenshot: Screenshot = {
                    id: uuidv4(),
                    title: file.name,
                    description: '',
                    tags: [],
                    imageUrl,
                    file,
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

    const filteredScreenshots = useMemo(() => {
        if (!searchTerm) return screenshots;
        const lowercasedTerm = searchTerm.toLowerCase();
        return screenshots.filter(s =>
            s.title.toLowerCase().includes(lowercasedTerm) ||
            s.description.toLowerCase().includes(lowercasedTerm) ||
            s.tags.some(tag => tag.toLowerCase().includes(lowercasedTerm))
        );
    }, [screenshots, searchTerm]);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
            <Header onFileUpload={handleFileUpload} searchTerm={searchTerm} onSearchTermChange={setSearchTerm} />
            
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
        </div>
    );
};

export default App;
