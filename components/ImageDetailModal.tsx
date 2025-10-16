import React, { useState, useEffect, KeyboardEvent } from 'react';
import type { Screenshot, UIComponent, ColorInfo, TypographyInfo } from '../types';
import CloseIcon from './icons/CloseIcon';
import Tag from './Tag';
import { generateMarkdown } from '../utils/markdownGenerator';

interface ImageDetailModalProps {
    screenshot: Screenshot;
    onClose: () => void;
    onUpdate: (screenshot: Screenshot) => void;
    onDelete: (screenshotId: string) => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-6">
        <h3 className="text-lg font-semibold text-blue-300 border-b border-gray-600 pb-2 mb-3">{title}</h3>
        {children}
    </div>
);

const DetailItem: React.FC<{ label: string; value: string | React.ReactNode }> = ({ label, value }) => (
    <div className="flex items-start mb-1">
        <span className="font-semibold text-gray-400 w-28 shrink-0">{label}:</span>
        <span className="text-gray-200">{value}</span>
    </div>
);

const ImageDetailModal: React.FC<ImageDetailModalProps> = ({ screenshot, onClose, onUpdate, onDelete }) => {
    const [title, setTitle] = useState(screenshot.title);
    const [description, setDescription] = useState(screenshot.description);
    const [tags, setTags] = useState(screenshot.tags);
    const [tagInput, setTagInput] = useState('');
    const [copyButtonText, setCopyButtonText] = useState('Copy Specs');

    const hasSpecs = !!screenshot.designSpecs;

    useEffect(() => {
        const handleKeyDown = (event: globalThis.KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    const handleSave = () => {
        onUpdate({ ...screenshot, title, description, tags });
        onClose();
    };

    const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && tagInput.trim() !== '') {
            e.preventDefault();
            if (!tags.includes(tagInput.trim())) {
                setTags([...tags, tagInput.trim()]);
            }
            setTagInput('');
        }
    };
    
    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete this screenshot? This action cannot be undone.")) {
            onDelete(screenshot.id);
        }
    }

    const handleCopyToClipboard = () => {
        if (!hasSpecs) return;
        const markdown = generateMarkdown(screenshot);
        navigator.clipboard.writeText(markdown).then(() => {
            setCopyButtonText('Copied!');
            setTimeout(() => setCopyButtonText('Copy Specs'), 2000);
        }, (err) => {
            console.error('Could not copy text: ', err);
            setCopyButtonText('Failed!');
            setTimeout(() => setCopyButtonText('Copy Specs'), 2000);
        });
    };

    const handleExportMarkdown = () => {
        if (!hasSpecs) return;
        const markdown = generateMarkdown(screenshot);
        const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const filename = `${screenshot.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'design_specs'}.md`;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };


    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b border-gray-700 shrink-0">
                    <h2 className="text-xl font-bold text-white truncate">{screenshot.title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <CloseIcon />
                    </button>
                </header>
                
                <div className="flex-1 flex overflow-hidden">
                    <div className="w-2/3 p-6 bg-gray-900 flex items-center justify-center overflow-auto">
                        <img src={screenshot.imageUrl} alt={screenshot.title} className="max-w-full max-h-full object-contain rounded-md" />
                    </div>
                    
                    <div className="w-1/3 p-6 overflow-y-auto">
                        <Section title="Metadata">
                            <div className="mb-4">
                                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                                <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                                <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Tags</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {tags.map(tag => (
                                        <div key={tag} className="flex items-center bg-blue-900/50 rounded-full">
                                            <span className="px-3 py-1 text-sm text-blue-200">{tag}</span>
                                            <button onClick={() => removeTag(tag)} className="pr-2 text-blue-200 hover:text-white">&times;</button>
                                        </div>
                                    ))}
                                </div>
                                <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown} placeholder="Add a tag and press Enter" className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                        </Section>

                        {screenshot.designSpecs && (
                            <>
                                <Section title="AI Analysis">
                                    <DetailItem label="Design Style" value={screenshot.designSpecs.generalDesignInfo.perceivedStyle} />
                                    <DetailItem label="Layout" value={screenshot.designSpecs.layoutStructure.description} />
                                    <DetailItem label="Notes" value={screenshot.designSpecs.generalDesignInfo.notes} />
                                </Section>

                                <Section title="Color Palette">
                                    <div className="flex flex-wrap gap-3">
                                        {screenshot.designSpecs.colorPalette.map(({ hex, role }) => (
                                            <div key={hex+role} className="text-center" title={`${role}: ${hex}`}>
                                                <div className="w-10 h-10 rounded-full border-2 border-gray-500" style={{ backgroundColor: hex }}></div>
                                                <p className="text-xs mt-1 text-gray-400">{hex}</p>
                                            </div>
                                        ))}
                                    </div>
                                </Section>

                                <Section title="Typography">
                                    {screenshot.designSpecs.typography.map((typo, i) => (
                                        <div key={i} className="mb-3 p-3 bg-gray-700/50 rounded-lg">
                                            <p className="font-semibold text-gray-200" style={{ fontFamily: typo.fontFamily, fontSize: '1rem', fontWeight: typo.fontWeight, color: typo.colorHex }}>{typo.context}</p>
                                            <p className="text-xs text-gray-400">{typo.fontFamily}, {typo.fontSize}, {typo.fontWeight}</p>
                                        </div>
                                    ))}
                                </Section>

                                <Section title="UI Components">
                                    <div className="space-y-2">
                                    {screenshot.designSpecs.uiComponents.map((comp, i) => (
                                        <div key={i} className="p-3 bg-gray-700/50 rounded-lg">
                                            <p className="font-semibold text-gray-200 capitalize">{comp.type}</p>
                                            {comp.label && <p className="text-sm text-gray-300 italic">"{comp.label}"</p>}
                                        </div>
                                    ))}
                                    </div>
                                </Section>
                            </>
                        )}
                        {!screenshot.designSpecs && <p className="text-gray-500">No AI analysis data available.</p>}
                    </div>
                </div>

                <footer className="flex justify-between items-center p-4 border-t border-gray-700 shrink-0">
                    <div className="flex items-center gap-2">
                        <button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                           Delete
                       </button>
                        <button 
                            onClick={handleCopyToClipboard} 
                            disabled={!hasSpecs}
                            className="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors w-32 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-600"
                        >
                           {copyButtonText}
                       </button>
                       <button 
                            onClick={handleExportMarkdown} 
                            disabled={!hasSpecs}
                            className="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-600"
                        >
                           Export MD
                       </button>
                    </div>
                    <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                        Save & Close
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default ImageDetailModal;