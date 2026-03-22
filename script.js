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

function getBackgroundImage(weatherCode) {
    // 0: Ясне небо (Сонячно)
    if (weatherCode === 0) {
        return "images/depositphotos_15310413-stock-photo-sunset-with-sun-rays.jpg";
    } 
    // 45, 48: Туман
    else if (weatherCode === 45 || weatherCode === 48) {
        return "images/2239443.jpg";
    }
    // 1, 2, 3: Хмарно (Мінлива хмарність)
    else if (weatherCode > 0 && weatherCode <= 3) {
        return "images/49_main-v1677381250.jpg";
    } 
    // 95, 96, 99: Гроза
    else if (weatherCode >= 95) {
        return "images/28797b40-87d2-4adf-87ea-868a8a4fd8af.jpg";
    }
    // 71-77, 85, 86: Сніг або Град
    else if ((weatherCode >= 71 && weatherCode <= 77) || weatherCode === 85 || weatherCode === 86) {
        return "images/hailstorms.jpg";
    }
    // 51-67, 80-82: Дощ (Мряка, злива)
    else if (weatherCode >= 51) {
        return "images/189.jpg";
    } 
    // Резервний фон (Хмари)
    else {
        return "images/49_main-v1677381250.jpg"; 
    }
}

function setResult(weather, cityData) {
    const temp = Math.round(weather.current.temperature_2m);
    const feelsLike = Math.round(weather.current.apparent_temperature);
    const humidity = weather.current.relative_humidity_2m;
    const wind = weather.current.wind_speed_10m;
    console.log(weather)
    const weatherCode = weather.current.weather_code;


    const bgImage = getBackgroundImage(weatherCode);

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