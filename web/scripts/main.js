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
let userPosition = { ...DEFAULT_LOCATION }; 
let dataLoaded = false;
let isochronePolygon = null;
let isochroneBounds = null; // Pre-calculated bounds for fast filtering
let currentDriveTime = 10;
let abortController = null; // For cancelling stale requests
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
            // Debounce the fetch to prevent clogging
            if (debounceTimer) clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                fetchIsochroneAndRender();
            }, 250);
        });
    }

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
                fetchIsochroneAndRender();
            }
        });
    }
    
    // Auto-discover location in background
    getUserLocation(false);
    
    // If data is already back from API (fast cache), render immediately
    if (dataLoaded) fetchIsochroneAndRender();

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

            fetchIsochroneAndRender();
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
    // 1. Mark old markers for removal
    const oldMarkers = [...markers];
    markers = [];

    // 2. Create new markers but keep it lightweight
    list.forEach(item => {
        const pos = { lat: item.Latitude, lng: item.Longitude };
        const marker = new google.maps.Marker({
            position: pos,
            map,
            title: item.Location,
            optimized: true // Use Google's hardware acceleration
        });
        marker.addListener('click', () => {
            map.panTo(pos);
            map.setZoom(16);
            showInfoWindow(item, marker);
        });
        markers.push(marker);
    });

    // 3. Clean up old markers after the new ones are ready
    setTimeout(() => {
        oldMarkers.forEach(m => m.setMap(null));
    }, 10);
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
    if (!userPosition || !dataLoaded) {
        const listEl = document.getElementById('results-list');
        if (listEl && !dataLoaded) listEl.innerHTML = '<div class="text-center p-6 text-slate-400 text-sm font-medium italic animate-pulse">Syncing smart data...</div>';
        return;
    }

    const enriched = parkingData.map(p => {
        const d = haversineDistance(userPosition.lat, userPosition.lng, p.Latitude, p.Longitude);
        return { ...p, distance_km: d };
    });
    
    let filtered;
    if (isochronePolygon && isochroneBounds) {
        filtered = enriched.filter(p => {
            const latLng = new google.maps.LatLng(p.Latitude, p.Longitude);
            // 1. Instant check using pre-calculated bounds
            if (!isochroneBounds.contains(latLng)) return false;
            // 2. Heavy math only for candidates
            return google.maps.geometry.poly.containsLocation(latLng, isochronePolygon);
        });
    } else {
        const fallbackRadius = currentDriveTime / 2;
        filtered = enriched.filter(p => p.distance_km <= fallbackRadius);
    } else {
        // Fallback
        filtered = enriched.filter(p => p.distance_km <= (currentDriveTime / 2));
    }
    
    filtered.sort((a, b) => a.distance_km - b.distance_km);
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

