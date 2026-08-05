import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useConfigStore = defineStore('config', () => {
  // state: 현재 대시보드에서 사용할 온도 단위
  const unit = ref('celsius')

  // getters: 단위가 바뀌면 화면의 기호도 함께 갱신된다.
  const unitSymbol = computed(() => {
    return unit.value === 'celsius' ? '℃' : '℉'
  })

  // actions: 단위 변경은 스토어의 함수에서만 처리한다.
  function toggleUnit() {
    unit.value = unit.value === 'celsius' ? 'fahrenheit' : 'celsius'
  }

  return {
    unit,
    unitSymbol,
    toggleUnit,
  }
})
