import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';

// Custom marker icon to fix the default icon issue
const defaultIcon = new Icon({
  // We'll use an imported image in the public folder
  iconUrl: '/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Generate random colors for different routes
const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// Component for capturing click events on the map
function AddWaypointHandler({ onAddPoint }) {
  useMapEvents({
    click: (e) => {
      onAddPoint(e.latlng);
    },
  });
  return null;
}

export default function BoundaryWatersMap() {
  // State for routes (array of route objects)
  const [routes, setRoutes] = useState([]);
  // Current active route being created
  const [currentRoute, setCurrentRoute] = useState({
    id: 1,
    name: 'Route 1',
    color: getRandomColor(),
    description: '',
    waypoints: [],
  });
  // Whether we're in "recording" mode
  const [isRecording, setIsRecording] = useState(false);
  // Selected route for viewing details
  const [selectedRoute, setSelectedRoute] = useState(null);

  // Load routes from localStorage on component mount
  useEffect(() => {
    const savedRoutes = localStorage.getItem('boundaryWatersRoutes');
    if (savedRoutes) {
      setRoutes(JSON.parse(savedRoutes));
    }
  }, []);

  // Save routes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('boundaryWatersRoutes', JSON.stringify(routes));
  }, [routes]);

  // Handle adding a waypoint to the current route
  const handleAddWaypoint = (latlng) => {
    if (isRecording) {
      setCurrentRoute((prev) => ({
        ...prev,
        waypoints: [...prev.waypoints, [latlng.lat, latlng.lng]],
      }));
    }
  };

  // Save the current route and start a new one
  const handleSaveRoute = () => {
    if (currentRoute.waypoints.length < 2) {
      alert('A route must have at least 2 waypoints!');
      return;
    }

    setRoutes((prev) => [...prev, currentRoute]);
    setCurrentRoute({
      id: currentRoute.id + 1,
      name: `Route ${currentRoute.id + 1}`,
      color: getRandomColor(),
      description: '',
      waypoints: [],
    });
    setIsRecording(false);
  };

  // Delete a route
  const handleDeleteRoute = (routeId) => {
    setRoutes((prev) => prev.filter((route) => route.id !== routeId));
    setSelectedRoute(null);
  };

  // Update the current route name or description
  const handleRouteInfoChange = (e) => {
    const { name, value } = e.target;
    setCurrentRoute((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-blue-700 text-white p-4">
        <h1 className="text-2xl font-bold">Boundary Waters Route Tracker</h1>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Map container */}
        <div className="flex-grow relative map-container-div">
          <MapContainer
            center={[47.9, -91.8]} // Centered on the Boundary Waters
            zoom={9}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Display all saved routes */}
            {routes.map((route) => (
              <Polyline
                key={route.id}
                positions={route.waypoints}
                pathOptions={{ color: route.color, weight: 5 }}
                eventHandlers={{
                  click: () => setSelectedRoute(route),
                }}
              />
            ))}
            
            {/* Display current route being created */}
            {currentRoute.waypoints.length > 0 && (
              <Polyline
                positions={currentRoute.waypoints}
                pathOptions={{ color: currentRoute.color, weight: 5, dashArray: isRecording ? '5, 10' : '' }}
              />
            )}
            
            {/* Display markers for the current route */}
            {isRecording &&
              currentRoute.waypoints.map((point, index) => (
                <Marker
                  key={index}
                  position={point}
                  icon={defaultIcon}
                >
                  <Popup>Waypoint {index + 1}</Popup>
                </Marker>
              ))}
            
            {/* Click handler for adding waypoints */}
            <AddWaypointHandler onAddPoint={handleAddWaypoint} />
          </MapContainer>
        </div>
        
        {/* Side panel */}
        <div className="w-80 bg-gray-100 p-4 overflow-y-auto">
          <div className="mb-6 p-4 bg-white rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Route Controls</h2>
            
            <div className="mb-4">
              <button
                className={`w-full p-2 rounded font-medium ${
                  isRecording
                    ? 'bg-red-500 text-white'
                    : 'bg-green-500 text-white'
                }`}
                onClick={() => setIsRecording(!isRecording)}
              >
                {isRecording ? 'Stop Recording Route' : 'Start Recording Route'}
              </button>
            </div>
            
            {isRecording && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Route Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={currentRoute.name}
                    onChange={handleRouteInfoChange}
                    className="w-full p-2 border rounded"
                    placeholder="Enter route name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={currentRoute.description}
                    onChange={handleRouteInfoChange}
                    className="w-full p-2 border rounded"
                    placeholder="Enter route description"
                    rows="3"
                  ></textarea>
                </div>
                
                <div>
                  <p className="text-sm mb-1">
                    Waypoints: {currentRoute.waypoints.length}
                  </p>
                  <button
                    className="w-full p-2 bg-blue-500 text-white rounded font-medium"
                    onClick={handleSaveRoute}
                    disabled={currentRoute.waypoints.length < 2}
                  >
                    Save Route
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Route list */}
          <div className="bg-white rounded shadow p-4">
            <h2 className="text-xl font-semibold mb-4">My Routes</h2>
            
            {routes.length === 0 ? (
              <p className="text-gray-500">No routes saved yet.</p>
            ) : (
              <div className="space-y-2">
                {routes.map((route) => (
                  <div
                    key={route.id}
                    className={`p-3 border rounded cursor-pointer ${
                      selectedRoute?.id === route.id ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedRoute(route)}
                  >
                    <div className="flex items-center">
                      <div
                        className="w-4 h-4 rounded-full mr-2"
                        style={{ backgroundColor: route.color }}
                      ></div>
                      <span className="font-medium">{route.name}</span>
                    </div>
                    
                    {selectedRoute?.id === route.id && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 mb-2">
                          {route.description || 'No description'}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          Waypoints: {route.waypoints.length}
                        </p>
                        <button
                          className="text-sm text-red-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRoute(route.id);
                          }}
                        >
                          Delete Route
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}