async function renderBookingsList() {
    const listEl = document.getElementById('results-list');
    listEl.innerHTML = '<div class="text-center p-6 text-slate-400 text-sm font-medium italic">Syncing with server...</div>';
    
    const userStr = localStorage.getItem('park_user');
    if (!userStr) {
        listEl.innerHTML = `
            <div class="flex flex-col items-center justify-center p-12 text-center space-y-6">
                <div class="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center shadow-inner">
                    <svg class="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <div>
                    <h3 class="text-xl font-black text-slate-900 mb-2">Login Required</h3>
                    <p class="text-slate-500 text-sm max-w-[200px] mx-auto font-medium leading-relaxed italic">Sign in to sync your bookings across devices & view your tickets.</p>
                </div>
                <a href="login.html" class="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10">Login Now</a>
                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">or book a parking to start</p>
            </div>
        `;
        return;
    }

    try {
        const user = JSON.parse(userStr);
        const resp = await fetch(`/api/bookings/${user.id}`);
        if (resp.ok) {
            bookings = await resp.json();
        } else {
            bookings = loadBookings();
        }
    } catch (err) {
        console.warn("Could not fetch remote bookings:", err);
        bookings = loadBookings();
    }

    listEl.innerHTML = '';
    if (bookings.length === 0) {
        listEl.innerHTML = '<div class="text-center p-6 text-slate-400 text-sm font-medium">No active bookings found.</div>';
    } else {
        bookings.sort((a,b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)).forEach(b => {
            const el = document.createElement('div');
            el.className = 'glass-card rounded-xl p-4 relative group mb-3 border-l-4 border-l-[#00C39A]';
            const bookingId = b._id || b.id;
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${bookingId}`;
            
            el.innerHTML = `
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <h4 class="font-bold text-slate-900 text-base">${escapeHtml(b.locationName)}</h4>
                        <div class="text-[10px] text-slate-400 font-mono mt-0.5 tracking-tighter uppercase">Ref: ${bookingId}</div>
                    </div>
                    <div class="text-right">
                         <div class="text-[#00C39A] font-bold text-sm">${b.amount}</div>
                         <div class="text-[10px] text-slate-400 font-bold uppercase">${b.status || 'Confirmed'}</div>
                         <button onclick="removeBooking('${bookingId}', this)" class="block ml-auto mt-1 text-[10px] font-bold text-red-400 hover:text-red-500 transition-colors uppercase tracking-widest bg-red-50 px-2 py-1 rounded-md">Cancel</button>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm my-3 py-2 border-y border-slate-50">
                    <div>
                        <div class="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-0.5">Time</div>
                         <div class="text-slate-700 font-bold text-xs">${b.startTime} - ${b.endTime}</div>
                    </div>
                     <div>
                        <div class="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-0.5">Vehicle</div>
                         <div class="text-slate-700 font-bold text-xs truncate">${escapeHtml(b.vehicleNumber || 'N/A')}</div>
                    </div>
                </div>
                <div class="flex items-center gap-2 mt-2">
                    <button onclick="this.nextElementSibling.classList.toggle('hidden')" class="text-[10px] font-bold text-slate-500 hover:text-slate-900 uppercase tracking-widest flex items-center gap-1 transition-colors">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m0 11v1m-7-7h1m11 0h1m-9.414-9.414l.707.707m9.414 9.414l.707.707M6.343 17.657l.707-.707m9.414-9.414l.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        Show QR Code
                    </button>
                    <div class="hidden mt-2 p-2 bg-white rounded-lg border border-slate-100 shadow-sm mx-auto">
                        <img src="${qrUrl}" alt="QR" class="w-32 h-32">
                    </div>
                </div>
            `;
            listEl.appendChild(el);
        });
    }
}

async function removeBooking(id, btn) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
        const originalText = btn.innerText;
        btn.innerText = 'Removing...';
        btn.disabled = true;
        const resp = await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
        if (resp.ok) {
            renderBookingsList();
        } else {
            alert('Failed to remove booking');
            btn.innerText = originalText;
            btn.disabled = false;
        }
    } catch(err) {
        alert('Server Error');
        btn.disabled = false;
    }
}

function openBookingModal(item) {
    const userStr = localStorage.getItem('park_user');
    if (!userStr) {
        alert('Please login to book a parking spot.');
        window.location.href = 'login.html';
        return;
    }
    const user = JSON.parse(userStr);

    const modalRoot = document.getElementById('modal-root');
    modalRoot.innerHTML = `
    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-white border border-slate-100 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative transform transition-all">
            <div class="p-6 border-b border-slate-100 bg-slate-50/50">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="text-2xl font-black text-slate-900 mb-1 tracking-tight">${escapeHtml(item.Location)}</h3>
                        <p class="text-[#00C39A] text-sm font-bold">Rate: ${item.PricePerHour ? '₹' + item.PricePerHour + '/hr' : 'Contact Price'}</p>
                    </div>
                    <button onclick="closeModal()" class="text-slate-400 hover:text-slate-900 transition-colors">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>
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

                <div class="grid grid-cols-2 gap-4">
                    <div>
                         <label class="block text-xs text-slate-500 uppercase font-bold mb-1.5 tracking-wider">Vehicle Type</label>
                         <select id="vehicle-type" class="w-full bg-white text-slate-900 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#00C39A]/20 focus:border-[#00C39A] outline-none font-medium shadow-sm transition-all">
                             <option value="4wheeler">Car / SUV</option>
                             <option value="2wheeler">Two Wheeler</option>
                             <option value="heavy">Heavy Vehicle</option>
                         </select>
                    </div>
                    <div>
                        <label class="block text-xs text-slate-500 uppercase font-bold mb-1.5 tracking-wider">Vehicle Number</label>
                        <input id="vehicle-number" type="text" placeholder="DL 01 AB 1234" class="w-full bg-white text-slate-900 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#00C39A]/20 focus:border-[#00C39A] outline-none font-medium shadow-sm transition-all uppercase placeholder:italic">
                    </div>
                </div>

                <div class="flex items-center justify-between bg-slate-50 p-5 rounded-xl border border-slate-100 shadow-inner mt-2">
                    <span class="text-slate-500 font-semibold text-sm italic">Total Estimate</span>
                    <span id="total-fare" class="text-3xl font-black text-slate-900 tracking-tight">₹0</span>
                </div>
            </div>
            <div class="p-6 bg-slate-50 flex gap-3 border-t border-slate-100">
                <button id="confirm-book" class="w-full py-4 rounded-xl bg-slate-900 text-white font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 hover:-translate-y-0.5 transition-all text-lg">Confirm Booking</button>
            </div>
        </div>
    </div>
    `;

    const numHoursInput = document.createElement('input'); 
    numHoursInput.id = 'num-hours'; numHoursInput.type = 'hidden'; numHoursInput.value = '1';
    document.body.appendChild(numHoursInput);

    function computeFare() {
        const price = item.PricePerHour ? Number(item.PricePerHour) : null;
        const start = document.getElementById('start-time').value;
        const end = document.getElementById('end-time').value;
        let hrs = 1;
        if (start && end) {
             const [sh, sm] = start.split(':').map(Number); const [eh, em] = end.split(':').map(Number);
             hrs = eh + em / 60 - (sh + sm / 60);
             if (hrs <= 0) hrs = 1;
             hrs = Math.ceil(hrs);
        }
        const total = price ? price * hrs : 'N/A';
        document.getElementById('total-fare').innerText = price ? '₹' + total : 'Contact';
        document.getElementById('num-hours').value = hrs;
    }

    document.getElementById('start-time').addEventListener('change', computeFare);
    document.getElementById('end-time').addEventListener('change', computeFare);

    document.getElementById('confirm-book').addEventListener('click', async () => {
        const btn = document.getElementById('confirm-book');
        const vehicleNumberInput = document.getElementById('vehicle-number');
        const vehicleNumber = vehicleNumberInput.value.trim();

        if (!vehicleNumber) {
            alert("Vehicle Number is required to confirm booking.");
            vehicleNumberInput.focus();
            return;
        }

        const originalText = btn.innerText;
        btn.innerText = 'Creating Secure Booking...';
        btn.disabled = true;

        const rawType = document.getElementById('vehicle-type').value;
        const typeMap = { '4wheeler': 'CAR', '2wheeler': 'BIKE', 'heavy': 'TRUCK' };
        
        const bookingData = {
            action: 'park',
            parkingId: item._id || item.ID,
            userId: user.id || user.uid,
            license: vehicleNumber,
            type: typeMap[rawType] || 'CAR',
            amount: document.getElementById('total-fare').innerText.replace('₹', ''),
            startTime: document.getElementById('start-time').value,
            endTime: document.getElementById('end-time').value
        };

        try {
            const resp = await fetch('/api/engine/allocator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData)
            });
            const data = await resp.json();

            if (resp.ok && data.success) {
                const bookingId = data.booking_id;
                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${bookingId}`;
                
                modalRoot.innerHTML = `
                <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div class="bg-white border border-slate-100 rounded-3xl w-full max-w-sm text-center p-8 shadow-2xl relative transform transition-all scale-100">
                        <div class="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg class="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                        </div>
                        <h3 class="text-2xl font-black text-slate-900 mb-1">Booking Confirmed!</h3>
                        <p class="text-slate-500 mb-6 text-sm font-medium italic">Your spot is securely reserved.</p>
                        
                        <div class="bg-white rounded-2xl p-4 mb-6 border-2 border-slate-50 shadow-inner flex flex-col items-center">
                            <img src="${qrUrl}" alt="Booking QR" class="w-32 h-32 mb-4">
                            <div class="text-[10px] text-slate-400 uppercase font-bold mb-1 tracking-widest">Digital Ticket ID</div>
                            <div class="text-sm font-mono text-slate-900 font-bold tracking-tight">${bookingId}</div>
                        </div>

                        <button id="close-ok" class="w-full py-4 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20">Go to My Bookings</button>
                    </div>
                </div>
                `;
                document.getElementById('close-ok').addEventListener('click', () => {
                    document.getElementById('modal-root').innerHTML = '';
                    const tabBookings = document.getElementById('tab-bookings');
                    if (tabBookings) tabBookings.click();
                });
            } else {
                alert('Booking failed: ' + data.message);
                btn.innerText = originalText;
                btn.disabled = false;
            }
        } catch (err) {
            console.error("Booking failed", err);
            alert('Server connection failed. Storing locally.');
            saveBooking({ ...bookingData, id: 'L-' + Date.now(), status: 'Pending Sync' });
            document.getElementById('modal-root').innerHTML = '';
            const tabBookings = document.getElementById('tab-bookings');
            if (tabBookings) tabBookings.click();
        }
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
            fetchIsochroneAndRender();
        }, err => {
            console.warn('Geolocation error', err);
            if (requirePrompt) alert('Please enable location access to find spots near you.');
            // Fallback: stay on the previous userPosition (which defaults to New Delhi)
            map.setCenter(userPosition || DEFAULT_LOCATION);
            fetchIsochroneAndRender();
        }, { enableHighAccuracy: true, timeout: 8000 });
    } else {
        if (requirePrompt) alert('Geolocation not supported.');
    }
}

