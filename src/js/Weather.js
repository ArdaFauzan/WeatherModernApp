import axios from "axios";
import { apiKey } from "./API";

const forecastEndpoint = params => `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${params.cityName}&days=${params.days}&aqi=no&alerts=no`;
const locationsEndpoint = params => `https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${params.cityName}`;

const apiCall = async (endpoint) => {
    const options = {
        method: 'GET',
        url: endpoint
    };
    try {
        const response = await axios.request(options);
        return response.data;
    } catch (error) {
        console.log('error: ', error);
        return {};
    }
}

export const fetchWeatherForecast = params => {
    let farecastUrl = forecastEndpoint(params);
    return apiCall(farecastUrl);
}

export const fetchLocations = params => {
    let locationUrl = locationsEndpoint(params);
    return apiCall(locationUrl);
}