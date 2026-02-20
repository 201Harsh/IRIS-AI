export const fetchWeather = async (city: string) => {
  try {
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
    )
    const geoData = await geoRes.json()

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error(`Could not find location: ${city}`)
    }

    const location = geoData.results[0]

    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,is_day,precipitation,weather_code,wind_speed_10m&timezone=auto`
    )
    const weatherData = await weatherRes.json()
    const current = weatherData.current

    let condition = 'Clear'
    const code = current.weather_code
    if (code === 1 || code === 2 || code === 3) condition = 'Cloudy'
    if (code === 45 || code === 48) condition = 'Haze'
    if (code >= 51 && code <= 67) condition = 'Rain'
    if (code >= 71 && code <= 77) condition = 'Snow'
    if (code >= 95 && code <= 99) condition = 'Thunderstorm'

    const finalData = {
      city: location.name,
      country: location.country,
      temperature: current.temperature_2m,
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      isDay: current.is_day === 1,
      condition: condition
    }

    const event = new CustomEvent('show-weather', { detail: finalData })
    window.dispatchEvent(event)

    return `The current weather in ${finalData.city} is ${finalData.temperature}°C with ${finalData.condition} conditions. Wind speed is ${finalData.windSpeed} km/h.`
  } catch (error: any) {
    console.error('Weather API Error:', error)
    return `Failed to get weather: ${error.message}`
  }
}
