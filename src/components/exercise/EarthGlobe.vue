<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  cityItem: {
    type: Object,
    default: null,
  },
  isFahrenheit: {
    type: Boolean,
    default: false,
  },
})

const displayTemp = (temp) => {
  if (props.isFahrenheit) {
    return Math.round((temp * 9) / 5 + 32)
  }

  return temp
}

const initialEarthView = {
  backgroundPosition: '50% 50%',
  backgroundSize: 'auto 125%',
  '--earth-duration': '900ms',
  '--earth-easing': 'ease-in-out',
}

const getEarthView = (cityItem, zoom, duration, easing) => {
  // NASA 지구 지도는 가로 360도, 세로 180도를 표현하므로 도시 좌표를 이미지 비율로 바꾼다.
  const longitudeRatio = (cityItem.lon + 180) / 360
  const latitudeRatio = (90 - cityItem.lat) / 180
  const heightScale = zoom / 100
  const widthScale = heightScale * 2

  // 확대된 지도에서 선택 좌표가 지구의 정중앙에 오도록 배경 위치를 계산한다.
  const positionX = ((0.5 - widthScale * longitudeRatio) / (1 - widthScale)) * 100
  const rawPositionY = ((0.5 - heightScale * latitudeRatio) / (1 - heightScale)) * 100
  const positionY = Math.min(100, Math.max(0, rawPositionY))

  return {
    backgroundPosition: `${positionX.toFixed(2)}% ${positionY.toFixed(2)}%`,
    backgroundSize: `auto ${zoom}%`,
    '--earth-duration': `${duration}ms`,
    '--earth-easing': easing,
  }
}

const earthPosition = ref(initialEarthView)
const isEarthMoving = ref(false)
const showPin = ref(false)
let moveFrame
let moveTimers = []

const clearEarthMotion = () => {
  cancelAnimationFrame(moveFrame)
  moveTimers.forEach((timer) => clearTimeout(timer))
  moveTimers = []
}

const addMoveTimer = (callback, delay) => {
  const timer = setTimeout(callback, delay)
  moveTimers.push(timer)
}

watch(
  () => props.cityItem?.id,
  (newCityId) => {
    clearEarthMotion()

    if (!newCityId) {
      isEarthMoving.value = false
      showPin.value = false
      earthPosition.value = initialEarthView
      return
    }

    const selectedCity = props.cityItem
    const continentZoom = selectedCity.area === '국내' ? 220 : 200
    const regionZoom = selectedCity.area === '국내' ? 420 : 320
    const closeZoom = selectedCity.area === '국내' ? 1250 : 650

    // 도시를 바꿀 때마다 먼저 지구 전경으로 빠졌다가 대륙과 도시 순서로 접근한다.
    isEarthMoving.value = true
    showPin.value = false

    moveFrame = requestAnimationFrame(() => {
      // 멀리 있는 지구에서 출발해 대륙, 지역, 도시 순서로 점점 빠르게 접근한다.
      earthPosition.value = getEarthView(selectedCity, 145, 700, 'cubic-bezier(0.4, 0, 0.6, 1)')

      addMoveTimer(() => {
        earthPosition.value = getEarthView(selectedCity, continentZoom, 1300, 'cubic-bezier(0.22, 0.35, 0.45, 0.9)')
      }, 620)

      addMoveTimer(() => {
        earthPosition.value = getEarthView(selectedCity, regionZoom, 900, 'cubic-bezier(0.25, 0.3, 0.35, 0.95)')
      }, 1850)

      addMoveTimer(() => {
        earthPosition.value = getEarthView(selectedCity, closeZoom, 620, 'cubic-bezier(0.28, 0.45, 0.2, 1)')
      }, 2680)

      addMoveTimer(() => {
        isEarthMoving.value = false
        showPin.value = true
      }, 3340)
    })
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  clearEarthMotion()
})

const earthStatus = computed(() => {
  if (!props.cityItem) return '지구 탐색 대기 중'
  if (isEarthMoving.value) return `${props.cityItem.name} 이동 중`
  return `${props.cityItem.name} 위치 고정`
})

const latitudeText = computed(() => {
  if (!props.cityItem) return ''
  // 위도 값의 부호에 따라 북위(N)와 남위(S)를 표시한다.
  return `${Math.abs(props.cityItem.lat).toFixed(2)}°${props.cityItem.lat >= 0 ? 'N' : 'S'}`
})

const longitudeText = computed(() => {
  if (!props.cityItem) return ''
  // 경도 값의 부호에 따라 동경(E)과 서경(W)을 표시한다.
  return `${Math.abs(props.cityItem.lon).toFixed(2)}°${props.cityItem.lon >= 0 ? 'E' : 'W'}`
})
</script>

