<script setup>
import { ref, computed, watch, watchEffect, defineAsyncComponent, inject, nextTick, onBeforeUnmount } from 'vue'
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
import SkalaDisasterLogo from './SkalaDisasterLogo.vue'

// 3D 모드를 선택했을 때만 Three.js와 3D 지구 파일을 불러온다.
const EarthGlobe3D = defineAsyncComponent(() => import('./EarthGlobe3D.vue'))

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
// 상단 내비게이션의 스타링크 버튼을 누른 횟수를 App에서 전달받는다.
const starlinkRequest = inject('starlinkRequest', ref(0))

const weatherList = ref(weatherCities)
const searchQuery = ref('')
const selectedCityInfo = ref('카드를 클릭하거나 검색해 보세요.')

// 카드 선택과 지구 위치 선택은 서로 다른 기능이므로 상태도 나누어 둔다.
const selectedCities = ref([])
const selectedCity = ref('')
const globeSelectedCity = ref('')
const globeMode = ref('2d')
const earthFeatureSection = ref(null)
const earthGlobeSection = ref(null)
const isGlobeSwitchPrompted = ref(false)
const isFahrenheit = ref(false)
let starlinkModeTimer
let starlinkHighlightTimer

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
  const query = searchQuery.value.trim().toLocaleLowerCase()

  if (!query) {
    return weatherList.value
  }

  return weatherList.value.filter((item) => {
    const cityNames = [item.name, item.fullName, item.apiName]
    return cityNames.some((name) => name?.toLocaleLowerCase().includes(query))
  })
})