boot();
window.initMap = initMap;

async function fetchIsochroneAndRender() {
    if (!userPosition || !map) return;
    
    // Cancel any previous pending request
    if (abortController) abortController.abort();
    abortController = new AbortController();

    // 1. Instant Optimistic Render
    renderNearby();

    const lng = userPosition.lng;
    const lat = userPosition.lat;
    const minutes = currentDriveTime;
    let geojson = null;

    const apiUrl = window.PARK_CONFIG?.getDmieUrl ? window.PARK_CONFIG.getDmieUrl() : 'https://dmie.parkconscious.in/api/v1';
    try {
        const resp = await fetch(`${apiUrl}/isochrone`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lat, lng, minutes }),
            signal: abortController.signal
        });
        if (resp.ok) {
            geojson = await resp.json();
        }
    } catch (e) {
        if (e.name === 'AbortError') return;
        console.warn("DMIE Isochrone failed", e);
    }

    if (!geojson) {
        geojson = generateMockIsochrone(lat, lng, minutes);
    }

    if (geojson) {
        map.data.forEach(feature => map.data.remove(feature));
        map.data.addGeoJson(geojson);
        map.data.setStyle({
            fillColor: '#00C39A',
            fillOpacity: 0.3,
            strokeColor: '#00C39A',
            strokeWeight: 2,
            clickable: false
        });

        if (isochronePolygon) isochronePolygon.setMap(null);
        
        let coords;
        if (geojson.features && geojson.features.length > 0) {
            const geometry = geojson.features[0].geometry;
            if (geometry.type === 'Polygon') {
                coords = geometry.coordinates[0];
            } else if (geometry.type === 'MultiPolygon') {
                coords = geometry.coordinates[0][0];
            }
        }

        if (coords) {
            const paths = coords.map(c => ({ lat: c[1], lng: c[0] }));
            isochronePolygon = new google.maps.Polygon({ paths: paths });
            
            // PRE-CALCULATE BOUNDS ONCE
            isochroneBounds = new google.maps.LatLngBounds();
            paths.forEach(p => isochroneBounds.extend(p));
            
            map.fitBounds(isochroneBounds);
        }

        // 3. Final Precise Render
        renderNearby();
    }
}

