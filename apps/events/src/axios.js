import axios from "axios";
import { API_BASE_URL } from "./config";

const tmdbAxios = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  params: {
    api_key: process.env.REACT_APP_API_KEY,
  },
});

const backendAxios = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export { tmdbAxios, backendAxios };
export default tmdbAxios;
