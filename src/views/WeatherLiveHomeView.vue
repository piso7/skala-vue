<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { weatherCities } from '../data/weatherCities'
import WeatherHomeView from './WeatherHomeView.vue'

const weatherList = ref(weatherCities)
const isLoading = ref(false)
const errorMessage = ref('')
const lastUpdated = ref('')

// API 키는 저장소에 올리지 않고 .env.local 파일에서 읽는다.
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather'

// API의 자세한 설명을 카드 배경에 사용하는 네 가지 날씨 종류로 정리한다.
const getWeatherType = (description) => {
  if (description.includes('눈')) return '눈'
  if (description.includes('비') || description.includes('소나기') || description.includes('뇌우')) return '비'
  if (description.includes('맑음')) return '맑음'
  if (description.includes('구름')) return '구름'
  return '흐림'
}

const fetchRealTimeWeather = async () => {
  if (!API_KEY) {
    errorMessage.value = 'API 키를 찾지 못해 기본 날씨 정보를 보여주고 있습니다.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    // 모든 도시 요청을 먼저 만든 뒤 한 번에 기다려 초기 로딩 시간을 줄인다.
    const requests = weatherCities.map((city) => {
      return axios.get(BASE_URL, {
        params: {
          q: city.apiName,
          appid: API_KEY,
          units: 'metric',
          lang: 'kr',
        },
      })
    })
    const responses = await axios.all(requests)

    // API 응답에 과제에서 사용하던 도시 정보와 화면용 상태를 합친다.
    weatherList.value = responses.map((response, index) => {
      const city = weatherCities[index]
      const weather = response.data.weather[0]

      return {
        ...city,
        temp: Math.round(response.data.main.temp),
        feels: Math.round(response.data.main.feels_like),
        humidity: response.data.main.humidity,
        wind: response.data.wind.speed,
        status: getWeatherType(weather.description),
        description: weather.description,
      }
    })
    lastUpdated.value = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  } catch (error) {
    console.error('날씨 데이터를 가져오지 못했습니다:', error)
    errorMessage.value = '실시간 데이터를 가져오지 못해 기본 날씨 정보를 보여주고 있습니다.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  // 목록 화면이 처음 열릴 때 실시간 날씨를 한 번 요청한다.
  fetchRealTimeWeather()
})
</script>

<template>
  <WeatherHomeView
    :weather-data="weatherList"
    :use-store-unit="true"
    :is-live="true"
    :is-loading="isLoading"
    :error-message="errorMessage"
    :last-updated="lastUpdated"
    @refresh="fetchRealTimeWeather"
  />
</template>
