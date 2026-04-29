const DEFAULT_LOCATION = { lat: 28.644800, lng: 77.216721 };

function getParkingApiUrl() {
    const isLocalFile = window.location.protocol === 'file:';
    if (isLocalFile) return './assets/data/parkings.json';
    const hostname = window.location.hostname;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
    const isBuildServer = window.location.port === '3000';
    if (isLocal && !isBuildServer) return 'http://localhost:5050/api/parking';
    return '/api/parking';
}

let map, userMarker, parkingData = [], markers = [], infoWindow;
let userPosition = { ...DEFAULT_LOCATION }; 
let dataLoaded = false;
let isochronePolygon = null;
let isochroneBounds = null;
let currentDriveTime = 10;
let abortController = null;
let debounceTimer = null;

function toRad(deg) { return deg * Math.PI / 180; }
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371.0;
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function saveBooking(booking) {
    const bookings = loadBookings();
    bookings.push(booking);
    localStorage.setItem('parkings_bookings', JSON.stringify(bookings));
}

function loadBookings() {
    const s = localStorage.getItem('parkings_bookings');
    return s ? JSON.parse(s) : [];
}

async function loadParkingData() {
    try {
        const url = getParkingApiUrl();
        const resp = await fetch(url);
        if (!resp.ok) throw new Error('API failed');
        parkingData = await resp.json();
    } catch (e) {
        console.warn('API unavailable, falling back to local JSON');
        try {
            const resp = await fetch('./assets/data/parkings.json');
            parkingData = await resp.json();
        } catch (e2) {
            console.error('Fallback failed', e2);
            parkingData = [];
        }
    }
    
    parkingData = (parkingData || []).map(p => ({
        ...p,
        Latitude: Number(p.Latitude),
        Longitude: Number(p.Longitude),
        PricePerHour: p.PricePerHour !== undefined ? Number(p.PricePerHour) : null,
        TotalSlots: p.TotalSlots !== undefined ? Number(p.TotalSlots) : null
    }));
    
    dataLoaded = true;
    if (map) fetchIsochroneAndRender();
}

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: DEFAULT_LOCATION,
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false
    });
    infoWindow = new google.maps.InfoWindow();

    map.addListener('click', () => { infoWindow.close(); });

    document.getElementById('locate-btn').addEventListener('click', () => getUserLocation(true));
    
    const slider = document.getElementById('drive-time-slider');
    const display = document.getElementById('drive-time-display');
    if (slider) {
        slider.addEventListener('input', (e) => {
            if (display) display.innerText = `${e.target.value} min drive`;
        });
        slider.addEventListener('change', (e) => {
            currentDriveTime = Number(e.target.value);
            if (debounceTimer) clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                fetchIsochroneAndRender();
            }, 250);
        });
    }

    const input = document.getElementById('autocomplete-input');
    if (input) {
        const autocomplete = new google.maps.places.Autocomplete(input);
        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place && place.geometry && place.geometry.location) {
                userPosition = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
                map.setCenter(userPosition);
                putUserMarker();
                fetchIsochroneAndRender();
            }
        });
    }
    
    getUserLocation(false);
    if (dataLoaded) fetchIsochroneAndRender();
    
    // Tab logic
    const tabNearby = document.getElementById('tab-nearby');
    const tabBookings = document.getElementById('tab-bookings');
    if (tabNearby && tabBookings) {
        tabNearby.addEventListener('click', () => {
            tabNearby.classList.add('border-[#00C39A]', 'text-[#00C39A]');
            tabBookings.classList.remove('border-[#00C39A]', 'text-[#00C39A]');
            fetchIsochroneAndRender();
        });
        tabBookings.addEventListener('click', () => {
            tabBookings.classList.add('border-[#00C39A]', 'text-[#00C39A]');
            tabNearby.classList.remove('border-[#00C39A]', 'text-[#00C39A]');
            renderBookingsList();
        });
    }
}

function putUserMarker() {
    if (!userPosition || !map) return;
    if (userMarker) userMarker.setMap(null);
    userMarker = new google.maps.Marker({
        position: userPosition,
        map,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#00C39A',
            fillOpacity: 1,
            strokeWeight: 3,
            strokeColor: '#fff'
        }
    });
}