function processGeometry(geometry, callback, thisArg) {
    if (geometry.getType() === 'Point') {
        callback.call(thisArg, geometry.get());
    } else if (geometry.getType() === 'Polygon') {
        geometry.getArray().forEach(path => {
            path.getArray().forEach(latLng => {
                callback.call(thisArg, latLng);
            });
        });
    } else if (geometry.getType() === 'MultiPolygon') {
        geometry.getArray().forEach(polygon => {
            polygon.getArray().forEach(path => {
                path.getArray().forEach(latLng => {
                    callback.call(thisArg, latLng);
                });
            });
        });
    } else if (geometry.getType() === 'GeometryCollection') {
        geometry.getArray().forEach(g => {
            processGeometry(g, callback, thisArg);
        });
    }
}

function generateMockIsochrone(lat, lng, minutes) {
    const radiusMeters = minutes * 300; 
    const points = 32;
    const coords = [];
    for (let i = 0; i <= points; i++) {
        const angle = (i * 360) / points;
        const distortion = 0.6 + (Math.sin(angle * Math.PI / 45) * 0.4) + (Math.cos(angle * Math.PI / 90) * 0.2); 
        const dist = radiusMeters * distortion;
        
        const R = 6378137;
        const dLat = dist * Math.cos(angle * Math.PI / 180) / R;
        const dLon = dist * Math.sin(angle * Math.PI / 180) / (R * Math.cos(Math.PI * lat / 180));
        
        coords.push([
            lng + dLon * 180 / Math.PI,
            lat + dLat * 180 / Math.PI
        ]);
    }
    return {
        type: "FeatureCollection",
        features: [{
            type: "Feature",
            geometry: {
                type: "Polygon",
                coordinates: [coords]
            }
        }]
    };
}
