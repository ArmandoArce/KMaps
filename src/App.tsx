import isImageURL from 'image-url-validator';

import React, { useState, useEffect } from 'react';
import { Root as AccordionRoot, Item as AccordionItem, Header as AccordionHeader, Trigger as AccordionTrigger, Content as AccordionContent } from '@radix-ui/react-accordion';
import { Checkbox } from '@radix-ui/react-checkbox';
import { HeartIcon, PlusIcon, MinusIcon, MapPinIcon, TrashIcon } from 'lucide-react';
import Map from './components/Map';
import useLocalStorage from './hooks/useLocalStorage';
import { useLocationManager } from './hooks/useLocationManager';
import useForm from './hooks/useForm';
import useDocumentTitle from './hooks/useDocumentTitle';
import { v4 as uuidv4 } from 'uuid';
import './styles.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination } from 'swiper/modules';

interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type?: string;
  description?: string;
  imageUrls?: string[];
  rating?: number;
  isFavorite?: boolean;
}

interface HikingPlace extends Location {
  type: string;
  description: string;
  imageUrls?: string[];
  rating: number;
}

interface FormValues {
  name: string;
  latitude: string;
  longitude: string;
  type: string;
  description: string;
  rating: string;
}

const App: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [title, setTitle] = useState<string>('Hiking Places Map');
  const [favoriteLocations, setFavoriteLocations] = useLocalStorage<Location[]>('favoriteLocations', []);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<string[]>([]);
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const initialFormValues: FormValues = {
    name: '',
    latitude: '',
    longitude: '',
    type: 'Trails',
    description: '',
    rating: ''
  };
  const {
    handleChange,
    handleSubmit,
    values,
    errors,
    resetForm
  } = useForm({
    initialValues: initialFormValues,
    validate: (values: FormValues) => {
      const errors: Partial<FormValues> = {};

      if (!values.name) {
        errors.name = 'Name is required';
      }

      const lat = parseFloat(values.latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        errors.latitude = 'Latitude must be between -90 and 90';
      }

      const lng = parseFloat(values.longitude);
      if (isNaN(lng) || lng < -180 || lng > 180) {
        errors.longitude = 'Longitude must be between -180 and 180';
      }

      const rating = parseFloat(values.rating);
      if (isNaN(rating) || rating < 10 || rating > 0) {
        errors.rating = 'Rating must be between 0 and 10';
      }

      return errors;
    }
  });

  useDocumentTitle(title);

  const sampleHikingData: HikingPlace[] = [
    /*{
      id: '1',
      name: 'Arenal Volcano National Park',
      latitude: 10.4626,
      longitude: -84.7032,
      description: 'Iconic volcano with hiking trails, hot springs, and stunning lake views.',
      imageUrls: [
        'https://d2xuzatlfjyc9k.cloudfront.net/wp-content/uploads/2014/05/Visit-Arenal-Volcano-National-Park-1.jpg',
        'https://www.arenal.net/img/U0ZXOLVFuU-480.jpeg',
        'https://upload.wikimedia.org/wikipedia/commons/3/3a/Arenal_volcano_%2870785p%29_%28cropped%29.jpg'
      ],
      rating: 9,
      type: 'Mountain'
    },
    {
      id: '2',
      name: 'Manuel Antonio National Park',
      latitude: 9.4087,
      longitude: -84.1457,
      description: 'Beautiful beaches, rainforest trails, and abundant wildlife including monkeys and sloths.',
      imageUrls: [
        'https://www.visitcostarica.com/sites/default/files/2024-10/Aerial%20Drone%20view%20of%20Manuel%20Antonio%20National%20Park%20in%20Costa%20Rica.%20.jpg',
        'https://iltcostarica.com/uploads/activity/images/6/0/60632247508ef518197056_2.jpg'
      ],
      rating: 8,
      type: 'Trails'
    },
    {
      id: '3',
      name: 'Monteverde Cloud Forest Reserve',
      latitude: 10.3235,
      longitude: -84.7956,
      description: 'Unique cloud forest with hanging bridges, diverse flora and fauna, and breathtaking views.',
      imageUrls: [
        'https://elbosquemonteverde.com/wp-content/uploads/sites/3174/2021/08/monteverde-cloud-forest-reserve.jpg?w=700&h=700&zoom=2',
        'https://mediaim.expedia.com/destination/1/e1e84d638ee9bc3a942f2e9f724ba527.jpg?impolicy=fcrop&w=450&h=280&q=medium'
      ],
      rating: 7,
      type: 'Camping'
    },
    {
      id: '4',
      name: 'La Paz Waterfall Gardens',
      latitude: 10.1554,
      longitude: -84.1165,
      description: 'Five stunning waterfalls, animal sanctuary, and beautiful gardens.',
      imageUrls: [
        'https://costarica.org/wp-content/uploads/2014/12/la-paz-waterfall-gardens-waterfall-view.jpg',
        'https://waterfallgardens.com/wp-content/uploads/2020/09/Brand-Video-Peace-Lodge-III_1-min.jpg'
      ],
      rating: 6,
      type: 'Waterfalls'
    }*/
  ];

  useEffect(() => {
    setLocations((prevLocations) => {
      let initialLocations = [...prevLocations];

      // Mantener los lugares existentes que no están en favoritos
      const nonFavoriteLocations = prevLocations.filter(
        (loc) => !favoriteLocations.some((fav) => fav.id === loc.id)
      );

      // Fusionar favoritos y no favoritos sin sobrescribir todo
      return [...favoriteLocations, ...nonFavoriteLocations];
    });
    console.log(locations)
  }, [favoriteLocations]);


  const filteredLocations = locations.filter(place => {
    if (showOnlyFavorites && !place.isFavorite) return false;

    if (selectedTypes.length > 0 && place.type && !selectedTypes.includes(place.type)) return false;
    if (selectedRatings.length > 0 && place.rating !== undefined) {
      const placeRating = place.rating;
      if (!selectedRatings.some(rating => {
        if (rating === 'Wonderful: 9+') return placeRating >= 9;
        if (rating === 'Very Good: 8+') return placeRating >= 8 && placeRating < 9;
        if (rating === 'Good: 7+') return placeRating >= 7 && placeRating < 8;
        if (rating === 'Pleasant: 6+') return placeRating >= 6 && placeRating < 7;
        if (rating === 'Ok: 5+') return placeRating >= 5 && placeRating < 6;
        return false;
      })) return false;
    }
    return true;
  });

  const mapLocations = React.useMemo(() => {
    const mapLocs: Location[] = [];
    const favoriteIds = favoriteLocations.map(loc => loc.id);

    mapLocs.push(...filteredLocations);

    favoriteLocations.forEach(fav => {
      if (!mapLocs.some(loc => loc.id === fav.id)) {
        const fullLocation = locations.find(loc => loc.id === fav.id);
        if (fullLocation) {
          mapLocs.push(fullLocation);
        }
      }
    });

    const uniqueMapLocs = mapLocs.filter((loc, index, self) =>
      index === self.findIndex((l) => (l.id === loc.id))
    );
    return uniqueMapLocs;
  }, [filteredLocations, favoriteLocations, locations]);


  const placeTypes = ['Mountain', 'Waterfalls', 'Trails', 'Camping', 'Nature Walks', 'Lodging'];

  const ratingOptions = ['Wonderful: 9+', 'Very Good: 8+', 'Good: 7+', 'Pleasant: 6+', 'Ok: 5+'];

  const toggleTypeSelection = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleRatingSelection = (rating: string) => {
    setSelectedRatings(prev =>
      prev.includes(rating) ? prev.filter(r => r !== rating) : [...prev, rating]
    );
  };

  const [tempImageUrl, setTempImageUrl] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const handleAddImage = async () => {
    const imageUrl = tempImageUrl.trim();

    if (imageUrl) {
      try {
        // Verifica si la URL corresponde a una imagen válida
        const response = await fetch(imageUrl, { method: 'HEAD' });

        // Verifica si la respuesta es exitosa y si el contenido es una imagen
        if (response.ok && response.headers.get('Content-Type')?.startsWith('image')) {
          setImageUrls([...imageUrls, imageUrl]);
          setTempImageUrl('');
        } else {
          alert('La URL no es una imagen válida o no existe.');
        }
      } catch (error) {
        alert('Error al intentar cargar la imagen. Verifica la URL.');
      }
    }
  };


  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleAddLocation = () => {
    if (Object.keys(errors).length === 0 && values.name && values.latitude && values.longitude) {
      const newLocation: HikingPlace = {
        id: uuidv4(),
        name: values.name,
        latitude: parseFloat(values.latitude),
        longitude: parseFloat(values.longitude),
        type: values.type || 'Trails',
        description: values.description || `A new hiking location at ${values.latitude}, ${values.longitude}`,
        imageUrls: imageUrls,
        rating: values.rating,
        isFavorite: false
      };

      const updatedLocations = [...locations, newLocation];
      setLocations(updatedLocations);

      resetForm();
      setIsAddingLocation(false);
      setImageUrls([]);
    }
  };

  const handleRemoveLocation = (id: string) => {
    if (favoriteLocations.some(loc => loc.id === id)) {
      setFavoriteLocations(prev => prev.filter(loc => loc.id !== id));
    }
    setLocations(prev => prev.filter(loc => loc.id !== id));
  };

  const handleToggleFavorite = (id: string) => {
    const locationToToggle = locations.find(location => location.id === id);
    if (!locationToToggle) return;

    const isCurrentlyFavorite = favoriteLocations.some(loc => loc.id === id);

    if (isCurrentlyFavorite) {
      setFavoriteLocations(prev => prev.filter(loc => loc.id !== id));
      setLocations(prev =>
        prev.map(loc => loc.id === id ? { ...loc, isFavorite: false } : loc)
      );
    } else {
      const updatedLocation = { ...locationToToggle, isFavorite: true };
      setFavoriteLocations(prev => [...prev, updatedLocation]);
      setLocations(prev =>
        prev.map(loc => loc.id === id ? { ...loc, isFavorite: true } : loc)
      );
    }

  };

  const handleToggleAddLocation = () => {
    if (isAddingLocation) {
      resetForm();
      setImageUrls([]);
    }
    setIsAddingLocation(!isAddingLocation);
  };

  const getCurrentLocation = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => {
            reject(error);
          }
        );
      } else {
        reject(new Error('Geolocation is not supported by this browser.'));
      }
    });
  };

  return (
    <div className="hiking-app">
      <div className="app-container">
      <div className="filter-panel accordion-panel">
          <AccordionRoot type="multiple" defaultValue={['new-location', 'filters']}>
            <AccordionItem value="new-location">
              <AccordionHeader>
                <AccordionTrigger className="accordion-trigger">
                  <h2>New Location</h2>
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionContent className="accordion-content">
                <div className="user-location-controls">
                  <div className="controls-row">
                    <button
                      className={`control-button ${isAddingLocation ? 'active' : ''}`}
                      onClick={handleToggleAddLocation}
                    >
                      <PlusIcon size={14} />
                      <span>{isAddingLocation ? 'Cancel' : 'Add Location'}</span>
                    </button>
                  </div>
                </div>
                {isAddingLocation && (
                  <div className="add-location-form">
                    {/* ... (formulario para agregar ubicación) */}
                    <h3>Add Hiking Location</h3>
                    <form onSubmit={(e) => { handleSubmit(e); handleAddLocation(); }}>
                      {/* ... (campos del formulario) */}
                      <div className="form-field">
                        <label>Name</label>
                        <input
                          type="text"
                          name="name"
                          placeholder="Location name"
                          value={values.name}
                          onChange={handleChange}
                        />
                        {errors.name && <p className="error">{errors.name}</p>}
                      </div>

                      <div className="form-field">
                        <label>Latitude</label>
                        <input
                          type="number"
                          name="latitude"
                          placeholder="Latitude"
                          value={values.latitude}
                          onChange={handleChange}
                        />
                        {errors.latitude && <p className="error">{errors.latitude}</p>}
                      </div>

                      <div className="form-field">
                        <label>Longitude</label>
                        <input
                          type="number"
                          name="longitude"
                          placeholder="Longitude"
                          value={values.longitude}
                          onChange={handleChange}
                        />
                        {errors.longitude && <p className="error">{errors.longitude}</p>}
                      </div>

                      <div className="form-field">
                        <label>Type</label>
                        <select
                          name="type"
                          value={values.type}
                          onChange={handleChange}
                        >
                          {placeTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-field">
                        <label>Rating</label>
                        <input
                          type="number"
                          name="rating"
                          placeholder="Rating"
                          value={values.rating}
                          onChange={handleChange}
                        />
                        {errors.longitude && <p className="error">{errors.rating}</p>}
                      </div>
                      <div className="form-field">
                        <label>Description</label>
                        <textarea
                          name="description"
                          placeholder="Brief description"
                          value={values.description}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-field">
                        <label>Image URL</label>
                        <input
                          type="text"
                          value={tempImageUrl}
                          onChange={(e) => setTempImageUrl(e.target.value)}
                          placeholder="Enter image URL"
                        />
                        <button type="button" className="add-image-button" onClick={handleAddImage}>
                          Add Image
                        </button>
                      </div>
                      <div className="image-thumbnails">
                        {imageUrls.map((url, index) => (
                          <div key={index} className="thumbnail">
                            <img src={url} alt={`Img ${index}`} className="small-image" />
                            <button type="button" onClick={() => handleRemoveImage(index)}>
                              X
                            </button>
                          </div>
                        ))}
                      </div>
                      <button className="form-submit-button" type="submit">Add Location</button>
                    </form>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="filters">
              <AccordionHeader>
                <AccordionTrigger className="accordion-trigger">
                  <h2>Filters</h2>
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionContent className="accordion-content">
                <div className="filter-container">
                  <div className="filter-options">
                    <div className="filter-section">
                      <h3>Favorites</h3>
                      <div className="checkbox-wrapper">
                        <Checkbox
                          checked={showOnlyFavorites}
                          onCheckedChange={(checked) => setShowOnlyFavorites(checked === true)}
                          id="favorites"
                          className="checkbox"
                        />
                        <label htmlFor="favorites" className="checkbox-label">
                          Show favorites only
                        </label>
                      </div>
                    </div>
                    <AccordionRoot type="multiple" defaultValue={['property-type', 'review-score']}>
                      <AccordionItem value="property-type">
                        <AccordionHeader>
                          <AccordionTrigger className="accordion-trigger">
                            <h3>Place Type</h3>
                          </AccordionTrigger>
                        </AccordionHeader>
                        <AccordionContent className="accordion-content">
                          <div className="property-types">
                            {placeTypes.map(type => (
                              <div
                                key={type}
                                className={`property-type-card ${selectedTypes.includes(type) ? 'selected' : ''}`}
                                onClick={() => toggleTypeSelection(type)}
                              >
                                <div className="property-icon"></div>
                                <span>{type}</span>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="review-score">
                        <AccordionHeader>
                          <AccordionTrigger className="accordion-trigger">
                            <h3>Review Score</h3>
                          </AccordionTrigger>
                        </AccordionHeader>
                        <AccordionContent className="accordion-content">
                          <div className="rating-options">
                            {ratingOptions.map(rating => (
                              <div
                                key={rating}
                                className={`rating-pill ${selectedRatings.includes(rating) ? 'selected' : ''}`}
                                onClick={() => toggleRatingSelection(rating)}
                              >
                                {rating}
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </AccordionRoot>
                  </div>
                    <button className="clear-button" onClick={() => {
                      setSelectedTypes([]);
                      setSelectedRatings([]);
                      setShowOnlyFavorites(false);
                    }}>
                      Clear Filters
                    </button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </AccordionRoot>
        </div>

        <div className="listing-map-container">
          <h1 className="page-title">{title}</h1>
          <div className="listings">

            {filteredLocations.length === 0 ? (
              <div className="no-results">No hiking places match your filters.</div>
            ) : (
              filteredLocations.map(place => (
                <div key={place.id} className="listing-card">
                  <div className="listing-image-container">
                    <div className="card-image-carousel">
                      {place.imageUrls && place.imageUrls.length > 0 && (
                        <Swiper
                          spaceBetween={10}
                          slidesPerView={1}
                          navigation={{
                            prevEl: '.swiper-button-prev',
                            nextEl: '.swiper-button-next',
                          }}
                          modules={[Navigation]}
                        >
                          {place.imageUrls.map((url, index) => (
                            <SwiperSlide key={index}>
                              <img src={url} alt={`Imagen ${index}`} className="carousel-image" />
                            </SwiperSlide>
                          ))}
                          <div className="swiper-button-prev text-blue-500"></div>
                          <div className="swiper-button-next text-blue-500"></div>
                        </Swiper>
                      )}
                    </div>
                  </div>
                  <div className="listing-content">
                    <div className="listing-header">
                      <h2>{place.name}</h2>
                      <div className="header-actions">
                        <button
                          className={`favorite-button ${place.isFavorite ? 'active' : ''}`}
                          onClick={() => handleToggleFavorite(place.id)}
                        >
                          <HeartIcon size={20} />
                        </button>
                        <button className="remove-button" onClick={() => handleRemoveLocation(place.id)}>
                          <TrashIcon size={20} />
                        </button>
                      </div>
                    </div>
                    <p className="location">
                      <MapPinIcon size={14} />
                      <span>{place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}</span>
                    </p>
                    {place.description && <p className="description">{place.description}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <div className="map-container">
        <Map
          locations={mapLocations} />
      </div>
    </div>
  );
};

export default App;