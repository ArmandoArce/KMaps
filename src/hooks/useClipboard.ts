import { useState } from 'react';
import { useLocation } from 'react-router-dom';

function useClipboard() {
    const [isCopied, setIsCopied] = useState(false);
    const location = useLocation();

    const copyToClipboard = async (text) => {
        if ('clipboard' in navigator) {
            await navigator.clipboard.writeText(text);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } else {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
            } catch (err) {
                console.error('Unable to copy to clipboard', err);
            }
            document.body.removeChild(textArea);
        }
    };

    const generateShareUrl = (latitude, longitude) => {
        const baseUrl = `${window.location.protocol}//${window.location.host}${location.pathname}`;
        return `${baseUrl}?lat=${latitude}&lng=${longitude}`;
    };

    return { copyToClipboard, generateShareUrl, isCopied };
}

export default useClipboard;