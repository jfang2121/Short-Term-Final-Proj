import React, { FC, useState, useEffect, useRef } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "./Map.css";

interface Place {
  name: string;
  position: [number, number];
  address: string;
  phone: string;
  website: string;
  imageUrl: string;
  reviews?: string[];
}

const initialPlaces: Place[] = [
  {
    name: "Clinica Esperanza",
    position: [41.8107889, -71.4090636],
    address: "60 Valley Street #104, Providence, RI 02909",
    phone: "(401) 347-9093",
    website: "https://clinica-esperanza-hope-clinic.business.site/",
    imageUrl:
      "https://lh3.googleusercontent.com/d/1A5ZnUqnTW5Ht740cCuOKJpkCGXG5CW3J",
    reviews: ["Great clinic!", "Very helpful staff."],
  },
  {
    name: "Hasbro Children's Hospital",
    position: [41.8430595, -71.3801977],
    address: "593 Eddy Street, Providence, Rhode Island",
    phone: "(401) 444-4000",
    website: "https://www.lifespan.org/locations/hasbro-childrens-hospital",
    imageUrl:
      "https://lh3.googleusercontent.com/d/1AC8CdGALEVBJRVf5xmUIUhnjUmVs730f",
    reviews: ["Excellent care for children."],
  },
  {
    name: "Butler Hospital",
    position: [41.8189506, -71.4412852],
    address: "345 Blackstone Blvd, Providence, RI 02906",
    phone: "(401) 455-6200",
    website: "https://www.butler.org/",
    imageUrl:
      "https://lh3.googleusercontent.com/d/1j6uM6Se_jxGW8__7CaCRNrlDafrOpVbs",
    reviews: ["Good psychiatric services."],
  },
  {
    name: "Providence Community Health Center Prairie Avenue",
    position: [41.8042408, -71.4148153],
    address: "355 Prairie Ave, Providence, RI 02905",
    phone: "(401) 444-0570",
    website:
      "https://www.providencechc.org/locations/4-locations/pchc-prairie-avenue",
    imageUrl:
      "https://lh3.googleusercontent.com/d/1ZNJwr-XSjlifEeSKI_mCwoK4TjCbxEfe",
    reviews: ["Friendly staff."],
  },
  {
    name: "Providence Community Health Center Olneyville",
    position: [41.822519, -71.4512189],
    address: "100 Curtis St Providence, RI 02908",
    phone: "(401) 444-0540",
    website: "https://www.providencechc.org/locations/pchc-olneyville",
    imageUrl:
      "https://lh3.googleusercontent.com/d/1Suw-hvwztsjvz0ngK8J5WahzI2syG6ig",
    reviews: ["Convenient location."],
  },
  {
    name: "Providence Community Health Center Crossroads",
    position: [41.8169108, -71.4167171],
    address: "160 Broad Street Providence, RI 02908",
    phone: "(401) 861-2403",
    website: "https://www.providencechc.org/locations/pchc-crossroads",
    imageUrl:
      "https://lh3.googleusercontent.com/d/1UIK6qbhESZy9xe6hNpMDed24qdvwoLUP",
    reviews: ["Great services."],
  },
  {
    name: "Another Clinic",
    position: [41.8357388, -71.4229214],
    address: "123 Example St, Providence, RI 02909",
    phone: "(401) 123-4567",
    website: "http://example2.com",
    imageUrl:
      "https://lh3.googleusercontent.com/d/1_trvcS18dK3uOlr5_juPodZuiAX9vjtG",
    reviews: ["Helpful staff."],
  },
];

