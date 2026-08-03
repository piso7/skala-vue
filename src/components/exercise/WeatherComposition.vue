<script setup>
import { ref, computed, watch, watchEffect } from 'vue'
import BaseDashboardCard from './BaseDashboardCard.vue'
import SearchBar from './SearchBar.vue'
import WeatherCard from './WeatherCard.vue'

const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, status: '맑음', area: '국내' },
  { id: 'city_02', name: '수원', temp: 24, status: '비', area: '국내' },
  { id: 'city_03', name: '부산', temp: 26, status: '구름', area: '국내' },
  { id: 'city_04', name: '대전', temp: 22, status: '흐림', area: '국내' },
  { id: 'city_05', name: '광주', temp: 30, status: '맑음', area: '국내' },
  { id: 'city_06', name: '제주', temp: 27, status: '비', area: '국내' },
  { id: 'city_07', name: '도쿄', temp: 31, status: '맑음', area: '해외', flag: '🇯🇵' },
  { id: 'city_08', name: '뉴욕', temp: 19, status: '흐림', area: '해외', flag: '🇺🇸' },
  { id: 'city_09', name: '파리', temp: 21, status: '구름', area: '해외', flag: '🇫🇷' },
  { id: 'city_10', name: '시드니', temp: 15, status: '비', area: '해외', flag: '🇦🇺' },
  { id: 'city_11', name: '밴쿠버', temp: 2, status: '눈', area: '해외', flag: '🇨🇦' },
])

const searchQuery = ref('')
const selectedCityInfo = ref('카드를 클릭하거나 검색해 보세요.')
const selectedCities = ref([])

const filteredWeatherList = computed(() => {
  const query = searchQuery.value.trim()

  if (!query) {
    return weatherList.value
  }

  return weatherList.value.filter((item) => item.name.includes(query))
})

const domesticWeatherList = computed(() => {
  return filteredWeatherList.value.filter((item) => item.area === '국내' && (selectedCities.value.length === 0 || selectedCities.value.includes(item.name)))
})

const overseasWeatherList = computed(() => {
  return filteredWeatherList.value.filter((item) => item.area === '해외' && (selectedCities.value.length === 0 || selectedCities.value.includes(item.name)))
})

watch(selectedCityInfo, (newInfo) => {
  console.log('선택한 도시:', newInfo)
})

watchEffect(() => {
  console.log('현재 검색어:', searchQuery.value)
})

const updateSearchQuery = (query) => {
  searchQuery.value = query
}

const toggleCity = (cityName) => {
  const index = selectedCities.value.indexOf(cityName)

  if (index === -1) {
    selectedCities.value.push(cityName)
  } else {
    selectedCities.value.splice(index, 1)
  }
}

const selectCity = (message, cityName) => {
  toggleCity(cityName)

  if (selectedCities.value.includes(cityName)) {
    selectedCityInfo.value = message
  } else {
    selectedCityInfo.value = `${cityName} 선택이 해제되었습니다.`
  }
}

const selectAreaCity = (item) => {
  selectCity(`${item.name}이 선택되었습니다.`, item.name)
}

const showAllCity = () => {
  selectedCities.value = []
  selectedCityInfo.value = '카드를 클릭하거나 검색해 보세요.'
}

const showDetail = (cityName, status) => {
  window.alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다.`)
}
</script>

<template>
  <div class="dashboard-wrapper">
    <BaseDashboardCard>
      <SearchBar :current-query="searchQuery" @update-query="updateSearchQuery" />
    </BaseDashboardCard>

    <BaseDashboardCard>
      <h3>📍 지역 선택</h3>

      <div class="area-row">
        <span class="area-label">국내</span>
        <button v-for="item in weatherList" :key="item.id" v-show="item.area === '국내'" class="area-btn" :class="{ on: selectedCities.includes(item.name) }" @click="selectAreaCity(item)">
          {{ item.name }}
        </button>
      </div>

      <div class="area-row">
        <span class="area-label">해외</span>
        <button v-for="item in weatherList" :key="item.id" v-show="item.area === '해외'" class="area-btn" :class="{ on: selectedCities.includes(item.name) }" @click="selectAreaCity(item)">
          {{ item.name }}
        </button>
      </div>

      <button class="btn-all" @click="showAllCity">전체 보기</button>
    </BaseDashboardCard>

    <BaseDashboardCard>
      <h3>🏙️ 지역별 날씨 현황</h3>

      <div v-if="domesticWeatherList.length" class="weather-area">
        <h4 class="area-title">국내</h4>
        <div class="weather-grid">
          <WeatherCard v-for="item in domesticWeatherList" :key="item.id" :city-item="item" @select-card="selectCity" @click-detail="showDetail" />
        </div>
      </div>

      <div v-if="overseasWeatherList.length" class="weather-area">
        <h4 class="area-title">해외</h4>
        <div class="weather-grid">
          <WeatherCard v-for="item in overseasWeatherList" :key="item.id" :city-item="item" @select-card="selectCity" @click-detail="showDetail" />
        </div>
      </div>

      <p v-if="filteredWeatherList.length === 0" class="empty-message">😭 검색 결과와 일치하는 도시가 없습니다.</p>
    </BaseDashboardCard>

    <div class="status-bar">
      {{ selectedCityInfo }}
    </div>
  </div>
</template>

<style scoped>
.dashboard-wrapper {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
}

.weather-area + .weather-area {
  margin-top: 18px;
}

.area-row {
  margin-bottom: 10px;
}

.area-label {
  display: inline-block;
  width: 45px;
  font-weight: bold;
}

.area-btn,
.btn-all {
  margin: 0 5px 6px 0;
  padding: 5px 12px;
  border: 1px solid #dee2e6;
  border-radius: 15px;
  background: #fff;
  cursor: pointer;
}

.area-btn:hover,
.btn-all:hover {
  background: #f1f3f5;
}

.area-btn.on {
  border-color: #3498db;
  background: #3498db;
  color: #fff;
}

.area-title {
  margin: 0 0 8px;
  color: #6c757d;
}

.weather-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.empty-message {
  margin-bottom: 0;
  padding: 10px 0;
  color: #e74c3c;
  text-align: center;
}

.status-bar {
  padding: 10px;
  border-radius: 6px;
  background: #e8f5e9;
  color: #2e7d32;
  font-weight: bold;
  text-align: center;
}

@media (max-width: 650px) {
  .dashboard-wrapper {
    max-width: none;
  }

  .weather-grid {
    grid-template-columns: 1fr;
  }
}
</style>
