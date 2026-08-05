<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { weatherCities } from '../data/weatherCities'
import WeatherParent from '../components/exercise/WeatherParent.vue'

const props = defineProps({
  weatherData: {
    type: Array,
    default: () => weatherCities,
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

const emit = defineEmits(['refresh'])
const router = useRouter()
const route = useRoute()
const searchQuery = ref('')

// 처음 들어온 주소에 검색어가 있으면 입력창의 시작값으로 사용한다.
onMounted(() => {
  searchQuery.value = route.query.search || ''
})

// 과제 3의 검색 이벤트를 받아 주소의 ?search= 값까지 연결한다.
const updateSearchQuery = (query) => {
  searchQuery.value = query
  router.replace({
    path: route.path,
    query: query ? { search: query } : {},
  })
}

// 과제 3의 상세보기 이벤트를 받아 도시별 주소로 이동한다.
const handleDetailJump = (cityName) => {
  const city = props.weatherData?.find((item) => item.name === cityName)

  if (city) {
    router.push('/weather/' + city.id)
  }
}
</script>

<template>
  <WeatherParent
    :weather-data="weatherData"
    :initial-search="searchQuery"
    :use-router="true"
    :use-store-unit="useStoreUnit"
    :is-live="isLive"
    :is-loading="isLoading"
    :error-message="errorMessage"
    :last-updated="lastUpdated"
    @update-search="updateSearchQuery"
    @click-detail="handleDetailJump"
    @refresh="emit('refresh')"
  />
</template>
