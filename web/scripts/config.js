window.PARK_CONFIG = {
    MAPS_KEY: "__MAPS_API_KEY__",
    MAPBOX_KEY: "", // Optional secondary fallback
    ROUTING_API_URL: "__ROUTING_API_URL__",
    getDmieUrl: function() {
        // Pointing to production by default so local testing works without the Python engine
        return "https://dmie.parkconscious.in/api/v1";
    }
};