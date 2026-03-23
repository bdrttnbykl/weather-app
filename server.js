const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;
const OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5";

app.use(cors());

function getQueryParams(req) {
  const city = req.query.city;
  const lat = req.query.lat;
  const lon = req.query.lon;

  if (city) {
    return `q=${encodeURIComponent(city)}`;
  }

  if (lat && lon) {
    return `lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`;
  }

  return null;
}

async function fetchOpenWeather(path, query) {
  const separator = query ? "&" : "";
  const url = `${OPENWEATHER_BASE_URL}/${path}?${query}${separator}appid=${API_KEY}&units=metric&lang=tr`;
  const response = await fetch(url);
  const data = await response.json();

  return { response, data };
}

app.get("/api/weather", async (req, res) => {
  if (!API_KEY) {
    return res.status(500).json({ message: "API_KEY tanimli degil" });
  }

  const query = getQueryParams(req);

  if (!query) {
    return res.status(400).json({ message: "Sehir veya koordinat gerekli" });
  }

  try {
    const { response, data } = await fetchOpenWeather("weather", query);
    return res.status(response.status).json(data);
  } catch {
    return res.status(500).json({ message: "Sunucu hatasi" });
  }
});

app.get("/api/forecast", async (req, res) => {
  if (!API_KEY) {
    return res.status(500).json({ message: "API_KEY tanimli degil" });
  }

  const query = getQueryParams(req);

  if (!query) {
    return res.status(400).json({ message: "Sehir veya koordinat gerekli" });
  }

  try {
    const { response, data } = await fetchOpenWeather("forecast", query);
    return res.status(response.status).json(data);
  } catch {
    return res.status(500).json({ message: "Sunucu hatasi" });
  }
});

app.get("/api/air", async (req, res) => {
  if (!API_KEY) {
    return res.status(500).json({ message: "API_KEY tanimli degil" });
  }

  const lat = req.query.lat;
  const lon = req.query.lon;

  if (!lat || !lon) {
    return res.status(400).json({ message: "Koordinatlar gerekli" });
  }

  try {
    const query = `lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`;
    const { response, data } = await fetchOpenWeather("air_pollution", query);
    return res.status(response.status).json(data);
  } catch {
    return res.status(500).json({ message: "Sunucu hatasi" });
  }
});

app.listen(PORT, () => {
  console.log(`Server calisiyor: http://localhost:${PORT}`);
});
