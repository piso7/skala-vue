<script setup>
import { ref, computed, watch, watchEffect } from 'vue'
import { useConfigStore } from '@/stores/configStore'
import { useFavoriteStore } from '@/stores/favoriteStore'
import { weatherCities } from '../../data/weatherCities'
import BaseDashboardCard from './BaseDashboardCard.vue'
import SearchBar from './SearchBar.vue'
import WeatherCard from './WeatherCard.vue'
import EarthGlobe from './EarthGlobe.vue'
import PixelFireOverlay from './PixelFireOverlay.vue'
import PanicCrowd from './PanicCrowd.vue'
import MeteorShower from './MeteorShower.vue'
import StormSurvivors from './StormSurvivors.vue'

const props = defineProps({
  weatherData: {
    type: Array,
    default: null,
  },
  initialSearch: {
    type: String,
    default: '',
  },
  useRouter: {
    type: Boolean,
    default: false,
  },
  useStoreUnit: {
    type: Boolean,
    default: false,
  },
  isLive: {
    type: Boolean,
    default: false,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: '',
  },
  lastUpdated: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['click-detail', 'update-search', 'refresh'])
const configStore = useConfigStore()
const favoriteStore = useFavoriteStore()

const weatherList = ref(weatherCities)
const searchQuery = ref('')
const selectedCityInfo = ref('카드를 클릭하거나 검색해 보세요.')

// 카드 선택과 지구 위치 선택은 서로 다른 기능이므로 상태도 나누어 둔다.
const selectedCities = ref([])
const selectedCity = ref('')
const globeSelectedCity = ref('')
const isFahrenheit = ref(false)

// 과제 5의 즐겨찾기만 Pinia에 저장한다. 이전 과제는 기존처럼 화면 안에서만 유지한다.
const legacyFavoriteCities = ref([])
const favoriteCities = computed(() => {
  return props.isLive ? favoriteStore.favoriteCities : legacyFavoriteCities.value
})
const favoriteCount = computed(() => favoriteCities.value.length)

// 과제 5가 실제 API 데이터를 전달하면, 과제 3의 카드 목록만 그 데이터로 바꾼다.
watch(
  () => props.weatherData,
  (newWeatherData) => {
    if (newWeatherData && newWeatherData.length) {
      weatherList.value = newWeatherData
    } else {
      weatherList.value = weatherCities
    }
  },
  { immediate: true },
)

watch(
  () => props.initialSearch,
  (newQuery) => {
    searchQuery.value = newQuery || ''
  },
  { immediate: true },
)

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

const selectedCityData = computed(() => {
  if (!props.isLive) return null
  return weatherList.value.find((item) => item.name === selectedCity.value) || null
})

// 지구에서 보여 줄 도시는 날씨 카드 선택 상태와 별도로 찾는다.
const globeSelectedCityData = computed(() => {
  if (!props.isLive) return null
  return weatherList.value.find((item) => item.name === globeSelectedCity.value) || null
})

const heroCity = computed(() => {
  if (props.isLive) {
    return selectedCityData.value || weatherList.value[0]
  }

  return weatherList.value.find((item) => item.name === selectedCities.value[0]) || weatherList.value[0]
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

const heatCityList = computed(() => {
  return weatherList.value.filter((item) => item.feels >= 35)
})

const heatTickerList = computed(() => {
  return [...heatCityList.value, ...heatCityList.value]
})

const selectedHotCity = ref(null)
const isHeatAlertVisible = ref(false)
const selectedStormCity = ref(null)
const isStormAlertVisible = ref(false)

watch(searchQuery, (newQuery) => {
  emit('update-search', newQuery)
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
  if (props.useStoreUnit && configStore.unit === 'fahrenheit') {
    return Math.round((temp * 9) / 5 + 32)
  }

  if (!props.useStoreUnit && isFahrenheit.value) {
    return Math.round((temp * 9) / 5 + 32)
  }

  return temp
}

const isFahrenheitMode = computed(() => {
  if (props.useStoreUnit) {
    return configStore.unit === 'fahrenheit'
  }

  return isFahrenheit.value
})

const toggleUnit = () => {
  isFahrenheit.value = !isFahrenheit.value
}

const toggleFavorite = (cityName) => {
  if (props.isLive) {
    favoriteStore.toggleFavorite(cityName)
    return
  }

  const index = legacyFavoriteCities.value.indexOf(cityName)
  if (index === -1) {
    legacyFavoriteCities.value.push(cityName)
  } else {
    legacyFavoriteCities.value.splice(index, 1)
  }
}

const clearFavorites = () => {
  if (props.isLive) {
    favoriteStore.clearFavorites()
  } else {
    legacyFavoriteCities.value = []
  }
}

const selectCity = (message, cityName) => {
  const index = selectedCities.value.indexOf(cityName)

  if (index === -1) {
    selectedCities.value.push(cityName)
    selectedCity.value = cityName
    selectedCityInfo.value = message
  } else {
    selectedCities.value.splice(index, 1)
    if (selectedCity.value === cityName) {
      selectedCity.value = selectedCities.value[0] || ''
    }
    selectedCityInfo.value = `${cityName} 선택이 해제되었습니다.`
  }
}

const isCitySelected = (cityName) => {
  return selectedCities.value.includes(cityName)
}

const selectAreaCity = (item) => {
  selectCity(`${item.name}이 선택되었습니다.`, item.name)
}

const selectGlobeCity = (item) => {
  globeSelectedCity.value = item.name
  selectedCityInfo.value = `${item.name} 위치로 지구가 이동합니다.`
}

const showAllCity = () => {
  selectedCity.value = ''
  selectedCities.value = []
  selectedCityInfo.value = '카드를 클릭하거나 검색해 보세요.'
}

const resetGlobeCity = () => {
  globeSelectedCity.value = ''
  selectedCityInfo.value = '지구 위치 선택이 초기화되었습니다.'
}

const showHeatAlert = (cityItem) => {
  if (!props.isLive || cityItem.feels < 35) {
    return
  }

  selectedHotCity.value = cityItem
  isStormAlertVisible.value = false
  isHeatAlertVisible.value = true
}

const selectHotCity = (cityItem) => {
  selectCity(`${cityItem.name}이 선택되었습니다.`, cityItem.name)
  showHeatAlert(cityItem)
}

const closeHeatAlert = () => {
  isHeatAlertVisible.value = false
}

const showStormAlert = (cityItem) => {
  if (!props.isLive) {
    return
  }

  selectedStormCity.value = cityItem
  isHeatAlertVisible.value = false
  isStormAlertVisible.value = true
}

const closeStormAlert = () => {
  isStormAlertVisible.value = false
}

// 비가 없는 날에도 폭풍우 화면을 확인할 수 있도록 안전 체험용 도시를 만든다.
const previewStormAlert = () => {
  const rainyCity = weatherList.value.find((item) => item.status === '비')
  const city = rainyCity || weatherList.value[0]

  showStormAlert({
    ...city,
    status: '비',
    description: rainyCity ? rainyCity.description : '집중호우 안전 체험',
    wind: rainyCity?.wind || 14,
  })
}

const showDetail = (cityName, status) => {
  if (props.useRouter) {
    emit('click-detail', cityName)
  } else {
    window.alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다.`)
  }
}
</script>

<template>
  <div class="dashboard-wrapper">
    <header class="weather-hero">
      <div>
        <p class="hero-label">WEATHER DASHBOARD</p>
        <h2>날씨 대시보드</h2>
        <p class="hero-description">{{ isLive ? 'OpenWeather의 현재 날씨를 도시별로 비교해 보세요.' : '도시별 날씨를 검색하고 비교해 보세요.' }}</p>
      </div>
      <div class="hero-side">
        <button v-if="isLive" class="refresh-button" :disabled="isLoading" @click="emit('refresh')">
          {{ isLoading ? '업데이트 중...' : '실시간 새로고침' }}
        </button>
        <button v-else class="unit-toggle" @click="toggleUnit">{{ isFahrenheit ? '섭씨로 보기' : '화씨로 보기' }}</button>
        <div class="hero-summary">
          <span>선택 도시</span>
          <strong>{{ displayTemp(heroCity.temp) }}°{{ isFahrenheitMode ? 'F' : 'C' }}</strong>
          <p>{{ heroCity.name }} · {{ heroCity.description || heroCity.status }}</p>
        </div>
      </div>
    </header>

    <div v-if="isLive" class="service-state" :class="{ loading: isLoading, error: errorMessage }" aria-live="polite">
      <div class="service-message">
        <span class="service-dot"></span>
        <div>
          <strong v-if="isLoading">실시간 관측소 연결 중</strong>
          <strong v-else-if="errorMessage">기본 데이터 모드</strong>
          <strong v-else>실시간 데이터 연결됨</strong>
          <p>{{ isLoading ? '도시별 최신 날씨를 불러오고 있습니다.' : errorMessage || 'OpenWeather 관측값을 정상적으로 사용하고 있습니다.' }}</p>
        </div>
      </div>

      <div class="service-stats">
        <span>관측 도시 <b>{{ weatherList.length }}</b></span>
        <span>즐겨찾기 <b>{{ favoriteCount }}</b></span>
        <span v-if="lastUpdated">갱신 <b>{{ lastUpdated }}</b></span>
        <button class="storm-preview-button" @click="previewStormAlert">폭풍우 안전 체험</button>
      </div>
    </div>

    <BaseDashboardCard class="dashboard-panel search-panel">
      <SearchBar :current-query="searchQuery" @update-query="updateSearchQuery" />
    </BaseDashboardCard>

    <BaseDashboardCard v-if="isLive" class="dashboard-panel heat-zone">
      <div class="heat-zone-header">
        <div>
          <p>HOT CITY TRACK</p>
          <h3>불지옥</h3>
        </div>
        <span>체감온도 35°C 이상</span>
      </div>

      <div v-if="heatCityList.length" class="heat-ticker">
        <div class="heat-track">
          <button v-for="(item, index) in heatTickerList" :key="`${item.id}-${index}`" class="heat-city-card" @click="selectHotCity(item)">
            <span v-if="item.area === '해외'" class="heat-flag">{{ item.flag }}</span>
            <strong>{{ item.name }}</strong>
            <span>{{ item.description || item.status }}</span>
            <b>체감 {{ displayTemp(item.feels) }}°{{ isFahrenheitMode ? 'F' : 'C' }}</b>
          </button>
        </div>
      </div>
      <p v-else class="heat-empty">현재 체감온도 35°C 이상 도시가 없습니다.</p>
    </BaseDashboardCard>

    <BaseDashboardCard v-if="isLive" class="dashboard-panel earth-filter-panel compact-selection">
      <h3>지구 위치 선택</h3>
      <p class="selection-guide">날씨 카드와 관계없이 지구에서 이동할 도시를 선택합니다.</p>

      <div class="selection-groups">
        <div class="area-row">
          <span class="area-label">국내</span>
          <button v-for="item in weatherList" :key="item.id" v-show="item.area === '국내'" class="area-btn" :class="{ on: globeSelectedCity === item.name && item.area === '국내' }" @click="selectGlobeCity(item)">
            {{ item.name }}
          </button>
        </div>

        <div class="area-row">
          <span class="area-label">해외</span>
          <button v-for="item in weatherList" :key="item.id" v-show="item.area === '해외'" class="area-btn" :class="{ on: globeSelectedCity === item.name && item.area === '해외' }" @click="selectGlobeCity(item)">
            {{ item.name }}
          </button>
        </div>

        <button class="btn-all" @click="resetGlobeCity">지구 초기화</button>
      </div>
    </BaseDashboardCard>

    <EarthGlobe v-if="isLive" :city-item="globeSelectedCityData" :is-fahrenheit="isFahrenheitMode" />

    <BaseDashboardCard class="dashboard-panel filter-panel" :class="{ 'compact-selection': isLive }">
      <h3>{{ isLive ? '날씨 카드 선택' : '지역 선택' }}</h3>
      <p v-if="isLive" class="selection-guide">여러 도시를 함께 선택할 수 있습니다. 선택한 도시를 다시 누르면 해제됩니다.</p>

      <div v-if="favoriteWeatherList.length" class="favorite-row">
        <span class="favorite-label">즐겨찾기 {{ favoriteCount }}</span>
        <button v-for="item in favoriteWeatherList" :key="item.id" class="favorite-city-btn" @click="selectAreaCity(item)">{{ item.name }}</button>
        <button class="clear-favorite-button" @click="clearFavorites">모두 해제</button>
      </div>

      <div class="selection-groups">
        <div class="area-row">
          <span class="area-label">국내</span>
          <button v-for="item in weatherList" :key="item.id" v-show="item.area === '국내'" class="area-btn" :class="{ on: isCitySelected(item.name) && item.area === '국내' }" @click="selectAreaCity(item)">
            {{ item.name }}
          </button>
        </div>

        <div class="area-row">
          <span class="area-label">해외</span>
          <button v-for="item in weatherList" :key="item.id" v-show="item.area === '해외'" class="area-btn" :class="{ on: isCitySelected(item.name) && item.area === '해외' }" @click="selectAreaCity(item)">
            {{ item.name }}
          </button>
        </div>

        <button class="btn-all" @click="showAllCity">전체 보기</button>
      </div>
    </BaseDashboardCard>

    <BaseDashboardCard class="dashboard-panel weather-panel">
      <div class="weather-title-row">
        <h3>지역별 날씨 현황</h3>
        <p v-if="isLive" class="weather-update">
          <span>OpenWeather 실시간</span>
          <span v-if="isLoading">업데이트 중...</span>
          <span v-else-if="lastUpdated">{{ lastUpdated }} 기준</span>
        </p>
      </div>
      <div v-if="favoriteCardList.length" class="weather-area favorite-weather-area">
        <h4 class="area-title">즐겨찾는 도시</h4>
        <div class="weather-grid">
          <WeatherCard v-for="item in favoriteCardList" :key="item.id" :city-item="item" :is-selected="isCitySelected(item.name)" :is-favorite="favoriteCities.includes(item.name)" :is-fahrenheit="isFahrenheit" :use-store-unit="useStoreUnit" @select-card="selectCity" @click-detail="showDetail" @toggle-favorite="toggleFavorite" @heat-alert="showHeatAlert" @storm-alert="showStormAlert" />
        </div>
      </div>

      <div v-if="domesticWeatherList.length" class="weather-area">
        <h4 class="area-title">국내</h4>
        <div class="weather-grid">
          <WeatherCard v-for="item in domesticWeatherList" :key="item.id" :city-item="item" :is-selected="isCitySelected(item.name)" :is-favorite="favoriteCities.includes(item.name)" :is-fahrenheit="isFahrenheit" :use-store-unit="useStoreUnit" @select-card="selectCity" @click-detail="showDetail" @toggle-favorite="toggleFavorite" @heat-alert="showHeatAlert" @storm-alert="showStormAlert" />
        </div>
      </div>

      <div v-if="overseasWeatherList.length" class="weather-area">
        <h4 class="area-title">해외</h4>
        <div class="weather-grid">
          <WeatherCard v-for="item in overseasWeatherList" :key="item.id" :city-item="item" :is-selected="isCitySelected(item.name)" :is-favorite="favoriteCities.includes(item.name)" :is-fahrenheit="isFahrenheit" :use-store-unit="useStoreUnit" @select-card="selectCity" @click-detail="showDetail" @toggle-favorite="toggleFavorite" @heat-alert="showHeatAlert" @storm-alert="showStormAlert" />
        </div>
      </div>

      <p v-if="filteredWeatherList.length === 0" class="empty-message">😭 검색 결과와 일치하는 도시가 없습니다.</p>
    </BaseDashboardCard>

    <div class="status-bar">
      {{ selectedCityInfo }}
    </div>

    <div v-if="isHeatAlertVisible && selectedHotCity" class="heat-alert-backdrop" @click.self="closeHeatAlert">
      <MeteorShower />
      <PixelFireOverlay />
      <PanicCrowd />
      <div class="heat-alert-panel" role="dialog" aria-modal="true" aria-label="폭염 경보">
        <p class="alert-label">EXTREME HEAT WARNING</p>
        <div class="alert-icon">⚠</div>
        <h2>폭염 경보</h2>
        <p><strong>{{ selectedHotCity.name }}</strong>의 체감온도가 {{ displayTemp(selectedHotCity.feels) }}°{{ isFahrenheitMode ? 'F' : 'C' }}입니다.</p>
        <span>기준 체감온도 35°C 이상 · 수분 섭취와 야외 활동 주의</span>
        <button @click="closeHeatAlert">경보 확인</button>
      </div>
    </div>

    <div v-if="isStormAlertVisible && selectedStormCity" class="storm-alert-backdrop" @click.self="closeStormAlert">
      <StormSurvivors />
      <div class="storm-alert-panel" role="dialog" aria-modal="true" aria-label="폭풍우 경보">
        <p class="storm-alert-label">SEVERE STORM WARNING</p>
        <div class="storm-alert-icon">≋</div>
        <h2>폭풍우 경보</h2>
        <p><strong>{{ selectedStormCity.name }}</strong>에 {{ selectedStormCity.description || selectedStormCity.status }} 관측이 있습니다.</p>
        <span>현재 풍속 {{ selectedStormCity.wind || '-' }}m/s · 침수 구간과 하천 주변 접근 금지</span>
        <button @click="closeStormAlert">안전 수칙 확인</button>
      </div>
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

.unit-toggle,
.refresh-button {
  padding: 7px 12px;
  border: 1px solid rgba(255, 255, 255, 0.45);
  border-radius: 18px;
  background: rgba(4, 26, 55, 0.45);
  color: #fff;
  cursor: pointer;
}

.unit-toggle:hover,
.refresh-button:hover {
  background: rgba(255, 255, 255, 0.16);
}

.refresh-button:disabled {
  cursor: wait;
  opacity: 0.65;
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

.service-state {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  box-sizing: border-box;
  margin-bottom: 18px;
  padding: 13px 17px;
  border: 1px solid #b8ded8;
  border-radius: 13px;
  background: #effaf8;
}

.service-message {
  display: flex;
  align-items: center;
  gap: 11px;
}

.service-dot {
  width: 9px;
  height: 9px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: #0cb887;
  box-shadow: 0 0 0 5px rgba(12, 184, 135, 0.12);
}

.service-message strong {
  color: #21554e;
  font-size: 13px;
}

.service-message p {
  margin: 2px 0 0;
  color: #64867f;
  font-size: 11px;
}

.service-stats {
  display: flex;
  gap: 8px;
}

.service-stats span {
  padding: 6px 9px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.7);
  color: #577770;
  font-size: 11px;
}

.storm-preview-button {
  padding: 6px 10px;
  border: 1px solid rgba(32, 92, 112, 0.24);
  border-radius: 8px;
  background: #315f71;
  color: #f3fbff;
  font-size: 11px;
  cursor: pointer;
}

.storm-preview-button:hover {
  background: #234c5e;
}

.service-state.loading .service-dot {
  animation: service-pulse 0.9s ease-in-out infinite alternate;
}

.service-state.error {
  border-color: #efc394;
  background: #fff6ec;
}

.service-state.error .service-dot {
  background: #e68a2e;
  box-shadow: 0 0 0 5px rgba(230, 138, 46, 0.12);
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

.selection-guide {
  margin: -8px 0 16px;
  color: #71899c;
  font-size: 13px;
}

/* 과제 5에서는 국내·해외 버튼과 초기화 버튼을 한 줄에 모아 높이를 줄인다. */
.compact-selection .selection-groups {
  display: flex;
  align-items: center;
  gap: 18px;
  overflow-x: auto;
  padding-bottom: 2px;
}

.compact-selection .area-row {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  margin: 0;
}

.compact-selection .area-label {
  flex: 0 0 auto;
  width: auto;
  margin-right: 8px;
}

.compact-selection .area-btn,
.compact-selection .btn-all {
  flex: 0 0 auto;
  margin-top: 0;
  margin-bottom: 0;
}

.weather-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.weather-title-row h3 {
  margin-bottom: 16px;
}

.weather-update {
  margin: 0 0 16px;
  color: #587087;
  font-size: 12px;
}

.weather-update span + span::before {
  content: ' · ';
}

.api-error {
  margin: 0 0 16px;
  padding: 10px 12px;
  border-radius: 8px;
  background: #fff3e8;
  color: #ad5c19;
  font-size: 13px;
}

.heat-zone {
  overflow: hidden;
  border-color: #f08b35;
  background:
    radial-gradient(circle at 8% 120%, rgba(255, 107, 28, 0.62), transparent 28%),
    linear-gradient(120deg, #2a0b08, #59140c 55%, #210806);
  color: #fff;
}

.heat-zone-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  margin-bottom: 16px;
}

.heat-zone-header p {
  margin: 0 0 4px;
  color: #ffc36d;
  font-size: 11px;
  font-weight: bold;
  letter-spacing: 1.5px;
}

.heat-zone-header h3 {
  margin: 0;
  color: #fff;
  font-size: 22px;
}

.heat-zone-header > span {
  color: #ffd7ae;
  font-size: 13px;
}

.heat-ticker {
  position: relative;
  overflow: hidden;
  margin: 0 -24px -24px;
  padding: 0 0 24px;
}

.heat-ticker::before,
.heat-ticker::after {
  position: absolute;
  z-index: 2;
  top: 0;
  bottom: 24px;
  width: 60px;
  content: '';
  pointer-events: none;
}

.heat-ticker::before {
  left: 0;
  background: linear-gradient(90deg, #2a0b08, transparent);
}

.heat-ticker::after {
  right: 0;
  background: linear-gradient(270deg, #210806, transparent);
}

.heat-track {
  display: flex;
  width: max-content;
  gap: 12px;
  padding-left: 24px;
  animation: heat-ticker-move 20s linear infinite;
}

.heat-ticker:hover .heat-track {
  animation-play-state: paused;
}

.heat-city-card {
  display: grid;
  grid-template-columns: auto auto;
  align-items: center;
  min-width: 205px;
  padding: 13px 15px;
  border: 1px solid rgba(255, 205, 132, 0.66);
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(255, 132, 40, 0.88), rgba(149, 27, 10, 0.92));
  box-shadow: 0 8px 18px rgba(21, 0, 0, 0.25);
  color: #fff;
  cursor: pointer;
  text-align: left;
  transition: transform 0.2s, filter 0.2s;
}

.heat-city-card:hover {
  filter: brightness(1.15);
  transform: translateY(-4px) scale(1.02);
}

.heat-city-card strong {
  margin-right: 8px;
  font-size: 17px;
}

.heat-city-card span {
  color: #ffe8c7;
  font-size: 12px;
}

.heat-city-card b {
  grid-column: 1 / -1;
  margin-top: 7px;
  color: #fffbd2;
  font-size: 13px;
}

.heat-city-card .heat-flag {
  margin-right: 7px;
  font-size: 22px;
}

.heat-empty {
  margin: 0;
  padding: 16px;
  border: 1px dashed rgba(255, 221, 173, 0.45);
  border-radius: 10px;
  color: #ffd7ae;
  text-align: center;
}

.heat-alert-backdrop {
  position: fixed;
  z-index: 20;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: rgba(21, 2, 0, 0.66);
}

.heat-alert-panel {
  position: relative;
  z-index: 4;
  width: min(440px, calc(100% - 40px));
  padding: 34px 32px 30px;
  border: 2px solid #ffb245;
  border-radius: 22px;
  background: linear-gradient(150deg, rgba(74, 6, 5, 0.96), rgba(27, 3, 3, 0.96));
  box-shadow: 0 0 0 7px rgba(255, 94, 16, 0.16), 0 24px 80px rgba(0, 0, 0, 0.62);
  color: #fff;
  text-align: center;
  animation: warning-enter 0.38s ease-out;
}

.alert-label {
  margin: 0;
  color: #ffc568;
  font-size: 11px;
  font-weight: bold;
  letter-spacing: 2px;
}

.alert-icon {
  display: grid;
  width: 64px;
  height: 60px;
  margin: 14px auto 10px;
  border-radius: 20px 20px 28px 28px;
  background: linear-gradient(#ffca45, #f34613);
  box-shadow: 0 0 26px rgba(255, 128, 21, 0.78);
  color: #430300;
  font-size: 38px;
  font-weight: bold;
  line-height: 60px;
}

.heat-alert-panel h2 {
  margin: 0;
  color: #fff3d0;
  font-size: 34px;
}

.heat-alert-panel > p:not(.alert-label) {
  margin: 13px 0 8px;
  color: #ffe7c5;
  line-height: 1.7;
}

.heat-alert-panel > span {
  color: #f3b995;
  font-size: 13px;
}

.heat-alert-panel button {
  width: 100%;
  margin-top: 24px;
  padding: 12px;
  border: 1px solid #ffd17a;
  border-radius: 10px;
  background: linear-gradient(90deg, #ff8a21, #e73b15);
  color: #fff;
  cursor: pointer;
  font-weight: bold;
}

.heat-alert-panel button:hover {
  filter: brightness(1.12);
}

.storm-alert-backdrop {
  position: fixed;
  z-index: 20;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: rgba(0, 12, 25, 0.76);
}

.storm-alert-panel {
  position: relative;
  z-index: 5;
  width: min(440px, calc(100% - 40px));
  box-sizing: border-box;
  padding: 32px 30px 28px;
  border: 1px solid rgba(145, 225, 255, 0.76);
  border-radius: 22px;
  background: linear-gradient(150deg, rgba(5, 37, 58, 0.95), rgba(2, 17, 34, 0.97));
  box-shadow:
    0 0 0 7px rgba(58, 177, 219, 0.12),
    0 26px 90px rgba(0, 4, 12, 0.72),
    inset 0 1px rgba(255, 255, 255, 0.14);
  color: #eefaff;
  text-align: center;
  animation: warning-enter 0.38s ease-out;
}

.storm-alert-label {
  margin: 0;
  color: #78d8f3;
  font-size: 11px;
  font-weight: bold;
  letter-spacing: 2px;
}

.storm-alert-icon {
  display: grid;
  width: 64px;
  height: 58px;
  margin: 14px auto 10px;
  border: 1px solid rgba(192, 241, 255, 0.7);
  border-radius: 20px;
  background: linear-gradient(145deg, #58cce5, #176aa3);
  box-shadow: 0 0 30px rgba(75, 192, 231, 0.48);
  color: #eafcff;
  font-size: 43px;
  font-weight: bold;
  line-height: 48px;
}

.storm-alert-panel h2 {
  margin: 0;
  color: #f1fbff;
  font-size: 34px;
}

.storm-alert-panel > p:not(.storm-alert-label) {
  margin: 13px 0 8px;
  color: #d6eef8;
  line-height: 1.7;
}

.storm-alert-panel > span {
  color: #8db8ca;
  font-size: 13px;
}

.storm-alert-panel button {
  width: 100%;
  margin-top: 24px;
  padding: 12px;
  border: 1px solid #83d9ed;
  border-radius: 10px;
  background: linear-gradient(90deg, #258dba, #126191);
  color: #fff;
  cursor: pointer;
  font-weight: bold;
}

.storm-alert-panel button:hover {
  filter: brightness(1.14);
}

@keyframes heat-ticker-move {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

@keyframes warning-enter {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
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
  margin-right: 8px;
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

.clear-favorite-button {
  padding: 6px 10px;
  border: 0;
  background: transparent;
  color: #758b9b;
  cursor: pointer;
  font-size: 12px;
  text-decoration: underline;
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

@keyframes service-pulse {
  from {
    opacity: 0.45;
    transform: scale(0.88);
  }
  to {
    opacity: 1;
    transform: scale(1.12);
  }
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

  .weather-title-row {
    display: block;
  }

  .service-state,
  .service-stats {
    align-items: flex-start;
    flex-direction: column;
  }

  .weather-grid {
    grid-template-columns: 1fr;
  }
}
</style>
