const resultDiv = document.querySelector(".resultDiv");
const inputField = document.querySelector("#city-name-input");
const inputBtn = document.querySelector("#submit-btn");

function setResult(weather, cityData) {
    const temp = Math.round(weather.current.temperature_2m);
    const feelsLike = Math.round(weather.current.apparent_temperature);
    const humidity = weather.current.relative_humidity_2m;
    const wind = weather.current.wind_speed_10m;

    resultDiv.innerHTML = `
        <h2 class="city-name">${cityData.name}, ${cityData.country}</h2>
       
        <div class="weather-main">
            <span class="temperature">Температура:${temp}°C</span>
        </div>
       
        <div class="weather-details">
            <p><strong>Відчувається як:</strong> ${feelsLike}°C</p>
            <p><strong>Вологість:</strong> ${humidity}%</p>
            <p><strong>Швидкість вітру:</strong> ${wind} км/год</p>
        </div>
    `;
}

async function getData(cityName) {
    try {
        resultDiv.innerHTML = "Searching...";
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1&language=en&format=json`);
        const geoData = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0) {
            resultDiv.innerHTML = "City not found.";
            return;
        }

        const { latitude, longitude, name, country } = geoData.results[0];
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m`);
        const weatherData = await weatherRes.json();

        setResult(weatherData, { name, country });

    } catch (error) {
        console.error("Error:", error);
        resultDiv.innerHTML = "Error fetching data.";
    }
}

inputBtn.addEventListener("click", () => {
    const city = inputField.value.trim();
    if (city) getData(city);
});

inputField.addEventListener("keypress", (e) => {
    if (e.key === "Enter") inputBtn.click();
});