<template>
  <section class="earth-explorer" :class="{ 'has-city': cityItem }">
    <div class="earth-copy">
      <p class="earth-label">LIVE EARTH EXPLORER</p>
      <h3 v-if="cityItem">{{ cityItem.flag }} {{ cityItem.fullName }}</h3>
      <h3 v-else>도시를 선택하면 지구가 이동합니다</h3>
      <p v-if="cityItem" class="earth-description">
        {{ isEarthMoving ? '위성 시점에서 선택한 도시로 접근하고 있습니다.' : '선택한 도시가 지구 중앙에 도착했습니다. 새로운 도시를 누르면 다시 이동합니다.' }}
      </p>
      <p v-else class="earth-description">
        국내 또는 해외 도시 하나를 선택해 보세요.
      </p>

      <div v-if="cityItem" class="earth-city-data">
        <div>
          <span>현재 기온</span>
          <strong>{{ displayTemp(cityItem.temp) }}°{{ isFahrenheit ? 'F' : 'C' }}</strong>
        </div>
        <div>
          <span>체감 온도</span>
          <strong>{{ displayTemp(cityItem.feels) }}°{{ isFahrenheit ? 'F' : 'C' }}</strong>
        </div>
        <div>
          <span>좌표</span>
          <strong>{{ latitudeText }} · {{ longitudeText }}</strong>
        </div>
      </div>
    </div>

    <div class="earth-stage" aria-hidden="true">
      <div class="orbit orbit-one"></div>
      <div class="orbit orbit-two"></div>
      <div class="earth-atmosphere" :class="{ idle: !cityItem, traveling: isEarthMoving }">
        <div class="earth-sphere" :style="earthPosition"></div>
        <div v-if="showPin && cityItem" :key="cityItem.id" class="earth-pin">
          <span></span>
        </div>
        <div v-if="showPin && cityItem" :key="`pulse-${cityItem.id}`" class="pin-pulse"></div>
      </div>
      <p class="earth-status">{{ earthStatus }}</p>
    </div>
  </section>
</template>

<style scoped>
.earth-explorer {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 0.82fr) minmax(460px, 1.18fr);
  align-items: center;
  min-height: 500px;
  margin-bottom: 18px;
  padding: 36px 42px;
  overflow: hidden;
  border: 1px solid rgba(112, 180, 215, 0.28);
  border-radius: 18px;
  background:
    radial-gradient(circle at 78% 48%, rgba(30, 116, 164, 0.2), transparent 34%),
    radial-gradient(circle at 12% 6%, rgba(91, 168, 204, 0.12) 0 1px, transparent 2px),
    radial-gradient(circle at 28% 72%, rgba(255, 255, 255, 0.16) 0 1px, transparent 2px),
    linear-gradient(135deg, #07121f, #0a2035 58%, #06101c);
  box-shadow: 0 18px 45px rgba(0, 10, 22, 0.24);
  box-sizing: border-box;
  color: #fff;
}

.earth-explorer::after {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.36) 0.7px, transparent 0.8px);
  background-size: 56px 56px;
  content: '';
  opacity: 0.32;
  pointer-events: none;
}

.earth-copy,
.earth-stage {
  position: relative;
  z-index: 1;
}

.earth-copy {
  max-width: 420px;
}

.earth-label {
  margin: 0 0 10px;
  color: #66d8f1;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.8px;
}

.earth-copy h3 {
  margin: 0;
  color: #f4fbff;
  font-size: 27px;
  line-height: 1.35;
}

.earth-description {
  margin: 12px 0 23px;
  color: #a9c5d8;
  font-size: 14px;
  line-height: 1.7;
}