const Map: FC = () => {
  const [places, setPlaces] = useState<Place[]>(() => {
    const savedPlaces = localStorage.getItem("places");
    return savedPlaces ? JSON.parse(savedPlaces) : initialPlaces;
  });

  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const placeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mapRef = useRef<L.Map | null>(null);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newPlace, setNewPlace] = useState<Partial<Place>>({
    name: "",
    position: [0, 0],
    address: "",
    phone: "",
    website: "",
    imageUrl: "",
  });

  useEffect(() => {
    localStorage.setItem("places", JSON.stringify(places));
  }, [places]);

  const handleSidebarClick = (place: Place, index: number) => {
    setSelectedPlace(place);
    placeRefs.current[index]?.scrollIntoView({ behavior: "smooth" });
    if (mapRef.current) {
      mapRef.current.flyTo(place.position, 15, { animate: true });
    }
  };

  const handleMarkerClick = (place: Place, index: number) => {
    setSelectedPlace(place);
    placeRefs.current[index]?.scrollIntoView({ behavior: "smooth" });
  };

  const createCustomIcon = (number: number) => {
    return L.divIcon({
      html: `<div class="custom-marker"><div class="marker-number">${number}</div></div>`,
      className: "custom-icon",
      iconSize: [30, 42],
      iconAnchor: [15, 42],
    });
  };

  const filteredPlaces = places.filter((place) =>
    place.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "latitude" || name === "longitude") {
      setNewPlace((prev) => ({
        ...prev,
        position: [
          name === "latitude" ? parseFloat(value) : prev.position[0],
          name === "longitude" ? parseFloat(value) : prev.position[1],
        ],
      }));
    } else {
      setNewPlace((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingIndex !== null) {
      setPlaces((prev) =>
        prev.map((place, index) =>
          index === editingIndex
            ? {
                name: newPlace.name || place.name,
                position:
                  (newPlace.position as [number, number]) || place.position,
                address: newPlace.address || place.address,
                phone: newPlace.phone || place.phone,
                website: newPlace.website || place.website,
                imageUrl: newPlace.imageUrl || place.imageUrl,
                reviews: place.reviews,
              }
            : place
        )
      );
      setEditingIndex(null);
    } else {
      setPlaces((prev) => [
        ...prev,
        {
          name: newPlace.name || "Unnamed Place",
          position: newPlace.position as [number, number],
          address: newPlace.address || "No Address Provided",
          phone: newPlace.phone || "No Phone Number Provided",
          website: newPlace.website || "No Website Provided",
          imageUrl: newPlace.imageUrl || "https://via.placeholder.com/150",
          reviews: [],
        },
      ]);
    }
    setNewPlace({
      name: "",
      position: [0, 0],
      address: "",
      phone: "",
      website: "",
      imageUrl: "",
    });
  };

  const handleEditClick = (index: number) => {
    setEditingIndex(index);
    const place = places[index];
    setNewPlace({
      name: place.name,
      position: place.position,
      address: place.address,
      phone: place.phone,
      website: place.website,
      imageUrl: place.imageUrl,
    });
  };

  return (
    <div className="flex">
      <div className="w-1/3 h-screen overflow-y-auto bg-gray-100 p-0">
        <div className="sticky top-0 bg-gray-100 p-4 z-10">
          <input
            type="text"
            className="w-full p-2 border rounded"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {filteredPlaces.map((place, idx) => (
          <div
            key={idx}
            ref={(el) => (placeRefs.current[idx] = el)}
            className={`p-4 mb-4 border rounded ${
              selectedPlace?.name === place.name ? "bg-blue-100" : "bg-white"
            }`}
            onClick={() => handleSidebarClick(place, idx)}
          >
            <div className="flex space-x-4 overflow-x-scroll">
              <div className="flex-shrink-0 w-full">
                <h2 className="font-bold text-lg mb-2">{place.name}</h2>
                <img
                  src={place.imageUrl}
                  alt={place.name}
                  className="w-full h-48 object-contain mb-2 rounded"
                />
                <p>{place.address}</p>
                <p>{place.phone}</p>
                <a
                  href={place.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  {place.website}
                </a>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditClick(idx);
                  }}
                  className="mt-2 text-gray-500 underline w-full text-left"
                >
                  Edit
                </button>
              </div>
              <div className="flex-shrink-0 w-full">
                <h2 className="font-bold text-lg mb-2">Reviews</h2>
                {place.reviews && place.reviews.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {place.reviews.map((review, idx) => (
                      <li key={idx} className="mb-2">
                        {review}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No reviews now.</p>
                )}
              </div>
            </div>
          </div>
        ))}
        <form onSubmit={handleFormSubmit} className="p-4 border rounded mt-4">
          <h2 className="font-bold text-lg mb-2">
            {editingIndex !== null ? "Edit Place" : "Add New Place"}
          </h2>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={newPlace.name}
            onChange={handleInputChange}
            className="w-full p-2 mb-2 border rounded"
          />
          <input
            type="number"
            name="latitude"
            placeholder="Latitude"
            value={newPlace.position[0]}
            onChange={handleInputChange}
            className="w-full p-2 mb-2 border rounded"
          />
          <input
            type="number"
            name="longitude"
            placeholder="Longitude"
            value={newPlace.position[1]}
            onChange={handleInputChange}
            className="w-full p-2 mb-2 border rounded"
            min={-180}
            max={180}
            step="any"
          />
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={newPlace.address}
            onChange={handleInputChange}
            className="w-full p-2 mb-2 border rounded"
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone"
            value={newPlace.phone}
            onChange={handleInputChange}
            className="w-full p-2 mb-2 border rounded"
          />
          <input
            type="url"
            name="website"
            placeholder="Website"
            value={newPlace.website}
            onChange={handleInputChange}
            className="w-full p-2 mb-2 border rounded"
          />
          <input
            type="url"
            name="imageUrl"
            placeholder="Image URL"
            value={newPlace.imageUrl}
            onChange={handleInputChange}
            className="w-full p-2 mb-2 border rounded"
          />
          <button
            type="submit"
            className="w-full p-2 bg-blue-500 text-white rounded"
          >
            {editingIndex !== null ? "Save Changes" : "Add Place"}
          </button>
        </form>
      </div>
      <div className="w-2/3 h-screen">
        <MapContainer
          center={[41.8107889, -71.4090636]}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: "100vh" }}
          whenCreated={(mapInstance) => {
            mapRef.current = mapInstance;
            setIsMapInitialized(true);
          }}
        >
          <TileLayer
            attribution={`&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors`}
            url={`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`}
          />
          {filteredPlaces.map((place, idx) => (
            <Marker
              key={idx}
              position={place.position}
              icon={createCustomIcon(idx + 1)}
              eventHandlers={{
                click: () => handleMarkerClick(place, idx),
              }}
            >
              <Popup>
                <img
                  src={place.imageUrl}
                  alt={place.name}
                  className="w-full h-auto max-h-48 object-contain mb-2 rounded"
                />
                <b>{place.name}</b> <br /> {place.address}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default Map;
