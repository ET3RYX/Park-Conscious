const DEFAULT_LOCATION = { lat: 28.644800, lng: 77.216721 };
// Dynamic API URL: uses relative /api/parking on production (Vercel),
// falls back to http://localhost:5050 when running locally without the node server on port 80.
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
let userPosition = null;

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
        if (!resp.ok) throw new Error('API failed: ' + resp.status);
        parkingData = await resp.json();
        parkingData = parkingData.map(p => ({
            ...p,
            Latitude: Number(p.Latitude),
            Longitude: Number(p.Longitude),
            PricePerHour: p.PricePerHour !== undefined ? Number(p.PricePerHour) : null,
            TotalSlots: p.TotalSlots !== undefined ? Number(p.TotalSlots) : null
        }));
    } catch (e) {
        console.warn('API unavailable, falling back to local JSON:', e);
        // Graceful fallback to static JSON
        try {
            const resp = await fetch('./assets/data/parkings.json');
            parkingData = await resp.json();
            parkingData = parkingData.map(p => ({
                ...p,
                Latitude: Number(p.Latitude),
                Longitude: Number(p.Longitude),
            }));
        } catch (e2) {
            console.error('Fallback also failed:', e2);
            parkingData = [];
        }
    }
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
    document.getElementById('radius-select').addEventListener('change', () => renderNearby());

    const input = document.getElementById('autocomplete-input');
    if (input) {
        const autocomplete = new google.maps.places.Autocomplete(input);
        autocomplete.setFields(['place_id', 'geometry', 'formatted_address', 'name']);
        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place && place.geometry && place.geometry.location) {
                const loc = place.geometry.location;
                userPosition = { lat: loc.lat(), lng: loc.lng() };
                map.setCenter(userPosition);
                map.setZoom(14);
                putUserMarker();
                renderNearby();
            }
        });
    }

    getUserLocation(false);

    const tabNearby = document.getElementById('tab-nearby');
    const tabBookings = document.getElementById('tab-bookings');

    if (tabNearby && tabBookings) {
        tabNearby.addEventListener('click', () => {
            tabNearby.classList.add('border-[#00C39A]', 'text-[#00C39A]');
            tabNearby.classList.remove('border-transparent', 'text-slate-500');
            tabBookings.classList.remove('border-[#00C39A]', 'text-[#00C39A]');
            tabBookings.classList.add('border-transparent', 'text-slate-500');

            const filters = document.querySelector('.p-4.border-b .flex.justify-between');
            if (filters) filters.style.display = 'flex';

            renderNearby();
        });

        tabBookings.addEventListener('click', () => {
            tabBookings.classList.add('border-[#00C39A]', 'text-[#00C39A]');
            tabBookings.classList.remove('border-transparent', 'text-slate-500');
            tabNearby.classList.remove('border-[#00C39A]', 'text-[#00C39A]');
            tabNearby.classList.add('border-transparent', 'text-slate-500');

            const filters = document.querySelector('.p-4.border-b .flex.justify-between');
            if (filters) filters.style.display = 'none';

            renderBookingsList();
        });
    }
}

async function boot() {
    await loadParkingData();
}

