const appStorageKeys = {
  lastCity: "lastCity",
  favorites: "favoriteCities",
  theme: "themeMode",
  unit: "temperatureUnit"
};

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const saveFavoriteBtn = document.getElementById("saveFavoriteBtn");
const themeToggle = document.getElementById("themeToggle");
const unitToggle = document.getElementById("unitToggle");
const message = document.getElementById("message");
const spinner = document.getElementById("spinner");
const welcomeState = document.getElementById("welcomeState");
const weatherCard = document.getElementById("weatherCard");
const sunSection = document.getElementById("sunSection");
const airQualitySection = document.getElementById("airQualitySection");
const hourlySection = document.getElementById("hourlySection");
const forecastSection = document.getElementById("forecastSection");
const favoritesList = document.getElementById("favoritesList");
const forecastCards = document.getElementById("forecastCards");
const hourlyCards = document.getElementById("hourlyCards");

const cityName = document.getElementById("cityName");
const weatherIcon = document.getElementById("weatherIcon");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const weatherAdvice = document.getElementById("weatherAdvice");
const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");
const aqiValue = document.getElementById("aqiValue");
const aqiLabel = document.getElementById("aqiLabel");
const pm25Value = document.getElementById("pm25Value");
const pm10Value = document.getElementById("pm10Value");

let currentUnit = localStorage.getItem(appStorageKeys.unit) || "metric";
let currentWeatherData = null;
let currentForecastData = [];
let currentHourlyData = [];
let currentAirData = null;

const weatherBackgroundClasses = [
  "weather-clear",
  "weather-rain",
  "weather-clouds",
  "weather-snow",
  "weather-thunderstorm",
  "weather-drizzle",
  "weather-mist"
];

function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(appStorageKeys.favorites)) || [];
  } catch {
    return [];
  }
}

function saveFavorites(favorites) {
  localStorage.setItem(appStorageKeys.favorites, JSON.stringify(favorites));
}

function setLoadingState(isLoading) {
  spinner.classList.toggle("hidden", !isLoading);
  message.classList.toggle("loading", isLoading);
}

function setMessage(text, type = "error") {
  message.textContent = text;
  message.classList.remove("loading", "success");

  if (type === "loading") {
    message.classList.add("loading");
  }

  if (type === "success") {
    message.classList.add("success");
  }
}

function clearMessage() {
  message.textContent = "";
  message.classList.remove("loading", "success");
}

function setTheme(isDarkMode) {
  document.body.classList.toggle("dark-mode", isDarkMode);
  themeToggle.textContent = isDarkMode ? "Light Mode" : "Dark Mode";
  localStorage.setItem(appStorageKeys.theme, isDarkMode ? "dark" : "light");
}

function convertTemperature(celsiusValue) {
  if (currentUnit === "imperial") {
    return Math.round((celsiusValue * 9) / 5 + 32);
  }

  return Math.round(celsiusValue);
}

function formatTemperature(celsiusValue) {
  const unitLabel = currentUnit === "metric" ? "\u00B0C" : "\u00B0F";
  return `${convertTemperature(celsiusValue)}${unitLabel}`;
}

function formatWind(speedInMeters) {
  if (currentUnit === "imperial") {
    return `${Math.round(speedInMeters * 2.23694 * 10) / 10} mph`;
  }

  return `${speedInMeters} m/s`;
}

function updateUnitToggleLabel() {
  unitToggle.textContent =
    currentUnit === "metric" ? "\u00B0C \u2194 \u00B0F" : "\u00B0F \u2194 \u00B0C";
}

function updateBackground(weatherMain) {
  document.body.classList.remove(...weatherBackgroundClasses);

  const backgroundClassMap = {
    Clear: "weather-clear",
    Rain: "weather-rain",
    Clouds: "weather-clouds",
    Snow: "weather-snow",
    Thunderstorm: "weather-thunderstorm",
    Drizzle: "weather-drizzle",
    Mist: "weather-mist",
    Haze: "weather-mist",
    Fog: "weather-mist"
  };

  const nextClass = backgroundClassMap[weatherMain];

  if (nextClass) {
    document.body.classList.add(nextClass);
  }
}

function getAdvice(tempCelsius, weatherMain) {
  if (weatherMain === "Thunderstorm") {
    return "Gok gurultulu hava var. Disari cikacaksan dikkatli ol.";
  }

  if (weatherMain === "Rain" || weatherMain === "Drizzle") {
    return "Yagis bekleniyor. Semsiye almak iyi fikir.";
  }

  if (tempCelsius <= 0) {
    return "Cok soguk. Kalin giyinmek gerekecek.";
  }

  if (tempCelsius >= 30) {
    return "Bunaltici sicak. Su tuketimini artirmakta fayda var.";
  }

  if (weatherMain === "Clear") {
    return "Hava acik. Disari cikmak icin iyi bir zaman.";
  }

  if (weatherMain === "Clouds") {
    return "Bulutlu ama dengeli bir hava var.";
  }

  return "Kosullar normal gorunuyor.";
}

function formatLocalTime(unixTime, timezoneShiftSeconds) {
  const date = new Date((unixTime + timezoneShiftSeconds) * 1000);
  return date.toISOString().slice(11, 16);
}

function getDayLabel(dateText) {
  const days = [
    "Pazar",
    "Pazartesi",
    "Sali",
    "Carsamba",
    "Persembe",
    "Cuma",
    "Cumartesi"
  ];

  return days[new Date(dateText).getDay()];
}

function renderFavorites() {
  const favorites = getFavorites();
  favoritesList.innerHTML = "";

  if (favorites.length === 0) {
    favoritesList.innerHTML = "<p>Henuz favori sehir eklenmedi.</p>";
    return;
  }

  favorites.forEach((favoriteCity) => {
    const chip = document.createElement("div");
    chip.className = "favorite-chip";
    chip.innerHTML = `
      <button type="button" class="favorite-city" data-city="${favoriteCity}">${favoriteCity}</button>
      <button type="button" class="remove-favorite" data-city="${favoriteCity}">Sil</button>
    `;
    favoritesList.appendChild(chip);
  });
}

function addCurrentCityToFavorites() {
  if (!currentWeatherData) {
    setMessage("X Once bir sehir secmen gerekiyor.");
    return;
  }

  const favorites = getFavorites();
  const normalizedCity = currentWeatherData.name;

  if (favorites.includes(normalizedCity)) {
    setMessage("X Bu sehir zaten favorilerde.");
    return;
  }

  favorites.unshift(normalizedCity);
  saveFavorites(favorites.slice(0, 6));
  renderFavorites();
  setMessage("Kaydedildi: favori sehir eklendi.", "success");
}

function removeFavorite(city) {
  const favorites = getFavorites().filter((item) => item !== city);
  saveFavorites(favorites);
  renderFavorites();
  setMessage("Favori sehir listeden kaldirildi.", "success");
}

function renderWeather(data) {
  cityName.textContent = `${data.name}, ${data.sys.country}`;
  temperature.textContent = formatTemperature(data.main.temp);
  description.textContent = data.weather[0].description;
  weatherAdvice.textContent = getAdvice(data.main.temp, data.weather[0].main);
  feelsLike.textContent = formatTemperature(data.main.feels_like);
  humidity.textContent = `${data.main.humidity}%`;
  windSpeed.textContent = formatWind(data.wind.speed);
  weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  weatherIcon.alt = data.weather[0].description;
  sunrise.textContent = formatLocalTime(data.sys.sunrise, data.timezone);
  sunset.textContent = formatLocalTime(data.sys.sunset, data.timezone);

  welcomeState.classList.add("hidden");
  weatherCard.classList.remove("hidden");
  sunSection.classList.remove("hidden");
  updateBackground(data.weather[0].main);
}

function renderAirQuality(data) {
  if (!data || !data.list || data.list.length === 0) {
    airQualitySection.classList.add("hidden");
    return;
  }

  const aqiLevels = {
    1: "Iyi",
    2: "Orta",
    3: "Hassas gruplar icin dikkat",
    4: "Kotu",
    5: "Cok kotu"
  };

  const firstItem = data.list[0];
  aqiValue.textContent = String(firstItem.main.aqi);
  aqiLabel.textContent = aqiLevels[firstItem.main.aqi] || "Bilinmiyor";
  pm25Value.textContent = `${Math.round(firstItem.components.pm2_5)} ug/m3`;
  pm10Value.textContent = `${Math.round(firstItem.components.pm10)} ug/m3`;
  airQualitySection.classList.remove("hidden");
}

function renderHourly(items) {
  hourlyCards.innerHTML = "";

  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "hourly-card";
    card.innerHTML = `
      <span class="hourly-time">${item.dt_txt.slice(11, 16)}</span>
      <img class="hourly-icon" src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="${item.weather[0].description}">
      <p class="hourly-temp">${formatTemperature(item.main.temp)}</p>
      <p class="hourly-desc">${item.weather[0].description}</p>
    `;
    hourlyCards.appendChild(card);
  });

  hourlySection.classList.remove("hidden");
}

function renderForecast(items) {
  forecastCards.innerHTML = "";

  items.forEach((item) => {
    const minTemp = formatTemperature(item.minTemp);
    const maxTemp = formatTemperature(item.maxTemp);
    const card = document.createElement("div");
    card.className = "forecast-card";
    card.innerHTML = `
      <span class="forecast-day">${item.day}</span>
      <img class="forecast-icon" src="https://openweathermap.org/img/wn/${item.icon}@2x.png" alt="${item.description}">
      <p class="forecast-temp">${minTemp} / ${maxTemp}</p>
      <p class="forecast-desc">${item.description}</p>
    `;
    forecastCards.appendChild(card);
  });

  forecastSection.classList.remove("hidden");
}

function buildDailyForecast(list) {
  const dailyMap = new Map();

  list.forEach((item) => {
    const dateKey = item.dt_txt.split(" ")[0];
    const existing = dailyMap.get(dateKey);

    if (!existing) {
      dailyMap.set(dateKey, {
        day: getDayLabel(item.dt_txt),
        minTemp: item.main.temp_min,
        maxTemp: item.main.temp_max,
        icon: item.weather[0].icon,
        description: item.weather[0].description,
        hourDistance: Math.abs(Number(item.dt_txt.slice(11, 13)) - 12)
      });
      return;
    }

    existing.minTemp = Math.min(existing.minTemp, item.main.temp_min);
    existing.maxTemp = Math.max(existing.maxTemp, item.main.temp_max);

    const currentDistance = Math.abs(Number(item.dt_txt.slice(11, 13)) - 12);
    if (currentDistance < existing.hourDistance) {
      existing.icon = item.weather[0].icon;
      existing.description = item.weather[0].description;
      existing.hourDistance = currentDistance;
    }
  });

  return Array.from(dailyMap.values()).slice(0, 5);
}

async function fetchJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("not-found");
    }

    if (response.status === 401) {
      throw new Error("invalid-api-key");
    }

    if (response.status === 429) {
      throw new Error("rate-limit");
    }

    throw new Error("network");
  }

  return response.json();
}

async function fetchWeatherBundle({ city, lat, lon }) {
  const weatherQuery = city
    ? `city=${encodeURIComponent(city)}`
    : `lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`;

  const weatherData = await fetchJson(`http://localhost:3000/api/weather?${weatherQuery}`);
  const forecastData = await fetchJson(`http://localhost:3000/api/forecast?${weatherQuery}`);
  const airData = await fetchJson(
    `http://localhost:3000/api/air?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}`
  );

  return { weatherData, forecastData, airData };
}

function applyRenderedData({ weatherData, forecastData, airData }) {
  currentWeatherData = weatherData;
  currentHourlyData = forecastData.list.slice(0, 6);
  currentForecastData = buildDailyForecast(forecastData.list);
  currentAirData = airData;

  localStorage.setItem(appStorageKeys.lastCity, weatherData.name);
  cityInput.value = weatherData.name;

  renderWeather(weatherData);
  renderHourly(currentHourlyData);
  renderForecast(currentForecastData);
  renderAirQuality(airData);
}

