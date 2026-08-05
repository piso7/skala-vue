<script setup>
import { ref, computed, watch, watchEffect } from 'vue'
import BaseDashboardCard from './BaseDashboardCard.vue'
import SearchBar from './SearchBar.vue'
import WeatherCard from './WeatherCard.vue'

const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, feels: 29, humidity: 52, status: '맑음', area: '국내' },
  { id: 'city_02', name: '수원', temp: 24, feels: 23, humidity: 76, status: '비', area: '국내' },
  { id: 'city_03', name: '부산', temp: 26, feels: 27, humidity: 63, status: '구름', area: '국내' },
  { id: 'city_04', name: '대전', temp: 22, feels: 22, humidity: 69, status: '흐림', area: '국내' },
  { id: 'city_05', name: '광주', temp: 30, feels: 32, humidity: 49, status: '맑음', area: '국내' },
  { id: 'city_06', name: '제주', temp: 27, feels: 28, humidity: 74, status: '비', area: '국내' },
  { id: 'city_07', name: '도쿄', temp: 31, feels: 33, humidity: 57, status: '맑음', area: '해외', flag: '🇯🇵' },
  { id: 'city_08', name: '뉴욕', temp: 19, feels: 18, humidity: 65, status: '흐림', area: '해외', flag: '🇺🇸' },
  { id: 'city_09', name: '파리', temp: 21, feels: 21, humidity: 60, status: '구름', area: '해외', flag: '🇫🇷' },
  { id: 'city_10', name: '시드니', temp: 15, feels: 14, humidity: 71, status: '비', area: '해외', flag: '🇦🇺' },
  { id: 'city_11', name: '밴쿠버', temp: 2, feels: 0, humidity: 82, status: '눈', area: '해외', flag: '🇨🇦' },
])

const searchQuery = ref('')
const selectedCityInfo = ref('카드를 클릭하거나 검색해 보세요.')
const selectedCities = ref([])
const favoriteCities = ref([])
const isFahrenheit = ref(false)

const filteredWeatherList = computed(() => {
  const query = searchQuery.value.trim()

  if (!query) {
    return weatherList.value
  }

  return weatherList.value.filter((item) => item.name.includes(query))
})

const selectedWeatherList = computed(() => {
  if (selectedCities.value.length === 0) {
    return filteredWeatherList.value
  }

  return filteredWeatherList.value.filter((item) => selectedCities.value.includes(item.name))
})

const heroCity = computed(() => {
  if (selectedCities.value.length > 0) {
    return weatherList.value.find((item) => item.name === selectedCities.value[0])
  }

  return weatherList.value[0]
})

const favoriteWeatherList = computed(() => {
  return weatherList.value.filter((item) => favoriteCities.value.includes(item.name))
})

const favoriteCardList = computed(() => {
  return selectedWeatherList.value.filter((item) => favoriteCities.value.includes(item.name))
})

const domesticWeatherList = computed(() => {
  return selectedWeatherList.value.filter((item) => item.area === '국내' && !favoriteCities.value.includes(item.name))
})

