import React, { useState, useEffect } from 'react';
import Map from './components/Map';
import { getUserLocation } from './services/geolocation';
import useLocalStorage from './hooks/useLocalStorage';
import useForm from './hooks/useForm';
import validate from './hooks/validate';
import useDocumentTitle from './hooks/useDocumentTitle';
import useClipboard from './hooks/useClipboard';
import useQueryParameters from './hooks/useQueryParameters';
interface Location {
    name: string;
    latitude: number;
    longitude: number;
}
function App() {
    const [locations, setLocations] = useState<Location[]>([]);
    const [userLocation, setUserLocation] = useState<Location | null>(null);
    const [title, setTitle] = useState<string>('Location Map');
    const [savedLocation, setSavedLocation] = useLocalStorage<Location | null>('userLocation', null);
    const {
        handleChange,
        handleSubmit,
        values,
        errors,
        resetForm
    } = useForm({ name: '', latitude: '', longitude: '' }, validate);
    useDocumentTitle(title);
    const { copyToClipboard, generateShareUrl, isCopied } = useClipboard();
    const { queryParams } = useQueryParameters();
    useEffect(() => {
        if (savedLocation) {
            setUserLocation(savedLocation);
        } else if (queryParams.lat && queryParams.lng) {
            const { lat, lng } = queryParams;
            const parsedLat = parseFloat(lat);
            const parsedLng = parseFloat(lng);
            if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
                setUserLocation({ latitude: parsedLat, longitude: parsedLng });
            } else {
                handleGetUserLocation();
            }
        } else {
            handleGetUserLocation();
        }
    }, [queryParams, savedLocation]);
    useEffect(() => {
        if (userLocation) {
            setLocations([
                {
                    name: "Your Location",
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                },
                ...locations,
            ]);
            setTitle(`Your location is: ${userLocation.latitude}, ${userLocation.longitude}`);
            setSavedLocation(userLocation);
        }
    }, [userLocation]);
    const handleGetUserLocation = () => {
        getUserLocation()
            .then(setUserLocation)
            .catch((error) => console.error("Error obtaining location:", error));
    };
    const handleAddLocation = () => {
        if (Object.keys(errors).length === 0 && values.name && values.latitude && values.longitude) {
            setLocations([
                ...locations,
                {
                    name: values.name,
                    latitude: parseFloat(values.latitude),
                    longitude: parseFloat(values.longitude),
                },
            ]);
            resetForm();
        }
    };
    const handleShareLocation = () => {
        if (userLocation) {
            const shareUrl = generateShareUrl(userLocation.latitude, userLocation.longitude);
            copyToClipboard(shareUrl);
        }
    };
    return (
        <div style={{ display: 'flex' }}>
            {/* ... */}
        </div>
    );
}
export default App;