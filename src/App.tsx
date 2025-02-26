import { useState, useEffect } from 'react';
import Map from './components/Map';
import { getUserLocation, Location as GeoLocation } from './services/geolocation';
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

    const initialFormValues: { name: string; latitude: string; longitude: string } = {
        name: '',
        latitude: '',
        longitude: ''
    };
    
    const {
        handleChange,
        handleSubmit,
        values,
        errors,
        resetForm
    } = useForm({ initialValues: initialFormValues, validate: validate });

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
                setUserLocation({
                    name: "URL Location",
                    latitude: parsedLat,
                    longitude: parsedLng
                });
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
            .then((location: GeoLocation) => setUserLocation({
                name: "Your Location",
                latitude: location.latitude,
                longitude: location.longitude
            }))
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
            <div>
                <h1>{title}</h1>
                <button onClick={handleGetUserLocation}>Get My Location</button>
                {userLocation && (
                    <button onClick={handleShareLocation}>
                        {isCopied ? 'Copied!' : 'Share My Location'}
                    </button>
                )}

                <form onSubmit={(e) => { handleSubmit(e); handleAddLocation(); }}>
                    <input
                        type="text"
                        name="name"
                        placeholder="Name"
                        value={values.name}
                        onChange={handleChange}
                    />
                    {errors.name && <p>{errors.name}</p>}
                    <input
                        type="number"
                        name="latitude"
                        placeholder="Latitude"
                        value={values.latitude}
                        onChange={handleChange}
                    />
                    {errors.latitude && <p>{errors.latitude}</p>}
                    <input
                        type="number"
                        name="longitude"
                        placeholder="Longitude"
                        value={values.longitude}
                        onChange={handleChange}
                    />
                    {errors.longitude && <p>{errors.longitude}</p>}
                    <button type="submit">Add Location</button>
                </form>

                <h2>Location List</h2>
                <ul>
                    {locations.map((location, index) => (
                        <li key={index}>
                            {location.name} - {location.latitude}, {location.longitude}
                        </li>
                    ))}
                </ul>
            </div>
            <div style={{ width: '70%', height: '500px' }}>
                {locations.length > 0 ? (
                    <Map locations={locations} />
                ) : (
                    <p>No locations to display.</p>
                )}
            </div>
        </div>
    );
}

export default App;