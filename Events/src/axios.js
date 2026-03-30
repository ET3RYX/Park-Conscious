import axios from "axios";

const tmdbAxios = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  params: {
    api_key: process.env.REACT_APP_API_KEY,
  },
});

const backendAxios = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 
           (typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
             ? `${window.location.protocol}//${window.location.host}` 
             : 'http://localhost:5050'),
});

export { tmdbAxios, backendAxios };
export default tmdbAxios;
