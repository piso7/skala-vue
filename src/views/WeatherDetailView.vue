<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useConfigStore } from '@/stores/configStore'
import { weatherCities } from '../data/weatherCities'

const route = useRoute()
const router = useRouter()
const configStore = useConfigStore()

const cityData = ref(null)
const isLoading = ref(false)
const errorMessage = ref('')
const lastUpdated = ref('')

// 목록 화면과 같은 환경 변수와 API 주소를 사용한다.
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather'

const fetchDetailWeather = async () => {
  const city = weatherCities.find((item) => item.id === route.params.cityId)

  if (!city) {
    return
  }

  // 통신 전에도 기존 대시보드의 기본 데이터를 먼저 보여 준다.
  cityData.value = {
    ...city,
    description: city.status,
    wind: '-',
  }

  if (!API_KEY) {
    errorMessage.value = 'API 키를 찾지 못해 기본 날씨 정보를 보여주고 있습니다.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    // URL의 도시 번호에 해당하는 도시만 다시 요청해 상세 정보를 갱신한다.
    const response = await axios.get(BASE_URL, {
      params: {
        q: city.apiName,
        appid: API_KEY,
        units: 'metric',
        lang: 'kr',
      },
    })
    const weather = response.data.weather[0]

    cityData.value = {
      ...city,
      temp: Math.round(response.data.main.temp),
      feels: Math.round(response.data.main.feels_like),
      humidity: response.data.main.humidity,
      wind: response.data.wind.speed,
      status: weather.description,
      description: weather.description,
    }
    lastUpdated.value = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  } catch (error) {
    console.error('상세 날씨 데이터를 가져오지 못했습니다:', error)
    errorMessage.value = '실시간 데이터를 가져오지 못해 기본 날씨 정보를 보여주고 있습니다.'
  } finally {
    isLoading.value = false
  }
}

// 주소의 /weather/city_01 부분을 읽어 같은 도시의 API를 호출한다.
onMounted(() => {
  fetchDetailWeather()
})

const displayTemp = computed(() => {
  if (!cityData.value) {
    return '-'
  }

  if (configStore.unit === 'fahrenheit') {
    return Math.round((cityData.value.temp * 9) / 5 + 32)
  }

  return cityData.value.temp
})

const displayFeels = computed(() => {
  if (!cityData.value) {
    return '-'
  }

  if (configStore.unit === 'fahrenheit') {
    return Math.round((cityData.value.feels * 9) / 5 + 32)
  }

  return cityData.value.feels
})

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="detail-container">
    <p class="detail-label">CITY WEATHER DETAIL</p>
    <h3>지역별 상세 기상 관측 정보</h3>

    <p v-if="isLoading" class="loading-message">OpenWeather에서 실시간 정보를 불러오는 중입니다.</p>
    <p v-if="errorMessage" class="api-error">{{ errorMessage }}</p>

    <div v-if="cityData" class="info-card">
      <div class="detail-title">
        <div>
          <span>지정 지역</span>
          <h4>{{ cityData.fullName }}</h4>
        </div>
        <strong>{{ displayTemp }}<small>{{ configStore.unitSymbol }}</small></strong>
      </div>

      <p class="weather-status">현재 날씨 · {{ cityData.description || cityData.status }}</p>

      <div class="detail-grid">
        <div>
          <span>체감 온도</span>
          <strong>{{ displayFeels }}{{ configStore.unitSymbol }}</strong>
        </div>
        <div>
          <span>대기 습도</span>
          <strong>{{ cityData.humidity }}%</strong>
        </div>
        <div>
          <span>현재 풍속</span>
          <strong>{{ cityData.wind === '-' ? '-' : cityData.wind + 'm/s' }}</strong>
        </div>
      </div>

      <p v-if="lastUpdated" class="updated-time">OpenWeather · {{ lastUpdated }} 기준</p>
    </div>

    <p v-else class="empty-message">해당 지역의 상세 데이터가 없습니다.</p>

    <button class="back-btn" @click="goHome">대시보드로 돌아가기</button>
  </div>
</template>

<style scoped>
.detail-container {
  max-width: 720px;
  margin: 0 auto;
  padding: 28px;
  border: 1px solid #dce7ee;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 8px 22px rgba(26, 62, 87, 0.06);
}

.detail-label {
  margin: 0 0 8px;
  color: #008f91;
  font-size: 12px;
  font-weight: bold;
  letter-spacing: 1.2px;
}

.detail-container h3 {
  margin: 0 0 20px;
  color: #17324d;
  font-size: 24px;
}

.loading-message,
.api-error {
  margin: 0 0 14px;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 13px;
}

.loading-message {
  background: #eefafb;
  color: #007477;
}

.api-error {
  background: #fff3e8;
  color: #ad5c19;
}

.info-card {
  padding: 22px;
  border-radius: 14px;
  background: #f5fbfc;
}

.detail-title {
  display: flex;
  align-items: end;
  justify-content: space-between;
}

.detail-title span,
.detail-grid span {
  color: #587087;
  font-size: 13px;
}

.detail-title h4 {
  margin: 6px 0 0;
  color: #17324d;
  font-size: 22px;
}

.detail-title > strong {
  color: #17324d;
  font-size: 42px;
  line-height: 1;
}

.detail-title small {
  font-size: 17px;
}

.weather-status {
  margin: 16px 0;
  color: #007477;
  font-weight: bold;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.detail-grid div {
  padding: 13px;
  border-radius: 10px;
  background: #fff;
}

.detail-grid strong {
  display: block;
  margin-top: 6px;
  color: #284660;
}

.updated-time {
  margin: 15px 0 0;
  color: #6c8497;
  font-size: 12px;
  text-align: right;
}

.empty-message {
  color: #e74c3c;
}

.back-btn {
  width: 100%;
  margin-top: 18px;
  padding: 11px;
  border: 1px solid #008f91;
  border-radius: 9px;
  background: #008f91;
  color: #fff;
  font-weight: bold;
  cursor: pointer;
}

.back-btn:hover {
  background: #007477;
}

@media (max-width: 600px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
