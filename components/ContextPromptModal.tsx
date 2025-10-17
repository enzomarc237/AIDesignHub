import React, { useState } from 'react';
import type { Screenshot } from '../types';
import CloseIcon from './icons/CloseIcon';
import Spinner from './Spinner';

interface ContextPromptModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (prompt: string) => Promise<string>;
    contextScreenshots: Screenshot[];
}

const ContextPromptModal: React.FC<ContextPromptModalProps> = ({ isOpen, onClose, onSubmit, contextScreenshots }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        setError(null);
        setResult(null);
        try {
            const response = await onSubmit(prompt);
            setResult(response);
        } catch (err) {
            setError('Failed to get a response from the AI. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleClose = () => {
        setPrompt('');
        setResult(null);
        setError(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={handleClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                {isLoading && <Spinner message="Thinking..." />}
                <header className="flex justify-between items-center p-4 border-b border-gray-700 shrink-0">
                    <h2 className="text-xl font-bold text-white">Generate with Context</h2>
                    <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors">
                        <CloseIcon />
                    </button>
                </header>

                <main className="flex-1 p-6 overflow-y-auto space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-blue-300 mb-2">Context Images</h3>
                        <div className="flex flex-wrap gap-4">
                            {contextScreenshots.map(s => (
                                <img key={s.id} src={s.imageUrl} alt={s.title} className="h-24 w-auto object-contain rounded-md border-2 border-gray-700" />
                            ))}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="prompt" className="block text-lg font-semibold text-blue-300 mb-2">Your Prompt</label>
                        <textarea id="prompt" value={prompt} onChange={e => setPrompt(e.target.value)} rows={5} placeholder="e.g., Generate a landing page concept that combines the minimalist style of the first image with the color palette of the second." className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                    </div>
                    
                    {result && (
                        <div>
                            <h3 className="text-lg font-semibold text-blue-300 mb-2">AI Response</h3>
                            <div className="bg-gray-900 p-4 rounded-md whitespace-pre-wrap text-gray-200">
                                {result}
                            </div>
                        </div>
                    )}
                    
                    {error && <div className="text-red-400 bg-red-900/50 p-3 rounded-lg">{error}</div>}
                </main>

                <footer className="p-4 border-t border-gray-700 shrink-0">
                    <button 
                        onClick={handleSubmit} 
                        disabled={isLoading || !prompt.trim()}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:bg-green-800 disabled:cursor-not-allowed"
                    >
                        Generate
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default ContextPromptModal;
