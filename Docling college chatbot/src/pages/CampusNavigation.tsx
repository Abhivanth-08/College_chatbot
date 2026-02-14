import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, MapPin, Navigation, Search, Locate, Route, Clock, Navigation as NavigationIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';

// Add Leaflet types
declare global {
  interface Window {
    L: any;
  }
}

interface RouteInfo {
  distance: string;
  duration: string;
  steps: string[];
}

const CampusNavigation = () => {
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [currentResponse, setCurrentResponse] = useState<string>('');
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  const [routeError, setRouteError] = useState<string>('');
  const [manualLocation, setManualLocation] = useState<[number, number] | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const routingControlRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const destinationMarkerRef = useRef<any>(null);

  // Campus locations with coordinates
  const campusLocations = {
    "main gate": {
      synonyms: ["main gate"],
      response: "This is the main entrance to the campus.",
      coordinates: [11.081525363696516, 77.13429285090719]
    },
    "kpr cas": {
      synonyms: ["kpr cas"],
      response: "This is the KPR College of Arts and Science building.",
      coordinates: [11.080666701222475, 77.13510691029911]
    },
    "kpr staff quarters": {
      synonyms: ["kpr staff quarters"],
      response: "The residential quarters for KPR staff.",
      coordinates: [11.079634129087113, 77.13406026250948]
    },
    "students parking": {
      synonyms: ["students parking", "bike parking"],
      response: "Enter through the Security Gate and walk straight. You will see the Bike Parking area.",
      coordinates: [11.077249560831607, 77.14036539730463]
    },
    "kpr food court": {
      synonyms: ["kpr food court", "food court"],
      response: "Enter through the Security Gate and walk straight. Just after the parking area, you will see the Food Court on your left.",
      coordinates: [11.077662411714652, 77.1409831179411]
    },
    "kpriet": {
      synonyms: ["kpriet", "imperial hall"],
      response: "Enter through the Security Gate and walk straight along the main road. Take the second left — this road leads to the Administrative Block. The building will be on your right side, from there you can also find Imperial Hall.",
      coordinates: [11.076444761187608, 77.14202685275929]
    },
    "admin block": {
      synonyms: ["admin", "admission office", "main block", "admin block", "administrative block"],
      response: "Enter through the Security Gate and walk straight along the main road. Take the second left — this road leads to the Administrative Block.",
      coordinates: [11.07671651195898, 77.14208542971336]
    },
    "library": {
      synonyms: ["library", "central library"],
      response: "Enter through the Security Gate and walk straight. Keep walking on the main road. Take the small right road near the Girls washroom. Keep walking on the road, you'll see Library on your right.",
      coordinates: [11.075885580921987, 77.14204815346986]
    },
    "kpr 1st year block": {
      synonyms: ["kpr 1st year block", "first year block"],
      response: "This block is designated for first-year students.",
      coordinates: [11.07587593587222, 77.14172262310579]
    },
    "boys restroom": {
      synonyms: ["boys toilet", "gents restroom", "gents toilet"],
      response: "Enter through the Security Gate and take the first left. Then take a right turn and walk straight. You'll pass Kalai Arangam on your left. Just after that, you'll reach the Chemical Engineering Block on your left. The Gents Toilet is located inside the Chemical Block, on the ground floor.",
      coordinates: [11.07605501789596, 77.14221895710789]
    },
    "kpr mech,eee,civil": {
      synonyms: ["mechanical", "mechanical block", "civil", "civil block", "eee", "eee block"],
      response: "Walk in through the Security Gate. Take the second left — you'll see the Admin Block on your right. Keep walking straight, pass the Main Block. Then take a right turn. You'll reach the Mechanical Block at the end of the road. From there you can also reach Civil and EEE blocks.",
      coordinates: [11.076346065726293, 77.14314073561296]
    },
    "oat": {
      synonyms: ["open air theatre", "oat"],
      response: "Enter through the Security Gate and walk straight. You will see the Imperial Hall on your right. Walk beside the Imperial Hall and take the pathway to reach the Main Block. Continue straight, walk past the pond. The Open-Air Theatre will be on your right, just before the CSE Block turn.",
      coordinates: [11.076823934184398, 77.14280809380497]
    },
    "cse block": {
      synonyms: ["cse", "cse block"],
      response: "Enter through the Security Gate and walk straight. You'll see the Imperial Hall on your right. Walk past the Imperial Hall — you'll find a pathway beside it. Take that pathway — it will lead you to the Main Block. Walk straight past the Main Block. Continue straight until you see the pond. Cross the pond area and keep walking. Pass the Open-Air Theatre, then take a left turn. The CSE Block will be on your right side.",
      coordinates: [11.076833766860366, 77.14319884773649]
    },
    "ece block": {
      synonyms: ["ece", "ece block"],
      response: "Enter through the Security Gate and take the first left. Then take a right turn and walk straight. After passing Kalai Arangam, the ECE Block will be on your right side, just before reaching the BME Block.",
      coordinates: [11.077097076784973, 77.1427746835377]
    },
    "bme , csbs,it block": {
      synonyms: ["bme block", "bme", "csbs block", "it block"],
      response: "Enter through the Security Gate and take the first left. Then take a right turn and walk straight. After you pass Kalai Arangam on your left, you will see the BME Block directly in front of you.",
      coordinates: [11.07742427775825, 77.14318701059605]
    },
    "aiml , chemical block": {
      synonyms: ["aiml block", "chemical block", "chemical engineering"],
      response: "Enter through the Security Gate and take the first left. Then turn right and walk straight. After you pass Kalai Arangam, the Chemical Engineering Block will be on your left side, opposite the ECE Block.",
      coordinates: [11.077659534804738, 77.1428353844472]
    },
    "kpr kalaiarangam": {
      synonyms: ["kalaiarangam", "kpr kalaiarangam"],
      response: "Enter through the Security Gate and take the first left. Keep walking on that road — you'll see Kalai Arangam on your left.",
      coordinates: [11.077782286005291, 77.14208349652485]
    },
    "gym": {
      synonyms: ["gym", "fitness center"],
      response: "The campus gym is located near the hostels and playground area.",
      coordinates: [11.078404471311574, 77.14131656211012]
    },
    "kpr boys mess": {
      synonyms: ["boys mess", "dining", "dining hall", "kpr boys mess"],
      response: "Enter through the Security Gate and walk straight. The Dining Hall is on your left side, just behind the Student Bike Parking.",
      coordinates: [11.07917049333202, 77.14272431282589]
    },
    "kpr boys hostel": {
      synonyms: ["boys hostel", "kpr boys hostel"],
      response: "Enter through the Security Gate and walk straight. Take the first left, then turn right and continue walking. Go past Kalai Arangam — you'll see the Boys Hostel on your left.",
      coordinates: [11.07872894376592, 77.1424925282044]
    },
    "kpr playground": {
      synonyms: ["playground", "kpr playground"],
      response: "The main sports playground of the campus is located near the Main Gate side.",
      coordinates: [11.081042125480804, 77.1418096797646]
    },
    "exam cell": {
      synonyms: ["coe", "exam cell", "coe & exam cell"],
      response: "Enter through the Security Gate and walk straight. Take the second left to reach the Administrative Block. Then walk straight to the Main Block. The COE & Exam Cell is on the right side of the Main Block, near the staff rooms.",
      coordinates: [11.07647576086405, 77.1418221782143]
    },
    "car parking": {
      synonyms: ["car parking"],
      response: "Enter through the Security Gate and walk straight. Take the second left. You will see the Car Parking area on your left side, just before reaching the Administrative Block.",
      coordinates: [11.076947118636319, 77.14087328205882]
    },
    "just print": {
      synonyms: ["just print", "stationery"],
      response: "Enter through the Security Gate and take the first left. Keep walking on that road — you'll see the JustPrint stationery shop right in front of you.",
      coordinates: [11.07773259027011, 77.14085667547421]
    },
    "girls toilet": {
      synonyms: ["girls toilet", "ladies toilet", "girls restroom"],
      response: "Enter through the Security Gate and take the first left. Then take a right turn and walk straight. You'll pass Kalai Arangam on your left. Just after that, you'll reach the Chemical Engineering Block on your left. The Ladies Toilet is located inside the Chemical Block, on the ground floor, just after the Boys Restroom.",
      coordinates: [11.077801339872666, 77.14264178826875]
    },
    "girls hostel": {
      synonyms: ["girls hostel"],
      response: "Enter through the Security Gate and walk straight. Take a right near the roundana (circle) and walk straight on that road. Then take another right and continue walking. Take a left and walk a few steps — you'll see the Girls Hostel on your left side.",
      coordinates: [11.074770201963902, 77.14250628565497]
    },
    "ragam hall": {
      synonyms: ["ragam hall"],
      response: "Enter through the Security Gate and walk straight. Keep walking on the main road. Take the small right road near the Girls washroom. Keep walking on the road, take right. You'll see Ragam Hall near the library.",
      coordinates: [11.075969496725252, 77.141989631158]
    },
    "veena hall": {
      synonyms: ["veena hall"],
      response: "Enter through the Security Gate and walk straight. Keep walking on the main road. Take the small right road near the Girls washroom. Keep walking on the road, take left. Walk few steps, you'll see Veena Hall on your left.",
      coordinates: [11.075500331646731, 77.14231178790038]
    },
    "pallavi hall": {
      synonyms: ["pallavi hall"],
      response: "Enter through the Security Gate and walk straight. Keep walking on the main road. Take the small right road near the Girls washroom. Keep walking on the road, take left. Walk few steps, you'll see Pallavi Hall on your left.",
      coordinates: [11.075500331646731, 77.14231178790038]
    },
    "dhanam hall": {
      synonyms: ["dhanam hall", "thanam hall"],
      response: "Walk in through the Security Gate. Take the second left — you'll see the Admin Block on your right. Keep walking straight, pass the Main Block. Then take a right turn. You'll reach the Mechanical Block at the end of the road. Go to the second floor — Dhanam/Thanam Hall will be on your right.",
      coordinates: [11.076122112858988, 77.14327673282892]
    },
    "ad block": {
      synonyms: ["ad block"],
      response: "Enter through the Security Gate and walk straight. Take the second left — you'll see the Administrative Block on your right. Enter the Admin Block and go to the second floor. The AD Classrooms are located on the second floor of the Admin Block.",
      coordinates: [11.076665537267584, 77.14226152178497]
    },
    "stone bench": {
      synonyms: ["stone bench"],
      response: "Enter through the Security Gate and walk straight. Keep walking on the main road and take the small right near the Boys Washroom. Continue on that road — you'll see the stone bench area on your left side.",
      coordinates: [11.075786487142572, 77.14265853837796]
    },
    "rk": {
      synonyms: ["rk"],
      response: "Enter through the Security Gate and walk straight. Keep walking on the main road and take a left turn opposite the Boys Washroom. You'll see RK on your right side.",
      coordinates: [11.076334545116545, 77.14256849870092]
    }
  };

  // Filter locations that have coordinates
  const locationsWithCoordinates = Object.entries(campusLocations).filter(([_, location]) => location.coordinates);

  // Load Leaflet CSS and JS
  useEffect(() => {
    // Load Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet/dist/leaflet.css';
    document.head.appendChild(link);

    // Load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet/dist/leaflet.js';
    script.onload = () => {
      // Load Leaflet Routing Machine
      const routingScript = document.createElement('script');
      routingScript.src = 'https://unpkg.com/leaflet-routing-machine/dist/leaflet-routing-machine.js';
      routingScript.onload = () => {
        setIsMapLoaded(true);
      };
      document.head.appendChild(routingScript);
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, []);

  // Initialize map when loaded
  useEffect(() => {
    if (isMapLoaded && mapRef.current && !mapInstanceRef.current) {
      initializeMap();
    }
  }, [isMapLoaded]);

  const initializeMap = () => {
    if (!window.L) return;

    const L = window.L;
    
    // Initialize map
    const map = L.map(mapRef.current).setView([11.0785, 77.1405], 16);
    mapInstanceRef.current = map;

    // Add dark tile layer
    L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=563a8902-707d-40b3-9590-f2500e7aac5a', {
      attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

            // Add campus building markers
        locationsWithCoordinates.forEach(([key, location]) => {
          if (location.coordinates) {
            const marker = L.circleMarker(location.coordinates, {
              radius: 8,
              color: "#00ffc8",
              fillColor: "#00d4a0",
              fillOpacity: 0.7,
              weight: 2
            }).addTo(map);

            // Create simple tooltip with just the location name
            const tooltipContent = formatLocationName(key);

            marker.bindTooltip(tooltipContent, {
              permanent: false,
              direction: 'top',
              className: 'custom-tooltip',
              offset: [0, -10]
            });

            // Remove click functionality - markers are now just visual
            // marker.on('click', () => {
            //   handleLocationSelect(key);
            // });

            // Add hover effect for the marker itself (visual only)
            marker.on('mouseover', function() {
              this.setRadius(12);
              this.setStyle({ fillOpacity: 0.9 });
            });

            marker.on('mouseout', function() {
              this.setRadius(8);
              this.setStyle({ fillOpacity: 0.7 });
            });
          }
        });

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLatLng: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserLocation(userLatLng);
          setLocationError('');
          
          // Add user marker
          userMarkerRef.current = L.circleMarker(userLatLng, {
            radius: 10,
            color: "#00d4a0",
            fillColor: "#00ffc8",
            fillOpacity: 0.9,
            weight: 3
          }).addTo(map);

          userMarkerRef.current.bindPopup(`
            <div style="text-align: center; font-family: Arial, sans-serif;">
              <strong style="color: #00ffc8; font-size: 14px;">📍 You are here</strong>
              <br>
              <span style="color: #666; font-size: 12px;">Lat: ${userLatLng[0].toFixed(6)}</span>
              <br>
              <span style="color: #666; font-size: 12px;">Lng: ${userLatLng[1].toFixed(6)}</span>
            </div>
          `);

          map.setView(userLatLng, 16);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLocationError('Unable to get your location. Please enable location access or select a location manually.');
          // Fallback to campus center
          map.setView([11.0785, 77.1405], 16);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser.');
      map.setView([11.0785, 77.1405], 16);
    }
  };

  const handleLocationSelect = (locationKey: string) => {
    // Clear previous route and destination marker
    clearRoute();
    
    setSelectedLocation(locationKey);
    setCurrentResponse(campusLocations[locationKey as keyof typeof campusLocations]?.response || '');
    setRouteInfo(null);
    
    // Show route on map
    if (mapInstanceRef.current && campusLocations[locationKey as keyof typeof campusLocations]?.coordinates) {
      showRoute(locationKey);
    }
  };

  const showRoute = (locationKey: string) => {
    if (!window.L || !mapInstanceRef.current) return;

    const L = window.L;
    const destination = campusLocations[locationKey as keyof typeof campusLocations]?.coordinates;
    
    if (!destination) {
      setRouteError('Destination coordinates not found.');
      return;
    }

    // Clear previous errors
    setRouteError('');

    // Remove existing routing control and destination marker
    if (routingControlRef.current) {
      mapInstanceRef.current.removeControl(routingControlRef.current);
    }
    if (destinationMarkerRef.current) {
      mapInstanceRef.current.removeLayer(destinationMarkerRef.current);
    }

    // Use stored user location if available, otherwise get current position
    const getUserLocation = () => {
      if (userLocation) {
        return Promise.resolve(userLocation);
      }
      
      if (manualLocation) {
        return Promise.resolve(manualLocation);
      }
      
      return new Promise<[number, number]>((resolve, reject) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const userLatLng: [number, number] = [position.coords.latitude, position.coords.longitude];
              setUserLocation(userLatLng);
              resolve(userLatLng);
            },
            (error) => {
              console.error('Geolocation error:', error);
              reject(error);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 300000
            }
          );
        } else {
          reject(new Error('Geolocation not supported'));
        }
      });
    };

    getUserLocation()
      .then((userLatLng) => {
        // Update user marker if needed
        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng(userLatLng);
        } else {
          // Create user marker if it doesn't exist
          userMarkerRef.current = L.circleMarker(userLatLng, {
            radius: 10,
            color: "#00d4a0",
            fillColor: "#00ffc8",
            fillOpacity: 0.9,
            weight: 3
          }).addTo(mapInstanceRef.current);

          userMarkerRef.current.bindPopup(`
            <div style="text-align: center; font-family: Arial, sans-serif;">
              <strong style="color: #00ffc8; font-size: 14px;">📍 You are here</strong>
            </div>
          `);
        }

        // Create routing control with better error handling
        try {
          routingControlRef.current = L.Routing.control({
            waypoints: [L.latLng(userLatLng), L.latLng(destination)],
            routeWhileDragging: false,
            show: false, // Hide the routing panel
            addWaypoints: false,
            routeDragInterval: 0,
            router: new L.Routing.OSRMv1({
              serviceUrl: 'https://router.project-osrm.org/route/v1',
              profile: 'foot',
              alternatives: false
            }),
            lineOptions: {
              styles: [{color: '#00ffc8', weight: 6, opacity: 0.8}]
            },
            fitSelectedRoutes: true
          }).addTo(mapInstanceRef.current);

          // Add bouncing destination marker
          destinationMarkerRef.current = L.circleMarker(destination, {
            radius: 12,
            color: "#ff6b6b",
            fillColor: "#ff4757",
            fillOpacity: 0.9,
            weight: 3
          }).addTo(mapInstanceRef.current);

          // Add bouncing animation class
          const markerElement = destinationMarkerRef.current.getElement();
          if (markerElement) {
            markerElement.style.animation = 'bounce 1s infinite';
          }

          destinationMarkerRef.current.bindPopup(`
            <div style="text-align: center; font-family: Arial, sans-serif;">
              <strong style="color: #ff6b6b; font-size: 14px;">🎯 ${formatLocationName(locationKey)}</strong>
              <br>
              <span style="color: #666; font-size: 12px;">Your destination</span>
            </div>
          `);

          destinationMarkerRef.current.openPopup();

          // Get route information
          routingControlRef.current.on('routesfound', function(e: any) {
            const routes = e.routes;
            if (routes && routes.length > 0) {
              const route = routes[0];
              const distance = (route.summary.totalDistance / 1000).toFixed(2);
              const duration = Math.round(route.summary.totalTime / 60);
              
              const steps = route.instructions.map((instruction: any) => 
                instruction.text.replace(/<[^>]*>/g, '')
              );

              setRouteInfo({
                distance: `${distance} km`,
                duration: `${duration} min`,
                steps: steps
              });
              setRouteError('');
            }
          });

          // Handle routing errors
          routingControlRef.current.on('routingerror', function(e: any) {
            console.error('Routing error:', e);
            setRouteError('Unable to calculate route. Please try again or check your internet connection.');
          });

        } catch (error) {
          console.error('Error creating routing control:', error);
          setRouteError('Unable to create route. Please try again.');
        }
      })
      .catch((error) => {
        console.error('Error getting user location:', error);
        setRouteError('Unable to get your location. Please enable location access or try again.');
        
        // Still show destination marker even if we can't get user location
        destinationMarkerRef.current = L.circleMarker(destination, {
          radius: 12,
          color: "#ff6b6b",
          fillColor: "#ff4757",
          fillOpacity: 0.9,
          weight: 3
        }).addTo(mapInstanceRef.current);

        // Add bouncing animation
        const markerElement = destinationMarkerRef.current.getElement();
        if (markerElement) {
          markerElement.style.animation = 'bounce 1s infinite';
        }

        destinationMarkerRef.current.bindPopup(`
          <div style="text-align: center; font-family: Arial, sans-serif;">
            <strong style="color: #ff6b6b; font-size: 14px;">🎯 ${formatLocationName(locationKey)}</strong>
            <br>
            <span style="color: #666; font-size: 12px;">Your destination</span>
          </div>
        `);

        destinationMarkerRef.current.openPopup();
        mapInstanceRef.current.setView(destination, 16);
      });
  };

  const clearRoute = () => {
    if (routingControlRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }
    if (destinationMarkerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(destinationMarkerRef.current);
      destinationMarkerRef.current = null;
    }
    setRouteInfo(null);
  };

  const formatLocationName = (key: string) => {
    return key.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Add CSS for bouncing animation */}
      <style>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
        
        .map-marker-hover {
          transition: all 0.3s ease;
        }
        
        .map-marker-hover:hover {
          transform: scale(1.1);
          filter: brightness(1.2);
        }
        
        .custom-tooltip {
          background: rgba(0, 0, 0, 0.8) !important;
          color: #00ffc8 !important;
          border: 1px solid #00ffc8 !important;
          border-radius: 6px !important;
          padding: 4px 8px !important;
          font-size: 12px !important;
          font-weight: 500 !important;
          box-shadow: 0 2px 8px rgba(0, 255, 200, 0.3) !important;
        }
        
        .custom-tooltip::before {
          border-top-color: #00ffc8 !important;
        }
        
        @media (max-width: 768px) {
          .map-container {
            height: 400px !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <div className="text-center mb-12">
          <Navigation className="h-16 w-16 mx-auto mb-6 text-primary neon-text float-animation" />
          <h1 className="text-4xl md:text-6xl font-bold mb-6 neon-text">
            Campus Navigation
          </h1>
          <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
            Find your way around KPRIET campus with interactive directions from your current location
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Location Selector */}
          <Card className="glass p-8">
            <div className="flex items-center gap-3 mb-6">
              <Search className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">Select Location</h2>
            </div>
            
            <Select onValueChange={handleLocationSelect}>
              <SelectTrigger className="w-full bg-background/50 border-border/50 text-foreground">
                <SelectValue placeholder="Choose a campus location..." />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                {locationsWithCoordinates.map(([locationKey, _]) => (
                  <SelectItem key={locationKey} value={locationKey} className="text-foreground">
                    {formatLocationName(locationKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Location Status */}
            {locationError && (
              <div className="mt-4">
                <Card className="glass-bright p-4 border-orange-500/30">
                  <div className="flex items-start gap-3">
                    <div className="text-orange-500 mt-1">⚠️</div>
                    <div>
                      <h4 className="text-orange-500 font-medium mb-1">Location Access Issue</h4>
                      <p className="text-foreground/80 text-sm">{locationError}</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* User Location Status */}
            {userLocation && (
              <div className="mt-4">
                <Card className="glass-bright p-4 border-green-500/30">
                  <div className="flex items-start gap-3">
                    <div className="text-green-500 mt-1">✅</div>
                    <div>
                      <h4 className="text-green-500 font-medium mb-1">Location Found</h4>
                      <p className="text-foreground/80 text-sm">
                        Your location: {userLocation[0].toFixed(6)}, {userLocation[1].toFixed(6)}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Directions Display */}
            {currentResponse && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4 text-primary neon-text-accent">
                  📍 Directions to {formatLocationName(selectedLocation)}
                </h3>
                <Card className="glass-bright p-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-accent mt-1 flex-shrink-0" />
                    <p className="text-foreground/90 leading-relaxed">
                      {currentResponse}
                    </p>
                  </div>
                </Card>

                {/* Route Error */}
                {routeError && (
                  <Card className="glass-bright p-4 mt-4 border-red-500/30">
                    <div className="flex items-start gap-3">
                      <div className="text-red-500 mt-1">❌</div>
                      <div>
                        <h4 className="text-red-500 font-medium mb-1">Route Error</h4>
                        <p className="text-foreground/80 text-sm">{routeError}</p>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Route Information */}
                {routeInfo && (
                  <Card className="glass-bright p-6 mt-4">
                    <div className="flex items-center gap-3 mb-4">
                      <NavigationIcon className="h-5 w-5 text-primary" />
                      <h4 className="text-lg font-semibold text-primary">Route Details</h4>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-accent" />
                        <span className="text-foreground/80">Duration: {routeInfo.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-accent" />
                        <span className="text-foreground/80">Distance: {routeInfo.distance}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-foreground/70">Step-by-step directions:</h5>
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {routeInfo.steps.map((step, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm">
                            <span className="text-primary font-medium min-w-[20px]">{index + 1}.</span>
                            <span className="text-foreground/80">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                )}
                
                <div className="mt-4 flex gap-2">
                  <Button 
                    onClick={() => showRoute(selectedLocation)}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    <Route className="h-4 w-4 mr-2" />
                    Show Route
                  </Button>
                  <Button 
                    onClick={clearRoute}
                    variant="outline"
                    className="flex-1"
                  >
                    Clear Route
                  </Button>
                </div>
                
                {/* Location Refresh Button */}
                <div className="mt-2 flex gap-2">
                  <Button 
                    onClick={() => {
                      setLocationError('');
                      setRouteError('');
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          (position) => {
                            const userLatLng: [number, number] = [position.coords.latitude, position.coords.longitude];
                            setUserLocation(userLatLng);
                            setLocationError('');
                            
                            // Update user marker
                            if (userMarkerRef.current && mapInstanceRef.current) {
                              userMarkerRef.current.setLatLng(userLatLng);
                              mapInstanceRef.current.setView(userLatLng, 16);
                            }
                          },
                          (error) => {
                            console.error('Geolocation error:', error);
                            setLocationError('Unable to get your location. Please enable location access or use manual input.');
                          },
                          {
                            enableHighAccuracy: true,
                            timeout: 10000,
                            maximumAge: 0
                          }
                        );
                      }
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    <Locate className="h-4 w-4 mr-2" />
                    Refresh Location
                  </Button>
                  
                  <Button 
                    onClick={() => setShowManualInput(!showManualInput)}
                    variant="outline"
                    className="flex-1"
                  >
                    📍 Manual Input
                  </Button>
                </div>

                {/* Manual Location Input */}
                {showManualInput && (
                  <Card className="glass-bright p-4 mt-4">
                    <h4 className="text-sm font-medium text-foreground mb-3">Enter Your Location Manually</h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-foreground/70 mb-1 block">Latitude</label>
                          <input
                            type="number"
                            step="0.000001"
                            placeholder="11.078500"
                            className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded text-foreground text-sm"
                            onChange={(e) => {
                              const lat = parseFloat(e.target.value);
                              if (!isNaN(lat) && manualLocation) {
                                setManualLocation([lat, manualLocation[1]]);
                              } else if (!isNaN(lat)) {
                                setManualLocation([lat, 77.140500]);
                              }
                            }}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-foreground/70 mb-1 block">Longitude</label>
                          <input
                            type="number"
                            step="0.000001"
                            placeholder="77.140500"
                            className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded text-foreground text-sm"
                            onChange={(e) => {
                              const lng = parseFloat(e.target.value);
                              if (!isNaN(lng) && manualLocation) {
                                setManualLocation([manualLocation[0], lng]);
                              } else if (!isNaN(lng)) {
                                setManualLocation([11.078500, lng]);
                              }
                            }}
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => {
                            if (manualLocation) {
                              setUserLocation(manualLocation);
                              setLocationError('');
                              
                              // Update user marker
                              if (userMarkerRef.current && mapInstanceRef.current) {
                                userMarkerRef.current.setLatLng(manualLocation);
                                mapInstanceRef.current.setView(manualLocation, 16);
                              }
                            }
                          }}
                          className="flex-1 bg-primary hover:bg-primary/90"
                          size="sm"
                        >
                          Use This Location
                        </Button>
                        <Button 
                          onClick={() => {
                            setManualLocation([11.078500, 77.140500]); // Campus center
                            setUserLocation([11.078500, 77.140500]);
                            setLocationError('');
                            
                            // Update user marker
                            if (userMarkerRef.current && mapInstanceRef.current) {
                              userMarkerRef.current.setLatLng([11.078500, 77.140500]);
                              mapInstanceRef.current.setView([11.078500, 77.140500], 16);
                            }
                          }}
                          variant="outline"
                          size="sm"
                        >
                          Use Campus Center
                        </Button>
                      </div>
                      
                      <p className="text-xs text-foreground/60">
                        💡 Tip: You can find your coordinates on Google Maps by right-clicking on your location
                      </p>
                    </div>
                  </Card>
                )}
              </div>
            )}
          </Card>

          {/* Interactive Map */}
          <Card className="glass p-8">
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">Interactive Campus Map</h2>
            </div>
            
            <div 
              ref={mapRef}
              className="w-full h-[500px] rounded-lg border border-glass-border/30 relative overflow-hidden map-container"
              style={{ 
                background: 'linear-gradient(135deg, rgba(0,212,160,0.1) 0%, rgba(0,255,200,0.05) 100%)',
                minHeight: '500px'
              }}
            >
              {!isMapLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-foreground/70">Loading interactive map...</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-4 text-sm text-foreground/60 text-center">
              <p>📍 Hover over markers to see location names</p>
              <p>🎯 Use the dropdown to select your destination</p>
            </div>
          </Card>
        </div>

        {/* Quick Access Locations */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8 neon-text-accent">
            Quick Access Locations
          </h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {locationsWithCoordinates.slice(0, 12).map(([locationKey, _]) => (
              <Card 
                key={locationKey}
                className="glass p-4 text-center cursor-pointer glow-hover transition-smooth hover:scale-105"
                onClick={() => handleLocationSelect(locationKey)}
              >
                <MapPin className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="text-sm font-medium text-foreground">
                  {formatLocationName(locationKey)}
                </h3>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampusNavigation;