document.addEventListener('DOMContentLoaded', () => {
    const cityInput = document.querySelector('.city-input');
    const searchBtn = document.querySelector('.search-btn');

    const notFoundSection = document.querySelector('.not-found');
    const searchCitySection = document.querySelector('.search-city');
    const weatherInfoSection = document.querySelector('.weather-info');

    const countryTxt = document.querySelector('.country-txt');
    const tempTxt = document.querySelector('.temp-txt');
    const conditionsTxt = document.querySelector('.conditions-txt');
    const humidityValue = document.querySelector('.humidity-value');
    const windValue = document.querySelector('.wind-value');
    const weatherSummaryImg = document.querySelector('.weather-summary-img');
    const currentDateTxt = document.querySelector('.current-date-txt');

    const forecastContainer = document.querySelector('.forecast-item-container');

    const apiKey = '7aac05df7086bb47d1f9e68191d6c1cf';
    const unit = 'imperial'; // Fahrenheit

    if (!cityInput || !searchBtn) {
        console.error('Missing input or button');
        return;
    }

    searchBtn.addEventListener('click', () => {
        if (!cityInput.value.trim()) return;
        updateWeather(cityInput.value.trim());
        cityInput.value = '';
    });

    cityInput.addEventListener('keydown', e => {
        if (e.key === 'Enter' && cityInput.value.trim()) {
            updateWeather(cityInput.value.trim());
            cityInput.value = '';
        }
    });

    async function fetchWeather(endpoint, city) {
        const url = `https://api.openweathermap.org/data/2.5/${endpoint}?q=${city}&appid=${apiKey}&units=${unit}`;
        const res = await fetch(url);
        return res.json();
    }

    function getWeatherIcon(id) {
        if (id <= 232) return 'thunderstorm.svg';
        if (id <= 321) return 'drizzle.svg';
        if (id <= 531) return 'rain.svg';
        if (id <= 622) return 'snow.svg';
        if (id <= 781) return 'atmosphere.svg';
        if (id === 800) return 'clear-day.svg';
        return 'cloudy.svg';
    }

    function getCurrentDate() {
        return new Date().toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    }

    function showSection(section) {
        [weatherInfoSection, searchCitySection, notFoundSection]
            .forEach(s => s.style.display = 'none');
        section.style.display = 'flex';
    }

    async function updateWeather(city) {
        const weatherData = await fetchWeather('weather', city);

        if (weatherData.cod !== 200) {
            showSection(notFoundSection);
            return;
        }

        const {
            name,
            sys: { country },
            main: { temp, humidity },
            weather,
            wind: { speed }
        } = weatherData;

        const { id, main } = weather[0];

        countryTxt.textContent = `${name}, ${country}`;
        tempTxt.textContent = `${Math.round(temp)} °F`;
        conditionsTxt.textContent = main;
        humidityValue.textContent = `${humidity}%`;
        windValue.textContent = `${Math.round(speed)} mph`;
        weatherSummaryImg.src = `weather assets/${getWeatherIcon(id)}`;
        currentDateTxt.textContent = getCurrentDate();

        showSection(weatherInfoSection);
        updateForecast(city);
    }

    async function updateForecast(city) {
        //UPCOMING FORECAST
        const forecastData = await fetchWeather('forecast', city);

        if (forecastData.cod !== "200") return;

        forecastContainer.innerHTML = '';
        const addedDates = new Set();

        forecastData.list.forEach(item => {
            if (!item.dt_txt.includes('12:00:00')) return;

            const date = new Date(item.dt_txt);
            const key = date.toDateString();
            if (addedDates.has(key)) return;

            addedDates.add(key);

            const temp = Math.round(item.main.temp);
            const id = item.weather[0].id;
            const main = item.weather[0].main;

            const dateLabel = date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });

            forecastContainer.insertAdjacentHTML('beforeend', `
                <div class="forecast-item">
                    <h5 class="forecast-item-date regular-txt">${dateLabel}</h5>
                    <img src="weather assets/${getWeatherIcon(id)}"
                         alt="${main}"
                         class="forecast-item-img">
                    <h5 class="forecast-item-temp">${temp}°F</h5>
                </div>
            `);
        });
    }
});