.earth-city-data {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.earth-city-data div {
  padding: 13px 14px;
  border: 1px solid rgba(139, 208, 235, 0.2);
  border-radius: 11px;
  background: rgba(5, 24, 39, 0.58);
}

.earth-city-data div:last-child {
  grid-column: 1 / -1;
}

.earth-city-data span,
.earth-city-data strong {
  display: block;
}

.earth-city-data span {
  margin-bottom: 5px;
  color: #6f9eb8;
  font-size: 11px;
}

.earth-city-data strong {
  color: #e9f8ff;
  font-size: 15px;
}

.earth-stage {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 430px;
}

.earth-atmosphere {
  position: relative;
  width: 390px;
  height: 390px;
  border-radius: 50%;
  box-shadow:
    0 0 0 1px rgba(152, 223, 255, 0.44),
    0 0 22px rgba(72, 178, 226, 0.46),
    0 0 65px rgba(43, 120, 173, 0.3);
}

.earth-atmosphere.idle {
  animation: earth-idle-float 4s ease-in-out infinite alternate;
}

.earth-atmosphere.traveling {
  animation: earth-travel-glow 0.76s ease-in-out infinite alternate;
}

.earth-sphere {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 50%;
  background-color: #145282;
  background-image: url('../../assets/weather/earth-texture-nasa-8192.jpg');
  background-repeat: repeat-x;
  box-shadow:
    inset 42px 4px 62px rgba(0, 5, 15, 0.82),
    inset -18px -12px 38px rgba(0, 10, 30, 0.5),
    0 24px 60px rgba(0, 0, 0, 0.5);
  transition:
    background-position var(--earth-duration) var(--earth-easing),
    background-size var(--earth-duration) var(--earth-easing);
  will-change: background-position, background-size;
}

.earth-sphere::after {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background:
    radial-gradient(circle at 64% 30%, rgba(255, 255, 255, 0.14), transparent 20%),
    linear-gradient(105deg, rgba(0, 0, 0, 0.55) 0%, transparent 38%, transparent 66%, rgba(0, 0, 0, 0.34) 100%);
  content: '';
  pointer-events: none;
}

.orbit {
  position: absolute;
  width: 455px;
  height: 150px;
  border: 1px solid rgba(116, 212, 245, 0.22);
  border-radius: 50%;
  transform: rotate(-18deg);
}

.orbit-two {
  width: 450px;
  height: 170px;
  transform: rotate(65deg);
}

.earth-pin {
  position: absolute;
  z-index: 4;
  top: calc(50% - 37px);
  left: 50%;
  width: 31px;
  height: 31px;
  border: 3px solid #fff;
  border-radius: 50% 50% 50% 0;
  background: linear-gradient(145deg, #ff6a49, #dc2037);
  box-shadow: 0 4px 14px rgba(44, 0, 0, 0.52);
  opacity: 0;
  transform: translate(-50%, -110px) rotate(-45deg);
  animation: pin-drop 0.62s 0.05s cubic-bezier(0.2, 0.82, 0.36, 1.3) forwards;
}

.earth-pin span {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #fff;
}

.pin-pulse {
  position: absolute;
  z-index: 3;
  top: 50%;
  left: 50%;
  width: 12px;
  height: 5px;
  border: 2px solid #ff6e60;
  border-radius: 50%;
  opacity: 0;
  transform: translateX(-50%);
  animation: pin-pulse 1.8s 0.5s ease-out infinite;
}

.earth-status {
  position: absolute;
  right: 50%;
  bottom: -3px;
  margin: 0;
  padding: 7px 13px;
  border: 1px solid rgba(123, 212, 242, 0.24);
  border-radius: 20px;
  background: rgba(4, 18, 31, 0.76);
  color: #8ec9df;
  font-size: 11px;
  letter-spacing: 0.4px;
  transform: translateX(50%);
}

@keyframes earth-idle-float {
  from {
    transform: translateY(4px) scale(0.99);
  }
  to {
    transform: translateY(-7px) scale(1.01);
  }
}

@keyframes earth-travel-glow {
  from {
    box-shadow:
      0 0 0 1px rgba(152, 223, 255, 0.44),
      0 0 24px rgba(72, 178, 226, 0.52),
      0 0 62px rgba(43, 120, 173, 0.28);
  }
  to {
    box-shadow:
      0 0 0 2px rgba(189, 238, 255, 0.62),
      0 0 38px rgba(77, 199, 241, 0.66),
      0 0 92px rgba(43, 120, 173, 0.42);
  }
}

@keyframes pin-drop {
  0% {
    opacity: 0;
    transform: translate(-50%, -110px) rotate(-45deg) scale(1.4);
  }
  70% {
    opacity: 1;
    transform: translate(-50%, 6px) rotate(-45deg) scale(0.9);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, 0) rotate(-45deg) scale(1);
  }
}

@keyframes pin-pulse {
  0% {
    opacity: 0.8;
    transform: translateX(-50%) scale(0.4);
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) scale(5.5);
  }
}

@media (max-width: 820px) {
  .earth-explorer {
    grid-template-columns: 1fr;
    padding: 28px 24px;
  }

  .earth-copy {
    max-width: none;
  }

  .earth-stage {
    margin-top: 16px;
  }
}

@media (max-width: 460px) {
  .earth-atmosphere {
    width: 285px;
    height: 285px;
  }

  .earth-stage {
    min-height: 325px;
  }

  .orbit {
    width: 320px;
  }
}
</style>