function renderMarkers(list) {
    const oldMarkers = [...markers];
    markers = [];
    list.forEach(item => {
        const marker = new google.maps.Marker({
            position: { lat: item.Latitude, lng: item.Longitude },
            map,
            optimized: true
        });
        marker.addListener('click', () => {
            showInfoWindow(item, marker);
        });
        markers.push(marker);
    });
    setTimeout(() => oldMarkers.forEach(m => m.setMap(null)), 50);
}

function showInfoWindow(item, marker) {
    const content = `<div style="padding:10px;"><strong>${escapeHtml(item.Location)}</strong><br>₹${item.PricePerHour}/hr</div>`;
    infoWindow.setContent(content);
    infoWindow.open(map, marker);
}

function renderNearby() {
    const listEl = document.getElementById('results-list');
    if (!dataLoaded) {
        if (listEl) listEl.innerHTML = '<div class="p-6 text-slate-400 italic">Syncing data...</div>';
        return;
    }

    const enriched = parkingData.map(p => ({
        ...p,
        distance_km: haversineDistance(userPosition.lat, userPosition.lng, p.Latitude, p.Longitude)
    }));
    
    let filtered;
    if (isochronePolygon && isochroneBounds) {
        filtered = enriched.filter(p => {
            const latLng = new google.maps.LatLng(p.Latitude, p.Longitude);
            if (!isochroneBounds.contains(latLng)) return false;
            return google.maps.geometry.poly.containsLocation(latLng, isochronePolygon);
        });
    } else {
        const radius = currentDriveTime / 2;
        filtered = enriched.filter(p => p.distance_km <= radius);
    }
    
    filtered.sort((a, b) => a.distance_km - b.distance_km);
    const results = filtered.slice(0, 50);

    if (listEl) {
        listEl.innerHTML = results.length ? '' : '<div class="p-6 text-center text-slate-400">No spots found.</div>';
        results.forEach(p => {
            const el = document.createElement('div');
            el.className = 'glass-card rounded-xl p-4 mb-3 cursor-pointer';
            el.innerHTML = `<h4 class="font-bold">${escapeHtml(p.Location)}</h4><p class="text-xs text-[#00C39A]">${p.distance_km.toFixed(1)} km away</p>`;
            el.addEventListener('click', () => map.panTo({ lat: p.Latitude, lng: p.Longitude }));
            listEl.appendChild(el);
        });
    }
    
    const countEl = document.getElementById('results-count');
    if (countEl) countEl.innerText = results.length;
    renderMarkers(results);
}

async function fetchIsochroneAndRender() {
    if (!userPosition || !map) return;
    
    if (abortController) abortController.abort();
    abortController = new AbortController();

    renderNearby();

    const apiUrl = window.PARK_CONFIG?.getDmieUrl ? window.PARK_CONFIG.getDmieUrl() : 'https://dmie.parkconscious.in/api/v1';
    try {
        const resp = await fetch(`${apiUrl}/isochrone`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lat: userPosition.lat, lng: userPosition.lng, minutes: currentDriveTime }),
            signal: abortController.signal
        });
        if (resp.ok) {
            const geojson = await resp.json();
            if (geojson) {
                map.data.forEach(f => map.data.remove(f));
                map.data.addGeoJson(geojson);
                map.data.setStyle({ fillColor: '#00C39A', fillOpacity: 0.3, strokeColor: '#00C39A', strokeWeight: 2, clickable: false });
                
                let coords;
                if (geojson.features?.[0]) {
                    const geom = geojson.features[0].geometry;
                    coords = geom.type === 'Polygon' ? geom.coordinates[0] : geom.coordinates[0][0];
                }
                
                if (coords) {
                    const paths = coords.map(c => ({ lat: c[1], lng: c[0] }));
                    if (isochronePolygon) isochronePolygon.setMap(null);
                    isochronePolygon = new google.maps.Polygon({ paths: paths });
                    isochroneBounds = new google.maps.LatLngBounds();
                    paths.forEach(p => isochroneBounds.extend(p));
                    map.fitBounds(isochroneBounds);
                }
            }
        }
    } catch (e) {
        if (e.name !== 'AbortError') console.warn("Isochrone failed", e);
    }
    renderNearby();
}

function getUserLocation(requirePrompt) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            userPosition = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            map.setCenter(userPosition);
            putUserMarker();
            fetchIsochroneAndRender();
        }, () => {
            if (requirePrompt) alert('Location denied.');
            fetchIsochroneAndRender();
        });
    } else {
        fetchIsochroneAndRender();
    }
}

function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

loadParkingData();
window.initMap = initMap;
