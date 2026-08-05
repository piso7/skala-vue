import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'weather-favorite-cities'

const loadFavoriteCities = () => {
  const savedCities = localStorage.getItem(STORAGE_KEY)

  if (!savedCities) {
    return []
  }

  try {
    return JSON.parse(savedCities)
  } catch (error) {
    console.error('저장된 즐겨찾기를 읽지 못했습니다.', error)
    return []
  }
}

export const useFavoriteStore = defineStore('favoriteWeather', () => {
  // state: 여러 화면에서 함께 사용할 즐겨찾기 도시 목록
  const favoriteCities = ref(loadFavoriteCities())

  // getters: 원본 목록을 바꾸지 않고 즐겨찾기 개수를 계산한다.
  const favoriteCount = computed(() => favoriteCities.value.length)

  // actions: 목록 변경과 브라우저 저장을 한 곳에서 처리한다.
  const saveFavorites = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteCities.value))
  }

  const toggleFavorite = (cityName) => {
    const cityIndex = favoriteCities.value.indexOf(cityName)

    if (cityIndex === -1) {
      favoriteCities.value.push(cityName)
    } else {
      favoriteCities.value.splice(cityIndex, 1)
    }

    saveFavorites()
  }

  const clearFavorites = () => {
    favoriteCities.value = []
    saveFavorites()
  }

  return {
    favoriteCities,
    favoriteCount,
    toggleFavorite,
    clearFavorites,
  }
})