const overseasWeatherList = computed(() => {
  return selectedWeatherList.value.filter((item) => item.area === '해외' && !favoriteCities.value.includes(item.name))
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

const displayTemp = (temp) => {
  if (isFahrenheit.value) {
    return Math.round((temp * 9) / 5 + 32)
  }

  return temp
}

const toggleUnit = () => {
  isFahrenheit.value = !isFahrenheit.value
}

const toggleFavorite = (cityName) => {
  const index = favoriteCities.value.indexOf(cityName)

  if (index === -1) {
    favoriteCities.value.push(cityName)
  } else {
    favoriteCities.value.splice(index, 1)
  }
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
    <header class="weather-hero">
      <div>
        <p class="hero-label">WEATHER DASHBOARD</p>
        <h2>날씨 대시보드</h2>
        <p class="hero-description">도시별 날씨를 검색하고 비교해 보세요.</p>
      </div>
      <div class="hero-side">
        <button class="unit-toggle" @click="toggleUnit">{{ isFahrenheit ? '섭씨로 보기' : '화씨로 보기' }}</button>
        <div class="hero-summary">
          <span>선택 도시</span>
          <strong>{{ displayTemp(heroCity.temp) }}°{{ isFahrenheit ? 'F' : 'C' }}</strong>
          <p>{{ heroCity.name }} · {{ heroCity.status }}</p>
        </div>
      </div>
    </header>

    <BaseDashboardCard class="dashboard-panel search-panel">
      <SearchBar :current-query="searchQuery" @update-query="updateSearchQuery" />
    </BaseDashboardCard>

    <BaseDashboardCard class="dashboard-panel filter-panel">
      <h3>지역 선택</h3>

      <div v-if="favoriteWeatherList.length" class="favorite-row">
        <span class="favorite-label">즐겨찾기</span>
        <button v-for="item in favoriteWeatherList" :key="item.id" class="favorite-city-btn" @click="selectAreaCity(item)">{{ item.name }}</button>
      </div>

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

    <BaseDashboardCard class="dashboard-panel weather-panel">
      <h3>지역별 날씨 현황</h3>

      <div v-if="favoriteCardList.length" class="weather-area favorite-weather-area">
        <h4 class="area-title">즐겨찾는 도시</h4>
        <div class="weather-grid">
          <WeatherCard v-for="item in favoriteCardList" :key="item.id" :city-item="item" :is-selected="selectedCities.includes(item.name)" :is-favorite="favoriteCities.includes(item.name)" :is-fahrenheit="isFahrenheit" @select-card="selectCity" @click-detail="showDetail" @toggle-favorite="toggleFavorite" />
        </div>
      </div>

      <div v-if="domesticWeatherList.length" class="weather-area">
        <h4 class="area-title">국내</h4>
        <div class="weather-grid">
          <WeatherCard v-for="item in domesticWeatherList" :key="item.id" :city-item="item" :is-selected="selectedCities.includes(item.name)" :is-favorite="favoriteCities.includes(item.name)" :is-fahrenheit="isFahrenheit" @select-card="selectCity" @click-detail="showDetail" @toggle-favorite="toggleFavorite" />
        </div>
      </div>

      <div v-if="overseasWeatherList.length" class="weather-area">
        <h4 class="area-title">해외</h4>
        <div class="weather-grid">
          <WeatherCard v-for="item in overseasWeatherList" :key="item.id" :city-item="item" :is-selected="selectedCities.includes(item.name)" :is-favorite="favoriteCities.includes(item.name)" :is-fahrenheit="isFahrenheit" @select-card="selectCity" @click-detail="showDetail" @toggle-favorite="toggleFavorite" />
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

.weather-hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 190px;
  box-sizing: border-box;
  margin-bottom: 18px;
  padding: 30px 38px;
  border-radius: 18px;
  background-image: url('../../assets/weather/night-sky-header.png');
  background-position: center;
  background-size: cover;
  color: #fff;
}

.hero-label {
  margin: 0 0 8px;
  color: #a6dce1;
  font-size: 12px;
  font-weight: bold;
  letter-spacing: 1.4px;
}

.weather-hero h2 {
  margin: 0;
  font-size: 32px;
}

.hero-description {
  margin: 10px 0 0;
  color: #d6e8f3;
}

.hero-summary {
  min-width: 150px;
  padding: 16px 20px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 14px;
  background: rgba(4, 26, 55, 0.45);
  text-align: right;
}

.hero-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.unit-toggle {
  padding: 7px 12px;
  border: 1px solid rgba(255, 255, 255, 0.45);
  border-radius: 18px;
  background: rgba(4, 26, 55, 0.45);
  color: #fff;
  cursor: pointer;
}

.unit-toggle:hover {
  background: rgba(255, 255, 255, 0.16);
}

.hero-summary span,
.hero-summary p {
  color: #d6e8f3;
  font-size: 13px;
}

.hero-summary strong {
  display: block;
  margin: 3px 0;
  font-size: 34px;
}

.hero-summary p {
  margin: 0;
}

.weather-area + .weather-area {
  margin-top: 24px;
}

.favorite-weather-area {
  padding-bottom: 22px;
  border-bottom: 1px solid #e1eaef;
}

.dashboard-panel h3 {
  margin: 0 0 16px;
  color: #17324d;
  font-size: 18px;
}

.area-row {
  margin-bottom: 10px;
}

.favorite-row {
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e2ebef;
}

.favorite-label {
  display: inline-block;
  width: 52px;
  color: #008f91;
  font-size: 14px;
  font-weight: bold;
}

.favorite-city-btn {
  margin: 0 7px 6px 0;
  padding: 6px 12px;
  border: 1px solid #8bcfd0;
  border-radius: 16px;
  background: #eefafb;
  color: #007477;
  cursor: pointer;
}

.area-label {
  display: inline-block;
  width: 52px;
  color: #49627a;
  font-size: 14px;
  font-weight: bold;
}

.area-btn,
.btn-all {
  margin: 0 7px 8px 0;
  padding: 7px 14px;
  border: 1px solid #d5e0e8;
  border-radius: 18px;
  background: #fff;
  color: #39536b;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
}

.area-btn:hover,
.btn-all:hover {
  border-color: #8bcfd0;
  background: #eefafb;
}

.area-btn.on {
  border-color: #008f91;
  background: #008f91;
  color: #fff;
}

.area-title {
  margin: 0 0 12px;
  color: #587087;
  font-size: 15px;
}

.weather-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.empty-message {
  margin-bottom: 0;
  padding: 10px 0;
  color: #e74c3c;
  text-align: center;
}

.status-bar {
  padding: 13px 16px;
  border-left: 4px solid #008f91;
  border-radius: 8px;
  background: #f0fbfb;
  color: #245d64;
  font-weight: 600;
}

@media (max-width: 760px) {
  .dashboard-wrapper {
    max-width: none;
  }

  .weather-hero {
    display: block;
    padding: 26px;
  }

  .hero-summary {
    display: inline-block;
    margin-top: 20px;
    text-align: left;
  }

  .hero-side {
    align-items: flex-start;
  }

  .weather-grid {
    grid-template-columns: 1fr;
  }
}
</style>
