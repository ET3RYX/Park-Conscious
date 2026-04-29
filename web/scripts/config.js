window.PARK_CONFIG = {
    MAPS_KEY: "__MAPS_API_KEY__",
    MAPBOX_KEY: "", // Optional secondary fallback
    ROUTING_API_URL: "__ROUTING_API_URL__",
    getDmieUrl: function() {
        const hostname = window.location.hostname;
        const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
        return isLocal ? "http://localhost:8000/api/v1" : "https://dmie.parkconscious.in/api/v1";
    }
};