function putUserMarker() {
    if (!userPosition) return;
    if (userMarker) userMarker.setMap(null);
    userMarker = new google.maps.Marker({
        position: userPosition,
        map,
        title: 'You are here',
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
    markers.forEach(m => m.setMap(null));
    markers = [];

    list.forEach(item => {
        const pos = { lat: item.Latitude, lng: item.Longitude };
        const marker = new google.maps.Marker({
            position: pos,
            map,
            title: item.Location
        });
        marker.addListener('click', () => {
            map.panTo(pos);
            map.setZoom(16);
            showInfoWindow(item, marker);
        });
        markers.push(marker);
    });
}

function showInfoWindow(item, marker) {
    const content = `
    <div style="font-family:'Inter', sans-serif; color:#0f172a; padding:4px;">
        <strong style="font-size:16px; display:block; margin-bottom:4px; font-family:'Outfit',sans-serif;">${escapeHtml(item.Location)}</strong>
        <div style="color:#64748b; font-size:13px; margin-bottom:8px;">${escapeHtml(item.Type || '')}</div>
        <div style="font-weight:600; color:#00C39A; margin-bottom:8px; font-size:14px;">${item.PricePerHour ? '₹' + item.PricePerHour + '/hr' : 'Contact'}</div>
        <button id="iw-book-${item.ID}" style="background:#0F172A; color:white; border:none; padding:8px 14px; border-radius:6px; font-size:13px; font-weight:600; cursor:pointer; width:100%;">Book Spot</button>
    </div>`;

    infoWindow.setContent(content);
    infoWindow.open(map, marker);

    google.maps.event.addListenerOnce(infoWindow, 'domready', () => {
        const btn = document.getElementById(`iw-book-${item.ID}`);
        if (btn) btn.addEventListener('click', () => openBookingModal(item));
    });
}

function renderNearby() {
    if (!userPosition) {
        const listEl = document.getElementById('results-list');
        if (listEl) listEl.innerHTML = '<div class="text-center p-6 text-slate-400 text-sm font-medium">Location not set. <br>Click "My Location" or search.</div>';
        return;
    }
    const radiusKm = Number(document.getElementById('radius-select').value);

    const enriched = parkingData.map(p => {
        const d = haversineDistance(userPosition.lat, userPosition.lng, p.Latitude, p.Longitude);
        return { ...p, distance_km: d };
    });
    const filtered = enriched.filter(p => p.distance_km <= radiusKm).sort((a, b) => a.distance_km - b.distance_km);
    const results = filtered.slice(0, 30);

    const listEl = document.getElementById('results-list');
    listEl.innerHTML = '';

    if (results.length === 0) {
        listEl.innerHTML = '<div class="text-center p-6 text-slate-400 font-medium">No spots found in this radius.</div>';
    } else {
        results.forEach(p => {
            const el = document.createElement('div');
            el.className = 'glass-card rounded-xl p-4 cursor-pointer relative group';
            el.innerHTML = `
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <h4 class="font-bold text-slate-900 text-base">${escapeHtml(p.Location)}</h4>
                        <div class="text-xs text-slate-500">${escapeHtml(p.Authority || '')}</div>
                    </div>
                    <div class="bg-[#00C39A]/10 text-[#00C39A] text-xs px-2 py-1 rounded font-bold">
                        ${(p.distance_km).toFixed(1)} km
                    </div>
                </div>
                <div class="flex items-center gap-4 my-3 text-sm">
                    <div class="flex items-center text-slate-700">
                        <span class="font-bold mr-1">${p.PricePerHour ? '₹' + p.PricePerHour : 'Contact'}</span>
                        <span class="text-slate-400 text-xs font-medium">/hr</span>
                    </div>
                    <div class="flex items-center text-slate-600">
                        <span class="w-2 h-2 rounded-full bg-emerald-400 mr-2 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></span>
                        <span class="text-xs font-medium">${p.TotalSlots ? p.TotalSlots + ' slots' : 'Open'}</span>
                    </div>
                </div>
                <button class="book-btn w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-lg mt-1" data-id="${p.ID}">
                    Book Now
                </button>
            `;
            listEl.appendChild(el);

            el.addEventListener('click', (e) => {
                if (!e.target.classList.contains('book-btn')) {
                    map.panTo({ lat: p.Latitude, lng: p.Longitude });
                    map.setZoom(16);
                }
            });
            el.querySelector('.book-btn').addEventListener('click', (ev) => {
                ev.stopPropagation();
                openBookingModal(p);
            });
        });
    }

    document.getElementById('results-count').innerText = results.length;
    renderMarkers(results);
}

function renderBookingsList() {
    const listEl = document.getElementById('results-list');
    listEl.innerHTML = '';
    const bookings = loadBookings();

    if (bookings.length === 0) {
        listEl.innerHTML = '<div class="text-center p-6 text-slate-400 text-sm font-medium">No active bookings found.</div>';
    } else {
        bookings.reverse().forEach(b => {
            const el = document.createElement('div');
            el.className = 'glass-card rounded-xl p-4 relative group mb-3';
            el.innerHTML = `
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <h4 class="font-bold text-slate-900 text-base">${escapeHtml(b.locationName)}</h4>
                        <div class="text-xs text-[#00C39A] font-mono mt-1 font-semibold">ID: ${b.id}</div>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-2 text-sm my-3">
                    <div>
                        <div class="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Time</div>
                         <div class="text-slate-700 font-medium text-sm">${b.startTime} - ${b.endTime}</div>
                    </div>
                     <div>
                        <div class="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Amount</div>
                         <div class="text-slate-700 font-medium text-sm">${b.amount}</div>
                    </div>
                </div>
                <div class="w-full bg-emerald-50 border border-emerald-100 text-emerald-600 py-2 rounded-lg text-sm text-center font-bold mt-2">
                    Confirmed
                </div>
            `;
            listEl.appendChild(el);
        });
    }
}

function openBookingModal(item) {
    const modalRoot = document.getElementById('modal-root');
    modalRoot.innerHTML = `
    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-white border border-slate-100 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative transform transition-all">
            <div class="p-6 border-b border-slate-100 bg-slate-50/50">
                <h3 class="text-2xl font-black text-slate-900 mb-1 tracking-tight">${escapeHtml(item.Location)}</h3>
                <p class="text-[#00C39A] text-sm font-bold">Rate: ${item.PricePerHour ? '₹' + item.PricePerHour + '/hr' : 'Contact Price'}</p>
            </div>
            <div class="p-6 space-y-5">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs text-slate-500 uppercase font-bold mb-1.5 tracking-wider">Start Time</label>
                        <input id="start-time" type="time" value="09:00" class="w-full bg-white text-slate-900 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#00C39A]/20 focus:border-[#00C39A] outline-none font-medium shadow-sm transition-all text-center">
                    </div>
                    <div>
                        <label class="block text-xs text-slate-500 uppercase font-bold mb-1.5 tracking-wider">End Time</label>
                        <input id="end-time" type="time" value="10:00" class="w-full bg-white text-slate-900 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#00C39A]/20 focus:border-[#00C39A] outline-none font-medium shadow-sm transition-all text-center">
                    </div>
                </div>
                <div>
                    <label class="block text-xs text-slate-500 uppercase font-bold mb-1.5 tracking-wider">Duration (Hrs)</label>
                    <input id="num-hours" type="number" min="1" value="1" class="w-full bg-white text-slate-900 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#00C39A]/20 focus:border-[#00C39A] outline-none font-medium shadow-sm transition-all text-center">
                </div>
                <div class="flex items-center justify-between bg-slate-50 p-5 rounded-xl border border-slate-100 shadow-inner mt-2">
                    <span class="text-slate-500 font-semibold">Total Estimate</span>
                    <span id="total-fare" class="text-3xl font-black text-slate-900 tracking-tight">₹0</span>
                </div>
            </div>
            <div class="p-6 bg-slate-50 flex gap-3 border-t border-slate-100">
                <button id="cancel-book" class="flex-1 py-3 px-4 rounded-xl text-slate-500 font-bold hover:bg-slate-200 transition-colors">Cancel</button>
                <button id="confirm-book" class="flex-1 py-3 px-4 rounded-xl bg-[#00C39A] text-white font-bold shadow-lg shadow-emerald-500/25 hover:bg-[#00A683] hover:-translate-y-0.5 transition-all">Confirm Booking</button>
            </div>
        </div>
    </div>
    `;

    function computeFare() {
        const price = item.PricePerHour ? Number(item.PricePerHour) : null;
        let hrs = Number(document.getElementById('num-hours').value) || 1;
        if (hrs < 1) hrs = 1;
        const total = price ? price * hrs : 'N/A';
        document.getElementById('total-fare').innerText = price ? '₹' + total : 'Contact';
    }

    const updateHours = () => {
        const start = document.getElementById('start-time').value;
        const end = document.getElementById('end-time').value;
        if (start && end) {
            const [sh, sm] = start.split(':').map(Number); const [eh, em] = end.split(':').map(Number);
            let hours = eh + em / 60 - (sh + sm / 60);
            if (hours <= 0) hours = 1;
            document.getElementById('num-hours').value = Math.ceil(hours);
            computeFare();
        }
    }

    document.getElementById('num-hours').addEventListener('input', computeFare);
    document.getElementById('start-time').addEventListener('change', updateHours);
    document.getElementById('end-time').addEventListener('change', updateHours);

    document.getElementById('cancel-book').addEventListener('click', closeModal);
    document.getElementById('confirm-book').addEventListener('click', () => {
        const bookingId = 'BK' + Date.now().toString().slice(-6);
        const modalRoot = document.getElementById('modal-root');

        saveBooking({
            id: bookingId,
            locationName: item.Location,
            startTime: document.getElementById('start-time').value,
            endTime: document.getElementById('end-time').value,
            amount: document.getElementById('total-fare').innerText,
            date: new Date().toISOString()
        });

        modalRoot.innerHTML = `
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div class="bg-white border border-slate-100 rounded-3xl w-full max-w-sm text-center p-8 shadow-2xl relative transform transition-all scale-100">
                <div class="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-emerald-500/10">
                    <svg class="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                </div>
                <h3 class="text-3xl font-black text-slate-900 mb-2 tracking-tight">Success!</h3>
                <p class="text-slate-500 mb-8 font-medium">Your spot is securely reserved.</p>
                <div class="bg-slate-50 rounded-2xl p-5 mb-8 border border-slate-200 border-dashed">
                    <div class="text-xs text-slate-400 uppercase font-bold mb-1 tracking-widest">Booking ID</div>
                    <div class="text-2xl font-mono text-slate-900 font-bold tracking-widest">${bookingId}</div>
                </div>
                <button id="close-ok" class="w-full py-4 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all text-lg shadow-xl shadow-slate-900/20 hover:-translate-y-1">Done</button>
            </div>
        </div>
        `;
        document.getElementById('close-ok').addEventListener('click', () => {
            document.getElementById('modal-root').innerHTML = '';
            const tabBookings = document.getElementById('tab-bookings');
            if (tabBookings) tabBookings.click();
        });
    });

    computeFare();
}

function closeModal() {
    document.getElementById('modal-root').innerHTML = '';
}

function escapeHtml(s) {
    if (!s && s !== 0) return '';
    return String(s).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

function getUserLocation(requirePrompt) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            userPosition = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            map.setCenter(userPosition);
            map.setZoom(14);
            putUserMarker();
            renderNearby();
        }, err => {
            console.warn('Geolocation error', err);
            if (requirePrompt) alert('Location access needed to find nearby spots.');
            userPosition = null;
            map.setCenter(DEFAULT_LOCATION);
            renderNearby();
        }, { enableHighAccuracy: true, timeout: 8000 });
    } else {
        if (requirePrompt) alert('Geolocation not supported.');
    }
}

boot();
window.initMap = initMap;
