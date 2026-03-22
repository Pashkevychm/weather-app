const resultDiv = document.querySelector(".resultDiv");
const inputField = document.querySelector("#city-name-input");
const inputBtn = document.querySelector("#submit-btn");

window.addEventListener("DOMContentLoaded", () => {
   const savedData = localStorage.getItem("lastWeather");
   if (savedData) {
      const {wether, cityData} = JSON.parse(savedData);
      setResult(wether, cityData);
   }
});

function getBackgroundImage(temp) {
    if (temp <= -20) {
        return "images/менше -20.jpg";
    } else if (temp > -20 && temp <= 0) {
        return "images/-20 - 0.jpg"; 
    } else if (temp > 0 && temp <= 10) {
        return "images/0 - +10.jpg";
    } else if (temp > 10 && temp <= 20) {
        return "images/+10 - +20.jpg"; 
    } else if (temp > 20) {
        return "images/більше +20.jpg"; 
    } else {
        return "https://investor-ua.com/wp-content/uploads/2021/01/pogoda562-668x668.jpg"; 
    }
}

function setResult(weather, cityData) {
    const temp = Math.round(weather.current.temperature_2m);
    const feelsLike = Math.round(weather.current.apparent_temperature);
    const humidity = weather.current.relative_humidity_2m;
    const wind = weather.current.wind_speed_10m;

    const bgImage = getBackgroundImage(temp);

    resultDiv.innerHTML = `
        <h2 class="city-name">${cityData.name}, ${cityData.country}</h2>
       
        <div class="weather-main" style="background-image: url('${bgImage}');">
            <span class="temperature">Температура:${temp}°C</span>
        </div>

        <p class = "description">Curent Condition</p>
       
        <div class="weather-details">
            <p><strong>Відчувається як:</strong> ${feelsLike}°C</p>
            <p><strong>Вологість:</strong> ${humidity}%</p>
            <p><strong>Швидкість вітру:</strong> ${wind} км/год</p>
        </div>
    `;
    localStorage.setItem("lastWeather", JSON.stringify({weather, cityData}))
    let history = JSON.parse(localStorage.getItem("weatherHistory")) || [];
    history = history.filter(item => item.cityData.name !== cityData.name);
    history.unshift({weather, cityData});
    localStorage.setItem("weatherHistory", JSON.stringify(history));
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