function hideDataSections() {
  weatherCard.classList.add("hidden");
  sunSection.classList.add("hidden");
  airQualitySection.classList.add("hidden");
  hourlySection.classList.add("hidden");
  forecastSection.classList.add("hidden");
}

function handleRequestError(error) {
  hideDataSections();
  setLoadingState(false);

  if (!navigator.onLine) {
    setMessage("X Internet baglantisi yok. Baglantiyi kontrol et.");
    return;
  }

  if (error.message === "not-found") {
    setMessage("X Boyle bir sehir bulunamadi.");
    return;
  }

  if (error.message === "invalid-api-key") {
    setMessage("X API anahtari gecersiz veya erisim reddedildi.");
    return;
  }

  if (error.message === "rate-limit") {
    setMessage("X API limiti doldu. Biraz sonra tekrar dene.");
    return;
  }

  setMessage("X Bir hata olustu. Lutfen daha sonra tekrar dene.");
}

async function searchWeatherByCity(city) {
  try {
    setMessage("Yukleniyor...", "loading");
    setLoadingState(true);
    hideDataSections();
    const bundle = await fetchWeatherBundle({ city });
    clearMessage();
    setLoadingState(false);
    applyRenderedData(bundle);
  } catch (error) {
    console.error(error);
    handleRequestError(error);
  }
}

async function searchWeatherByCoords(lat, lon) {
  try {
    setMessage("Konum aliniyor...", "loading");
    setLoadingState(true);
    hideDataSections();
    const bundle = await fetchWeatherBundle({ lat, lon });
    clearMessage();
    setLoadingState(false);
    applyRenderedData(bundle);
  } catch (error) {
    console.error(error);
    handleRequestError(error);
  }
}

function toggleUnit() {
  currentUnit = currentUnit === "metric" ? "imperial" : "metric";
  localStorage.setItem(appStorageKeys.unit, currentUnit);
  updateUnitToggleLabel();

  if (currentWeatherData) {
    renderWeather(currentWeatherData);
  }

  if (currentHourlyData.length > 0) {
    renderHourly(currentHourlyData);
  }

  if (currentForecastData.length > 0) {
    renderForecast(currentForecastData);
  }
}

function requestCurrentLocation() {
  if (!navigator.geolocation) {
    setMessage("X Tarayici konum ozelligini desteklemiyor.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      searchWeatherByCoords(position.coords.latitude, position.coords.longitude);
    },
    (error) => {
      if (error.code === 1) {
        setMessage("X Konum izni verilmedi.");
        return;
      }

      if (error.code === 2) {
        setMessage("X Konum bilgisi bulunamadi.");
        return;
      }

      setMessage("X Konum alinamadi.");
    }
  );
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch((error) => {
        console.error("Service worker kaydi basarisiz:", error);
      });
    });
  }
}

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();

  if (!city) {
    setMessage("X Lutfen bir sehir adi girin.");
    hideDataSections();
    return;
  }

  searchWeatherByCity(city);
});

cityInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    searchBtn.click();
  }
});

themeToggle.addEventListener("click", () => {
  const isDarkMode = !document.body.classList.contains("dark-mode");
  setTheme(isDarkMode);
});

unitToggle.addEventListener("click", toggleUnit);
locationBtn.addEventListener("click", requestCurrentLocation);
saveFavoriteBtn.addEventListener("click", addCurrentCityToFavorites);

favoritesList.addEventListener("click", (event) => {
  const target = event.target;

  if (!(target instanceof HTMLElement)) {
    return;
  }

  const city = target.dataset.city;

  if (target.classList.contains("favorite-city") && city) {
    searchWeatherByCity(city);
  }

  if (target.classList.contains("remove-favorite") && city) {
    removeFavorite(city);
  }
});

const savedTheme = localStorage.getItem(appStorageKeys.theme);
setTheme(savedTheme === "dark");
updateUnitToggleLabel();
renderFavorites();
registerServiceWorker();

const lastCity = localStorage.getItem(appStorageKeys.lastCity);
if (lastCity) {
  searchWeatherByCity(lastCity);
}
