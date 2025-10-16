
import React from 'react';

interface SpinnerProps {
    message?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ message = "Loading..." }) => {
    return (
        <div className="fixed inset-0 bg-gray-900/80 flex flex-col items-center justify-center z-50">
            <div className="w-16 h-16 border-4 border-blue-400 border-dashed rounded-full animate-spin"></div>
            <p className="mt-4 text-lg text-white font-semibold">{message}</p>
        </div>
    );
};

export default Spinner;
