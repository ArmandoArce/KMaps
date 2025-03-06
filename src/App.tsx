import React, { useState, useEffect } from 'react';
import { Root as AccordionRoot, Item as AccordionItem, Header as AccordionHeader, Trigger as AccordionTrigger, Content as AccordionContent } from '@radix-ui/react-accordion';
import { Checkbox } from '@radix-ui/react-checkbox';
import { LuHeart, LuCircleX, LuMapPin, LuMapPinPlus, LuMountain, LuDroplets, LuTrainTrack, LuFlameKindling, LuWheat, LuHotel } from "react-icons/lu";
import Map from './components/Map';
import useLocalStorage from './hooks/useLocalStorage';
import useForm from './hooks/useForm';
import useDocumentTitle from './hooks/useDocumentTitle';
import { v4 as uuidv4 } from 'uuid';
import './styles.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation } from 'swiper/modules';


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
  const [title] = useState<string>('Hiking Map');
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

      const rating = parseInt(values.rating);
      if (isNaN(rating) || rating < 10 || rating > 0) {
        errors.rating = 'Rating must be between 0 and 10';
      }

      return errors;
    }
  });

  useDocumentTitle(title);

  useEffect(() => {
    setLocations((prevLocations) => {
      const nonFavoriteLocations = prevLocations.filter(
        (loc) => !favoriteLocations.some((fav) => fav.id === loc.id)
      );
      return [...favoriteLocations, ...nonFavoriteLocations];
    });
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
        if (rating === 'Terrible: 5-') return placeRating < 5;
        return false;
      })) return false;
    }
    return true;
  });

  const mapLocations = React.useMemo(() => {
    const mapLocs: Location[] = [];

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

  const ratingOptions = ['Wonderful: 9+', 'Very Good: 8+', 'Good: 7+', 'Pleasant: 6+', 'Ok: 5+', 'Terrible: 5-'];

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

  const handleAddImage = () => {
    const imageUrl = tempImageUrl.trim();

    if (imageUrl) {
      const img = new Image();
      img.onload = () => {
        setImageUrls([...imageUrls, imageUrl]);
        setTempImageUrl('');
      };
      img.onerror = () => {
        alert('Not a valid format.');
      };
      img.src = imageUrl;
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

  return (
    <div className="hiking-app">
      <div className="app-container">
        <div className="filter-panel accordion-panel">
          <AccordionRoot type="multiple" defaultValue={['new-location', 'filters']}>
            <AccordionItem value="new-location">
              <AccordionHeader>
                <AccordionTrigger className="accordion-trigger" aria-expanded={isAddingLocation} aria-label="Toggle New Location section">
                  <h2>New Location</h2>
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionContent className="accordion-content">
                <div className="user-location-controls">
                  <div className="controls-row">
                    <button
                      className={`control-button ${isAddingLocation ? 'active' : ''}`}
                      onClick={handleToggleAddLocation}
                      aria-label={isAddingLocation ? "Cancel adding location" : "Add a new location"}
                    >
                      <LuMapPinPlus size={14} aria-hidden="true" />
                      <span>{isAddingLocation ? ' | Cancel' : ' | Add Location'}</span>
                    </button>
                  </div>
                </div>
                {isAddingLocation && (
                  <div className="add-location-form">
                    <h3>Add Hiking Location</h3>
                    <form onSubmit={(e) => { handleSubmit(e); handleAddLocation(); }}>
                      <div className="form-field">
                        <label htmlFor="location-name">Name</label>
                        <input
                          id="location-name"
                          type="text"
                          name="name"
                          placeholder="Location name"
                          value={values.name}
                          onChange={handleChange}
                          aria-required="true"
                        />
                        {errors.name && <p className="error" role="alert">{errors.name}</p>}
                      </div>

                      <div className="form-field">
                        <label htmlFor="latitude">Latitude</label>
                        <input
                          id="latitude"
                          type="number"
                          name="latitude"
                          placeholder="Latitude"
                          value={values.latitude}
                          onChange={handleChange}
                          aria-required="true"
                        />
                        {errors.latitude && <p className="error" role="alert">{errors.latitude}</p>}
                      </div>

                      <div className="form-field">
                        <label htmlFor="longitude">Longitude</label>
                        <input
                          id="longitude"
                          type="number"
                          name="longitude"
                          placeholder="Longitude"
                          value={values.longitude}
                          onChange={handleChange}
                          aria-required="true"
                        />
                        {errors.longitude && <p className="error" role="alert">{errors.longitude}</p>}
                      </div>

                      <div className="form-field">
                        <label htmlFor="type">Type</label>
                        <select
                          id="type"
                          name="type"
                          value={values.type}
                          onChange={handleChange}
                          aria-required="true"
                        >
                          {placeTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-field">
                        <label htmlFor="rating">Rating</label>
                        <input
                          id="rating"
                          type="number"
                          name="rating"
                          placeholder="Rating"
                          value={values.rating}
                          onChange={handleChange}
                          aria-required="true"
                        />
                        {errors.rating && <p className="error" role="alert">{errors.rating}</p>}
                      </div>

                      <div className="form-field">
                        <label htmlFor="description">Description</label>
                        <textarea
                          id="description"
                          name="description"
                          placeholder="Brief description"
                          value={values.description}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="form-field">
                        <label htmlFor="image-url">Image URL</label>
                        <input
                          id="image-url"
                          type="text"
                          value={tempImageUrl}
                          onChange={(e) => setTempImageUrl(e.target.value)}
                          placeholder="Enter image URL"
                        />
                        <button
                          type="button"
                          className="add-image-button"
                          onClick={handleAddImage}
                          aria-label="Add image"
                        >
                          Add Image
                        </button>
                      </div>

                      <div className="image-thumbnails">
                        {imageUrls.map((url, index) => (
                          <div key={index} className="thumbnail">
                            <img src={url} alt={`Uploaded image ${index + 1}`} className="small-image" />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              aria-label={`Remove image ${index + 1}`}
                            >
                              X
                            </button>
                          </div>
                        ))}
                      </div>

                      <button
                        className="form-submit-button"
                        type="submit"
                        aria-label="Submit new location"
                      >
                        Add Location
                      </button>
                    </form>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>


            <AccordionItem value="filters">
              <AccordionHeader>
                <AccordionTrigger className="accordion-trigger" >
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
                          aria-label="Show favorites only"
                        />
                        <label htmlFor="favorites" className="checkbox-label">
                          Show favorites only
                        </label>
                      </div>
                    </div>
                    <AccordionRoot type="multiple" defaultValue={['property-type', 'review-score']}>
                      <AccordionItem value="property-type">
                        <AccordionHeader>
                          <AccordionTrigger className="accordion-trigger" >
                            <h3>Place Type</h3>
                          </AccordionTrigger>
                        </AccordionHeader>
                        <AccordionContent className="accordion-content">
                          <div className="property-types">
                            {placeTypes.map(type => {
                              let iconComponent;
                              switch (type) {
                                case 'Mountain':
                                  iconComponent = <LuMountain size={24} />;
                                  break;
                                case 'Waterfalls':
                                  iconComponent = <LuDroplets size={24} />;
                                  break;
                                case 'Trails':
                                  iconComponent = <LuTrainTrack size={24} />;
                                  break;
                                case 'Camping':
                                  iconComponent = <LuFlameKindling size={24} />;
                                  break;
                                case 'Nature Walks':
                                  iconComponent = <LuWheat size={24} />;
                                  break;
                                case 'Lodging':
                                  iconComponent = <LuHotel size={24} />;
                                  break;
                                default:
                                  iconComponent = <LuMountain size={24} />;
                              }

                              return (
                                <div
                                  key={type}
                                  role="checkbox"
                                  aria-checked={selectedTypes.includes(type)}
                                  className={`property-type-card ${selectedTypes.includes(type) ? 'selected' : ''}`}
                                  onClick={() => toggleTypeSelection(type)}
                                  tabIndex="0"
                                  aria-label={`Select ${type}`}
                                >
                                  <div className="place-icon">
                                    {iconComponent}
                                  </div>
                                  <span>{type}</span>
                                </div>
                              );
                            })}
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
                                role="button"
                                tabIndex="0"
                                aria-label={`Select rating ${rating}`}
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
                  }} aria-label="Clear all filters">
                    Clear Filters
                  </button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </AccordionRoot>
        </div>

        <div className="listing-map-container">
          <h1 className="page-title" aria-label="Page title: {title}">{title}</h1>
          <div className="listings">
            {filteredLocations.length === 0 ? (
              <div className="no-results" aria-live="polite">No hiking places match your filters.</div>
            ) : (
              filteredLocations.map(place => (
                <div key={place.id} className="listing-card" role="region" aria-labelledby={`place-title-${place.id}`}>
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
                          aria-label={`Image carousel for ${place.name}`}
                        >
                          {place.imageUrls.map((url, index) => (
                            <SwiperSlide key={index}>
                              <img src={url} alt={`Image ${index + 1} of ${place.name}`} className="carousel-image" />
                            </SwiperSlide>
                          ))}
                          <div className="swiper-button-prev text-blue-500" aria-label="Previous image"></div>
                          <div className="swiper-button-next text-blue-500" aria-label="Next image"></div>
                        </Swiper>
                      )}
                    </div>
                  </div>
                  <div className="listing-content">
                    <div className="listing-header">
                      <h2 id={`place-title-${place.id}`}>{place.name}</h2>
                      <div className="header-actions">
                        <button
                          className={`favorite-button ${place.isFavorite ? 'active' : ''}`}
                          onClick={() => handleToggleFavorite(place.id)}
                          aria-label={place.isFavorite ? `Remove ${place.name} from favorites` : `Add ${place.name} to favorites`}
                        >
                          <LuHeart size={20} />
                        </button>
                        <button className="remove-button" onClick={() => handleRemoveLocation(place.id)} aria-label={`Remove ${place.name} from the list`}>
                          <LuCircleX size={20} />
                        </button>
                      </div>
                    </div>
                    <p className="location">
                      <LuMapPin size={14} />
                      <span aria-label={`Location coordinates: ${place.latitude.toFixed(4)}, ${place.longitude.toFixed(4)}`}>{place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}</span>
                    </p>
                    {place.description && <p className="description">{place.description}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <div className="map-container" role="region" aria-label="Map displaying hiking locations">
        <Map locations={mapLocations} />
      </div>
    </div>
  );
};

export default App;