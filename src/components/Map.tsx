import React, { useEffect, useRef } from 'react';

interface MapProps {
    locations: {
        id: string;
        name: string;
        latitude: number;
        longitude: number;
    }[];
    onMarkerClick: (id: string) => void;
    onMapClick: (lat: number, lng: number) => void;
}

declare global {
    interface Window {
        google: any;
    }
}

const Map: React.FC<MapProps> = ({ locations, onMarkerClick, onMapClick }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);

    useEffect(() => {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        const scriptId = "googleMapsScript";
        let script = document.getElementById(scriptId) as HTMLScriptElement | null;

        if (!script) {
            script = document.createElement("script");
            script.id = scriptId;
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
            script.async = true;
            document.body.appendChild(script);

            (window as any).initMap = () => {
                if (mapRef.current) {
                    const map = new window.google.maps.Map(mapRef.current, {
                        center: locations[0]
                            ? { lat: locations[0].latitude, lng: locations[0].longitude }
                            : { lat: 0, lng: 0 },
                        zoom: 10,
                    });

                    mapInstance.current = map;

                    map.addListener('click', (event: any) => {
                        onMapClick(event.latLng.lat(), event.latLng.lng());
                    });

                    updateMarkers(); 
                }
            };
        } else if (typeof window.google === 'object' && typeof window.google.maps === 'object') {
            (window as any).initMap();
        }

        return () => {};
    }, [onMarkerClick, onMapClick]);

    useEffect(() => {
        updateMarkers();
    }, [locations]);

    const updateMarkers = () => {
        if (mapInstance.current) {
           
            mapInstance.current.markers?.forEach((marker: any) => marker.setMap(null));
            mapInstance.current.markers = [];
    
           
            locations.forEach((location) => {
                const marker = new window.google.maps.Marker({
                    position: { lat: location.latitude, lng: location.longitude },
                    map: mapInstance.current,
                    title: location.name,
                });
    
                marker.addListener('click', () => {
                    onMarkerClick(location.id);
                });
    
                mapInstance.current.markers.push(marker);
            });
        }
    };

    return <div ref={mapRef} style={{ width: "100%", height: "400px" }} />;
};

export default Map;