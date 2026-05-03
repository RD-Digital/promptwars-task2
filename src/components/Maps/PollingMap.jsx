import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Search } from 'lucide-react';
import { useJsApiLoader, GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { trackEvent } from '../../utils/analytics';

const libraries = ['places'];
const mapContainerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: 'var(--radius-md)',
  marginTop: '1rem'
};
const defaultCenter = { lat: 20.5937, lng: 78.9629 }; // India Center

export const PollingMap = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const isKeyValid = apiKey && apiKey !== 'dummy_maps_key';

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: isKeyValid ? apiKey : '',
    libraries
  });

  useEffect(() => {
    trackEvent('polling_viewed');
  }, []);

  const [map, setMap] = useState(null);
  const [stations, setStations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);

  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  if (!isKeyValid) {
    return (
      <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '1rem', textAlign: 'center' }}>
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--warning)' }}>
          <MapPin size={20} />
          Maps API Key Required
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          To unlock the interactive Polling Station Finder with live navigation, please add a valid Google Maps API Key to your <code>.env</code> file.
        </p>
        <code style={{ background: 'var(--bg-secondary)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>
          VITE_GOOGLE_MAPS_API_KEY=AIzaSy...
        </code>
      </div>
    );
  }

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim() || !map) return;
    
    setLoading(true);
    setStations([]);
    
      // First geocode the location/pincode to accurately center the map
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: searchQuery, componentRestrictions: { country: 'IN' } }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        map.panTo(location);
        map.setZoom(14);
        
        // Then search for typical polling locations nearby (schools, gov buildings)
        const service = new window.google.maps.places.PlacesService(map);
        const request = {
          location: location,
          radius: '5000',
          keyword: 'school OR government office OR polling station'
        };
        
        service.nearbySearch(request, (places, placeStatus) => {
          if (placeStatus === window.google.maps.places.PlacesServiceStatus.OK && places) {
            setStations(places.slice(0, 5)); // Show top 5 locations
          }
          setLoading(false);
        });
      } else {
        alert(`Could not geocode location. (Status: ${status}). Please check your API key restrictions or try another query.`);
        setLoading(false);
      }
    });
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '1rem' }}>
      <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <MapPin size={20} color="var(--accent-primary)" />
        Find Polling Station
      </h3>
      
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Enter Pincode or City..."
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-glass)',
            color: 'var(--text-primary)',
            outline: 'none',
            fontFamily: 'var(--font-family)',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
          }}
        />
        <button type="submit" disabled={loading || !isLoaded} className="btn btn-primary" style={{ padding: '0.75rem 1rem' }}>
          {loading ? 'Searching...' : <Search size={20} />}
        </button>
      </form>

      {!isLoaded ? (
        <div className="skeleton" style={{ height: '300px', width: '100%', borderRadius: 'var(--radius-md)' }} />
      ) : (
        <div style={{ position: 'relative' }}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={defaultCenter}
            zoom={5}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
              styles: [ // Elegant Light Mode styles
                { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
                { elementType: "labels.icon", stylers: [{ visibility: "on" }] },
                { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
                { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
                { featureType: "administrative.land_parcel", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
                { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
                { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
                { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
                { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
                { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
                { featureType: "road.arterial", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
                { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dadada" }] },
                { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
                { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
                { featureType: "transit.line", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
                { featureType: "transit.station", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
                { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9c9c9" }] },
                { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] }
              ],
              disableDefaultUI: true,
              zoomControl: true,
              minZoom: 4,
              restriction: {
                latLngBounds: {
                  north: 37.0902,
                  south: 6.7535,
                  west: 68.1114,
                  east: 97.3956,
                },
                strictBounds: true,
              }
            }}
          >
            {stations.map((station) => (
              <Marker
                key={station.place_id}
                position={station.geometry.location}
                onClick={() => setSelectedStation(station)}
              />
            ))}
            
            {selectedStation && (
              <InfoWindow
                position={selectedStation.geometry.location}
                onCloseClick={() => setSelectedStation(null)}
              >
                <div style={{ color: 'black', padding: '0.5rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>{selectedStation.name}</h4>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem' }}>{selectedStation.vicinity}</p>
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedStation.geometry.location.lat()},${selectedStation.geometry.location.lng()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 'bold' }}
                  >
                    Get Directions
                  </a>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </div>
      )}

      {stations.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Potential Polling Locations:</h4>
          {stations.map(station => (
            <motion.div 
              key={station.place_id}
              whileHover={{ scale: 1.01 }}
              onClick={() => {
                setSelectedStation(station);
                map.panTo(station.geometry.location);
                map.setZoom(16);
              }}
              style={{ 
                padding: '1rem', 
                background: 'var(--bg-secondary)', 
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-glass)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}
            >
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.5rem', borderRadius: '50%' }}>
                <MapPin size={16} color="var(--accent-primary)" />
              </div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{station.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{station.vicinity}</div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