const selectedWeatherList = computed(() => {
  // 검색할 때는 기존 지역 선택과 관계없이 검색 결과를 바로 보여 준다.
  if (searchQuery.value.trim()) {
    return filteredWeatherList.value
  }

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

const rainyCityList = computed(() => {
  return weatherList.value.filter((item) => item.status === '비')
})

const stormDemoNames = ['서울', '수원', '부산', '대전', '제주']

// 실제 비 도시가 부족하면 여러 지역의 폭풍우 체험 카드로 빈자리를 채운다.
const waterCityList = computed(() => {
  const cityList = [...rainyCityList.value]
  const usedCityNames = cityList.map((item) => item.name)

  stormDemoNames.forEach((cityName, index) => {
    if (cityList.length >= 5 || usedCityNames.includes(cityName)) {
      return
    }

    const city = weatherList.value.find((item) => item.name === cityName)
    if (city) {
      cityList.push({
        ...city,
        status: '비',
        description: '폭풍우 체험',
        wind: 12 + index,
        isStormDemo: true,
      })
      usedCityNames.push(cityName)
    }
  })

  return cityList
})

const waterTickerList = computed(() => {
  const trackItems = []

  // 카드가 한 장뿐이어도 트랙이 끊겨 보이지 않도록 다섯 장까지 반복한다.
  for (let index = 0; index < Math.max(5, waterCityList.value.length); index += 1) {
    trackItems.push(waterCityList.value[index % waterCityList.value.length])
  }

  return [...trackItems, ...trackItems]
})

const statusText = computed(() => {
  if (searchQuery.value.trim()) {
    const cityNames = filteredWeatherList.value.map((item) => item.name).join(' · ')
    return filteredWeatherList.value.length ? `검색 결과 ${filteredWeatherList.value.length}곳 · ${cityNames}` : '검색 결과가 없습니다.'
  }

  if (selectedCities.value.length) {
    return `선택한 도시 ${selectedCities.value.length}곳 · ${selectedCities.value.join(' · ')}`
  }

  return selectedCityInfo.value
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
    selectedCityInfo.value = selectedCities.value.length ? message : '선택한 도시가 없습니다. 전체 도시를 표시합니다.'
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

const centerStarlinkGlobe = () => {
  if (globeMode.value !== '3d') return

  // 3D 지구가 실제로 화면에 붙은 다음 지구 영역의 중심을 맞춘다.
  earthGlobeSection.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

const openStarlinkFeature = async () => {
  clearTimeout(starlinkModeTimer)
  clearTimeout(starlinkHighlightTimer)

  // 먼저 2D 상태를 보여 준 뒤 3D 버튼이 선택되는 과정을 눈으로 확인할 수 있게 한다.
  globeMode.value = '2d'
  isGlobeSwitchPrompted.value = true
  await nextTick()
  earthFeatureSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  starlinkModeTimer = setTimeout(() => {
    globeMode.value = '3d'
    starlinkHighlightTimer = setTimeout(() => {
      isGlobeSwitchPrompted.value = false
    }, 900)
  }, 500)
}

const closeStarlinkFeature = () => {
  clearTimeout(starlinkModeTimer)
  clearTimeout(starlinkHighlightTimer)
  globeMode.value = '2d'
  isGlobeSwitchPrompted.value = false
}

// 화면이 다시 열렸을 때 지난 요청을 반복하지 않고, 버튼을 새로 누른 경우에만 실행한다.
watch(
  starlinkRequest,
  (requestCount) => {
    if (!props.isLive) return

    if (requestCount > 0) {
      openStarlinkFeature()
    } else {
      closeStarlinkFeature()
    }
  },
)

onBeforeUnmount(() => {
  clearTimeout(starlinkModeTimer)
  clearTimeout(starlinkHighlightTimer)
})

const showHeatAlert = (cityItem) => {
  if (!props.isLive || cityItem.feels < 35) {
    return
  }

  selectedHotCity.value = cityItem
  isStormAlertVisible.value = false
  isHeatAlertVisible.value = true
}

const keepCitySelected = (cityItem) => {
  if (!selectedCities.value.includes(cityItem.name)) {
    selectedCities.value.push(cityItem.name)
  }

  selectedCity.value = cityItem.name
  selectedCityInfo.value = `${cityItem.name}이 선택되었습니다.`
}

const selectSearchResult = (cityItem) => {
  keepCitySelected(cityItem)
}

const selectHotCity = (cityItem) => {
  keepCitySelected(cityItem)
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

const selectStormCity = (cityItem) => {
  keepCitySelected(cityItem)
  showStormAlert(cityItem)
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
      </div>
    </div>

    <BaseDashboardCard class="dashboard-panel search-panel">
      <SearchBar :current-query="searchQuery" @update-query="updateSearchQuery" />

      <div v-if="searchQuery.trim()" class="search-result-preview">
        <div class="search-result-heading">
          <strong>바로 찾은 도시</strong>
          <span>{{ filteredWeatherList.length }}곳</span>
        </div>

        <div v-if="filteredWeatherList.length" class="search-result-list">
          <button v-for="item in filteredWeatherList" :key="`search-${item.id}`" @click="selectSearchResult(item)">
            <span v-if="item.area === '해외'" class="search-result-flag">{{ item.flag }}</span>
            <span class="search-result-city">
              <strong>{{ item.name }}</strong>
              <small>{{ item.fullName }}</small>
            </span>
            <span class="search-result-weather">{{ item.description || item.status }}</span>
            <b>{{ displayTemp(item.temp) }}°{{ isFahrenheitMode ? 'F' : 'C' }}</b>
          </button>
        </div>
        <p v-else class="search-result-empty">일치하는 도시가 없습니다. 서울, Paris처럼 다시 검색해 보세요.</p>
      </div>
    </BaseDashboardCard>

    <BaseDashboardCard v-if="isLive" class="dashboard-panel heat-zone">
      <div class="heat-zone-header">
        <div>
          <p>HOT CITY TRACK</p>
          <div class="zone-title-line">
            <h3>불지옥</h3>
            <strong>지역 박스를 클릭해 보세요 !</strong>
          </div>
        </div>
        <span class="zone-condition">체감온도 35°C 이상</span>
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

    <BaseDashboardCard v-if="isLive" class="dashboard-panel water-zone">
      <div class="water-zone-header">
        <div>
          <p>STORM CITY TRACK</p>
          <div class="zone-title-line">
            <h3>물지옥</h3>
            <strong>지역 박스를 클릭해 보세요 !</strong>
          </div>
        </div>
        <span class="zone-condition">비·폭풍우 관측 지역</span>
      </div>

      <div class="water-ticker">
        <div class="water-track">
          <button v-for="(item, index) in waterTickerList" :key="`${item.id}-water-${index}`" class="water-city-card" @click="selectStormCity(item)">
            <span v-if="item.isStormDemo" class="demo-ribbon">DEMO</span>
            <span v-if="item.area === '해외'" class="water-flag">{{ item.flag }}</span>
            <strong>{{ item.name }}</strong>
            <span>{{ item.isStormDemo ? '- 폭풍우 체험' : item.description || item.status }}</span>
            <b v-if="!item.isStormDemo">풍속 {{ item.wind || '-' }}m/s</b>
            <b v-else class="demo-card-spacer" aria-hidden="true">&nbsp;</b>
          </button>
        </div>
      </div>
    </BaseDashboardCard>

    <div v-if="isLive" ref="earthFeatureSection" class="earth-feature-section">
      <BaseDashboardCard class="dashboard-panel earth-filter-panel compact-selection">
        <div class="earth-filter-heading">
          <div>
            <h3>지구 위치 선택</h3>
            <p class="selection-guide">날씨 카드와 관계없이 지구에서 이동할 도시를 선택합니다.</p>
          </div>

          <div class="globe-view-actions">
            <div class="globe-mode-switch" :class="{ spotlight: isGlobeSwitchPrompted }" aria-label="지구 화면 방식 선택">
              <button type="button" :class="{ active: globeMode === '2d' }" :aria-pressed="globeMode === '2d'" @click="globeMode = '2d'">
                <span class="mode-symbol">▧</span>
                <span class="mode-copy"><small>CLASSIC</small><strong>2D 지도</strong></span>
              </button>
              <button type="button" :class="{ active: globeMode === '3d' }" :aria-pressed="globeMode === '3d'" @click="globeMode = '3d'">
                <span class="mode-symbol">◉</span>
                <span class="mode-copy"><small>WEBGL</small><strong>3D 지구</strong></span>
              </button>
            </div>
          </div>
        </div>

        <div class="earth-selection-line">
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
          </div>

          <button class="globe-reset-button" type="button" @click="resetGlobeCity">
            <span>↺</span>
            지구 초기화
          </button>
        </div>
      </BaseDashboardCard>

      <!-- 기존 2D 지구는 그대로 보존하고 선택한 모드에 맞는 화면만 보여 준다. -->
      <div ref="earthGlobeSection" class="earth-globe-section">
        <EarthGlobe v-if="globeMode === '2d'" :city-item="globeSelectedCityData" :is-fahrenheit="isFahrenheitMode" />
        <EarthGlobe3D v-if="globeMode === '3d'" :city-item="globeSelectedCityData" :is-fahrenheit="isFahrenheitMode" @ready="centerStarlinkGlobe" />
      </div>
    </div>

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
      {{ statusText }}
    </div>

    <div v-if="isHeatAlertVisible && selectedHotCity" class="heat-alert-backdrop" @click.self="closeHeatAlert">
      <MeteorShower />
      <PixelFireOverlay />
      <PanicCrowd />
      <SkalaDisasterLogo type="heat" />
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
      <SkalaDisasterLogo type="storm" />
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

.search-result-preview {
  margin-top: 17px;
  padding-top: 15px;
  border-top: 1px solid #dce8ed;
}

.search-result-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  color: #315b6d;
  font-size: 13px;
}

.search-result-heading span {
  padding: 3px 8px;
  border-radius: 10px;
  background: #e6f4f5;
  color: #167c81;
  font-size: 11px;
}

.search-result-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
}

.search-result-list button {
  display: grid;
  grid-template-columns: auto minmax(85px, 1fr) minmax(90px, auto) auto;
  align-items: center;
  gap: 10px;
  padding: 11px 13px;
  border: 1px solid #cfe0e7;
  border-radius: 10px;
  background: #f8fcfd;
  color: #31546a;
  cursor: pointer;
  text-align: left;
}

.search-result-list button:hover {
  border-color: #69bfc3;
  background: #effafa;
}

.search-result-flag {
  font-size: 22px;
}

.search-result-city strong,
.search-result-city small {
  display: block;
}

.search-result-city small {
  margin-top: 2px;
  color: #7a929f;
  font-size: 10px;
}

.search-result-weather {
  overflow: hidden;
  color: #708b99;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-result-list button > b {
  color: #176f78;
  font-size: 16px;
}

.search-result-empty {
  margin: 0;
  padding: 13px;
  border: 1px dashed #cadde4;
  border-radius: 9px;
  color: #758e9c;
  font-size: 12px;
  text-align: center;
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

.earth-feature-section {
  scroll-margin-top: 155px;
}

.earth-filter-panel {
  position: relative;
  min-height: 190px;
  padding-right: 208px;
  box-sizing: border-box;
}

.earth-filter-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.earth-filter-heading .selection-guide {
  margin-bottom: 16px;
}

.globe-view-actions {
  position: absolute;
  top: 50%;
  right: 22px;
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 10px;
  transform: translateY(-50%);
}

.globe-reset-button {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 7px;
  min-height: 32px;
  padding: 7px 10px;
  border: 1px solid rgba(89, 141, 164, 0.32);
  border-radius: 18px;
  background: rgba(8, 27, 40, 0.76);
  color: #8daab8;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  transition: border-color 0.2s, background 0.2s, color 0.2s, transform 0.2s;
}

.globe-reset-button span {
  color: #6dd8e8;
  font-size: 14px;
  line-height: 1;
}

.globe-reset-button:hover {
  border-color: rgba(102, 220, 237, 0.62);
  background: rgba(16, 54, 70, 0.9);
  color: #d8f6fa;
  transform: translateY(-2px);
}

.globe-mode-switch {
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  gap: 8px;
  padding: 7px;
  border: 1px solid rgba(89, 155, 185, 0.34);
  border-radius: 17px;
  background: linear-gradient(145deg, rgba(5, 20, 32, 0.96), rgba(10, 36, 51, 0.94));
  box-shadow: inset 0 0 20px rgba(62, 176, 205, 0.06), 0 9px 22px rgba(0, 13, 24, 0.2);
}

.globe-mode-switch button {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 154px;
  min-height: 58px;
  padding: 8px 13px;
  border: 1px solid rgba(99, 145, 166, 0.2);
  border-radius: 12px;
  background: linear-gradient(145deg, rgba(30, 53, 67, 0.72), rgba(15, 34, 47, 0.86));
  color: #93aebb;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.22s, box-shadow 0.22s, transform 0.22s, filter 0.22s;
}

.globe-mode-switch button:hover {
  border-color: rgba(104, 219, 236, 0.58);
  filter: brightness(1.12);
  transform: translateY(-3px);
}

.mode-symbol {
  display: grid;
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid rgba(111, 170, 191, 0.24);
  border-radius: 10px;
  background: rgba(106, 162, 183, 0.08);
  color: #87a9b8;
  font-size: 19px;
}

.mode-copy small,
.mode-copy strong {
  display: block;
}

.mode-copy small {
  margin-bottom: 3px;
  color: #688797;
  font-size: 8px;
  letter-spacing: 1px;
}

.mode-copy strong {
  color: #b8d0da;
  font-size: 14px;
  white-space: nowrap;
}

.globe-mode-switch button.active {
  border-color: #5ddcf0;
  background:
    radial-gradient(circle at 8% 12%, rgba(110, 235, 255, 0.25), transparent 37%),
    linear-gradient(135deg, #155b73, #0b354c);
  box-shadow: 0 8px 20px rgba(18, 125, 158, 0.32), inset 0 0 18px rgba(90, 220, 242, 0.1);
  color: #fff;
}

.globe-mode-switch button.active .mode-symbol {
  border-color: rgba(163, 242, 255, 0.48);
  background: rgba(102, 226, 244, 0.18);
  color: #d7fbff;
  box-shadow: 0 0 14px rgba(86, 224, 243, 0.2);
}

.globe-mode-switch button.active small {
  color: #83e9f5;
}

.globe-mode-switch button.active strong {
  color: #fff;
}

.globe-mode-switch.spotlight {
  animation: globe-mode-spotlight 0.72s ease-in-out 2 alternate;
}

@keyframes globe-mode-spotlight {
  to {
    border-color: rgba(104, 232, 249, 0.82);
    box-shadow: 0 0 0 5px rgba(61, 204, 224, 0.12), 0 0 30px rgba(55, 194, 220, 0.32);
    transform: scale(1.025);
  }
}

@media (max-width: 640px) {
  .earth-filter-panel {
    min-height: 0;
    padding-right: 22px;
  }

  .earth-filter-heading {
    align-items: stretch;
    flex-direction: column;
  }

  .globe-view-actions {
    position: static;
    align-items: stretch;
    margin-bottom: 16px;
    transform: none;
  }

  .globe-reset-button {
    margin-top: 12px;
  }

  .earth-selection-line {
    align-items: flex-start;
    flex-direction: column;
  }

  .earth-selection-line .selection-groups {
    width: 100%;
  }

  .globe-mode-switch {
    width: 100%;
    box-sizing: border-box;
  }

  .globe-mode-switch button {
    width: auto;
    min-width: 0;
  }
}

/* 과제 5에서는 국내·해외 버튼과 초기화 버튼을 한 줄에 모아 높이를 줄인다. */
.earth-selection-line {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.earth-filter-panel .earth-selection-line .selection-groups {
  min-width: 0;
  padding-bottom: 0;
}

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
  min-height: 190px;
  box-sizing: border-box;
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

.zone-title-line {
  display: flex;
  align-items: center;
  gap: 16px;
}

.zone-title-line strong {
  color: #fff4dc;
  font-size: clamp(15px, 2vw, 19px);
  letter-spacing: -0.3px;
  animation: guide-pulse 1.4s ease-in-out infinite alternate;
}

.zone-condition {
  color: #ffd7ae;
  font-size: 12px;
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
  grid-template-columns: auto auto 1fr;
  align-items: center;
  min-width: 205px;
  height: 74px;
  min-height: 74px;
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

.water-zone {
  overflow: hidden;
  min-height: 190px;
  box-sizing: border-box;
  border-color: #3186aa;
  background:
    radial-gradient(circle at 92% 120%, rgba(27, 161, 207, 0.42), transparent 30%),
    linear-gradient(120deg, #061c2d, #0b3a55 55%, #051725);
  color: #fff;
}

.water-zone-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  margin-bottom: 16px;
}

.water-zone-header p {
  margin: 0 0 4px;
  color: #75d8f5;
  font-size: 11px;
  font-weight: bold;
  letter-spacing: 1.5px;
}

.water-zone-header h3 {
  margin: 0;
  color: #fff;
  font-size: 22px;
}

.water-zone .zone-condition {
  color: #8fcbe0;
}

.water-zone .zone-title-line strong {
  color: #dff8ff;
}

.water-ticker {
  position: relative;
  overflow: hidden;
  margin: 0 -24px -24px;
  padding: 0 0 24px;
}

.water-ticker::before,
.water-ticker::after {
  position: absolute;
  z-index: 2;
  top: 0;
  bottom: 24px;
  width: 60px;
  content: '';
  pointer-events: none;
}

.water-ticker::before {
  left: 0;
  background: linear-gradient(90deg, #061c2d, transparent);
}

.water-ticker::after {
  right: 0;
  background: linear-gradient(270deg, #051725, transparent);
}

.water-track {
  display: flex;
  width: max-content;
  gap: 12px;
  padding-left: 24px;
  animation: water-ticker-move 18s linear infinite;
}

.water-ticker:hover .water-track {
  animation-play-state: paused;
}

.water-city-card {
  position: relative;
  display: grid;
  grid-template-columns: auto auto;
  align-items: center;
  min-width: 205px;
  height: 74px;
  min-height: 74px;
  padding: 13px 15px;
  border: 1px solid rgba(145, 224, 250, 0.6);
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(31, 143, 185, 0.92), rgba(6, 54, 91, 0.94));
  box-shadow: 0 8px 18px rgba(0, 8, 20, 0.32);
  color: #fff;
  cursor: pointer;
  overflow: hidden;
  text-align: left;
  transition: transform 0.2s, filter 0.2s;
}

.water-city-card:hover {
  filter: brightness(1.16);
  transform: translateY(-4px) scale(1.02);
}

.water-city-card strong {
  margin-right: 8px;
  font-size: 17px;
}

.water-city-card span {
  color: #d1f2ff;
  font-size: 12px;
}

.water-city-card b {
  grid-column: 1 / -1;
  margin-top: 7px;
  color: #bfefff;
  font-size: 13px;
}

.water-city-card .demo-card-spacer {
  visibility: hidden;
}

.water-city-card .water-flag {
  margin-right: 7px;
  font-size: 22px;
}

.water-city-card .demo-ribbon {
  position: absolute;
  z-index: 3;
  top: 9px;
  right: -29px;
  width: 100px;
  padding: 3px 0;
  background: linear-gradient(90deg, #c8f6ff, #62cde8);
  box-shadow: 0 3px 8px rgba(0, 25, 40, 0.3);
  color: #07506c;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 1.5px;
  text-align: center;
  transform: rotate(42deg);
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

@keyframes water-ticker-move {
  from {
    transform: translateX(-50%);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes guide-pulse {
  from {
    opacity: 0.72;
    transform: translateX(0);
  }
  to {
    opacity: 1;
    transform: translateX(4px);
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

  .search-result-list {
    grid-template-columns: 1fr;
  }

  .heat-zone-header,
  .water-zone-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
  }

  .zone-title-line {
    align-items: flex-start;
    flex-direction: column;
    gap: 5px;
  }
}
</style>
