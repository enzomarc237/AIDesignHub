import React, { useRef } from 'react';
import UploadIcon from './icons/UploadIcon';
import SearchBar from './SearchBar';

interface HeaderProps {
    onFileUpload: (file: File) => void;
    searchTerm: string;
    onSearchTermChange: (term: string) => void;
    isLoading: boolean;
}

const Header: React.FC<HeaderProps> = ({ onFileUpload, searchTerm, onSearchTermChange, isLoading }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onFileUpload(file);
        }
    };

    return (
        <header className="bg-gray-800/80 backdrop-blur-sm sticky top-0 z-10 shadow-lg p-4 border-b border-gray-700">
            <div className="container mx-auto flex justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.41 1.41L16.17 10H4v2h12.17l-5.58 5.59L12 19l8-8-8-8z"/></svg>
                    <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                        AI Design Hub
                    </h1>
                </div>
                <div className="flex-1 max-w-xl">
                    <SearchBar value={searchTerm} onChange={onSearchTermChange} />
                </div>
                <div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/png, image/jpeg, image/webp"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleUploadClick}
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-105 shadow-md sm:w-32 disabled:bg-blue-800 disabled:cursor-wait disabled:scale-100"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="hidden sm:inline">Analyzing...</span>
                            </>
                        ) : (
                            <>
                                <UploadIcon />
                                <span className="hidden sm:inline">Upload</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;