<script setup>
import { computed } from 'vue'
import { useConfigStore } from '@/stores/configStore'

const props = defineProps({
  cityItem: {
    type: Object,
    required: true,
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
  isFahrenheit: {
    type: Boolean,
    default: false,
  },
  useStoreUnit: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select-card', 'click-detail', 'toggle-favorite', 'heat-alert', 'storm-alert'])
const configStore = useConfigStore()

// 과제 2는 컴포넌트 상태를, 과제 5는 Pinia에 저장된 단위를 사용한다.
const displayAsFahrenheit = computed(() => {
  if (props.useStoreUnit) {
    return configStore.unit === 'fahrenheit'
  }

  return props.isFahrenheit
})

const selectCard = (cityItem) => {
  emit('select-card', `${cityItem.name}이 선택되었습니다.`, cityItem.name)

  const weatherType = cityItem.weatherType || cityItem.status

  // 비가 오는 도시는 침수 경보를 먼저 보여 주고, 그 외 폭염 도시는 폭염 경보를 연다.
  if (weatherType === '비') {
    emit('storm-alert', cityItem)
  } else if (cityItem.feels >= 35) {
    emit('heat-alert', cityItem)
  }
}

const clickDetail = (cityItem) => {
  emit('click-detail', cityItem.name, cityItem.status)
}

const toggleFavorite = (cityName) => {
  emit('toggle-favorite', cityName)
}

const displayTemp = (temp) => {
  if (displayAsFahrenheit.value) {
    return Math.round((temp * 9) / 5 + 32)
  }

  return temp
}
</script>

<template>
  <article class="weather-card" :class="{ selected: isSelected, favorite: isFavorite }" @click="selectCard(cityItem)">
    <div v-if="(cityItem.weatherType || cityItem.status) === '맑음'" class="weather-background sunny-background">
      <span class="sun-orbit"></span>
    </div>
    <div v-else-if="(cityItem.weatherType || cityItem.status) === '구름' || (cityItem.weatherType || cityItem.status) === '흐림'" class="weather-background cloudy-background"></div>
    <div v-else-if="(cityItem.weatherType || cityItem.status) === '비'" class="weather-background rainy-background">
      <span class="rain-layer rain-far"></span>
      <span class="rain-layer rain-middle"></span>
      <span class="rain-layer rain-near"></span>
    </div>
    <div v-else-if="(cityItem.weatherType || cityItem.status) === '눈'" class="weather-background snowy-background"></div>

    <div class="card-top">
      <span v-if="cityItem.area" class="area-tag">{{ cityItem.area }}</span>
      <button class="favorite-button" :class="{ active: isFavorite }" @click.stop="toggleFavorite(cityItem.name)">{{ isFavorite ? '즐겨찾기 해제' : '즐겨찾기' }}</button>
    </div>

    <div class="card-main">
      <div>
        <span v-if="cityItem.area === '해외'" class="flag">{{ cityItem.flag }}</span>
        <h4>{{ cityItem.name }}</h4>
        <p class="weather-status">{{ cityItem.description || cityItem.status }}</p>
      </div>
      <strong class="temperature">{{ displayTemp(cityItem.temp) }}<small>°{{ displayAsFahrenheit ? 'F' : 'C' }}</small></strong>
    </div>

    <div class="weather-info">
      <span>체감 {{ displayTemp(cityItem.feels === undefined ? cityItem.temp : cityItem.feels) }}°</span>
      <span>습도 {{ cityItem.humidity || '-' }}%</span>
    </div>

    <div class="card-footer">
      <span v-if="cityItem.temp >= 25" class="badge hot">더움 · 25도 이상</span>
      <span v-else class="badge cool">선선함 · 25도 미만</span>
      <button class="btn-detail" @click.stop="clickDetail(cityItem)">상세보기</button>
    </div>
  </article>
</template>

<style scoped>
.weather-card {
  min-height: 235px;
  box-sizing: border-box;
  padding: 18px;
  border: 1px solid #d9e5ed;
  border-radius: 16px;
  background: linear-gradient(145deg, #fff, #f8fbfc);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  box-shadow: 0 5px 14px rgba(26, 62, 87, 0.06);
  transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
}

.weather-card:hover {
  transform: translateY(-4px);
  border-color: #8bcfd0;
  box-shadow: 0 14px 28px rgba(26, 62, 87, 0.14);
}

.weather-card.selected {
  border: 2px solid #008f91;
  box-shadow: 0 10px 22px rgba(0, 143, 145, 0.16);
}

.weather-card.favorite {
  border-color: #69bfc1;
}

.card-top,
.card-main,
.weather-info,
.card-footer {
  position: relative;
  z-index: 1;
}

.card-top,
.card-main,
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.area-tag {
  padding: 5px 9px;
  border-radius: 12px;
  background: #edf4f7;
  color: #527087;
  font-size: 12px;
  font-weight: bold;
}

.favorite-button {
  padding: 5px 9px;
  border: 1px solid #c7d7df;
  border-radius: 12px;
  background: #fff;
  color: #587087;
  font-size: 12px;
  cursor: pointer;
}

.favorite-button.active {
  border-color: #008f91;
  background: #008f91;
  color: #fff;
}

.card-main {
  margin: 18px 0;
  align-items: flex-end;
}

.weather-card h4 {
  display: inline-block;
  margin: 0;
  color: #17324d;
  font-size: 24px;
}

.weather-status {
  margin: 6px 0 0;
  color: #587087;
  font-size: 14px;
}

.flag {
  margin-right: 8px;
  font-size: 25px;
  vertical-align: -3px;
}

.temperature {
  color: #17324d;
  font-size: 42px;
  line-height: 1;
}

.temperature small {
  font-size: 17px;
}

.weather-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 11px 0;
  border-top: 1px solid #e1eaef;
  border-bottom: 1px solid #e1eaef;
  color: #587087;
  font-size: 13px;
}

.card-footer {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 15px;
}

.weather-background {
  position: absolute;
  inset: 0;
  opacity: 0.22;
  pointer-events: none;
  background-position: center;
  background-size: cover;
  filter: saturate(0.9);
  transform: scale(1.02);
  transition: opacity 0.4s ease, filter 0.4s ease;
}

.weather-card:hover .weather-background {
  opacity: 0.7;
  animation-play-state: running;
}

.weather-background::after {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.weather-card:hover .weather-background::after {
  opacity: 1;
}

.sunny-background {
  background-image: url('../../assets/weather/card-sunny.png');
  background-position: 82% 56%;
  background-size: 125%;
  animation: sunny-sky 5s ease-in-out infinite alternate;
  animation-play-state: paused;
}

.sunny-background::after {
  background:
    radial-gradient(circle at 82% 20%, rgba(255, 245, 191, 0.72), transparent 25%),
    linear-gradient(120deg, transparent 56%, rgba(255, 249, 212, 0.34), transparent 78%);
  animation: sunlight 2.4s ease-in-out infinite alternate;
  animation-play-state: paused;
}

.sun-orbit {
  position: absolute;
  top: -42px;
  right: -92px;
  width: 146px;
  height: 146px;
  opacity: 0;
  background-image: url('../../assets/weather/card-sun-orbit.png');
  background-position: center;
  background-size: contain;
  background-repeat: no-repeat;
  mix-blend-mode: screen;
  transform: translate(0, 150px) scale(0.7);
}

.weather-card:hover .sun-orbit {
  animation: sun-arc 4.6s cubic-bezier(0.35, 0, 0.65, 1) infinite;
}

.cloudy-background {
  background-image: url('../../assets/weather/card-cloudy.png');
  animation: cloudy-sky 9s ease-in-out infinite alternate;
  animation-play-state: paused;
}

.rainy-background {
  background-image: url('../../assets/weather/card-rainy.png');
  animation: rainy-sky 5s ease-in-out infinite alternate;
  animation-play-state: paused;
}

.rain-layer {
  position: absolute;
  inset: -100px 0;
  opacity: 0;
  background-repeat: repeat;
  filter: blur(0.3px);
  transition: opacity 0.35s ease;
  animation-play-state: paused;
}

.rain-far {
  background-image: repeating-linear-gradient(107deg, transparent 0 38px, rgba(221, 239, 250, 0.42) 39px 39.7px, transparent 40.5px 82px);
  background-size: 240px 260px;
  animation: rain-far 2.1s linear infinite;
}

.rain-middle {
  background-image: repeating-linear-gradient(107deg, transparent 0 28px, rgba(228, 243, 252, 0.48) 29px 30px, transparent 31px 66px);
  background-size: 180px 210px;
  animation: rain-middle 1.35s linear infinite;
}

.rain-near {
  background-image: repeating-linear-gradient(107deg, transparent 0 48px, rgba(244, 250, 255, 0.5) 49px 50px, transparent 51px 105px);
  background-size: 310px 320px;
  animation: rain-near 0.95s linear infinite;
}

.weather-card:hover .rain-layer {
  opacity: 0.18;
  animation-play-state: running;
}

.snowy-background {
  background-image: url('../../assets/weather/card-snowy.png');
  animation: snowy-sky 8s ease-in-out infinite alternate;
  animation-play-state: paused;
}

.snowy-background::after {
  background-image:
    radial-gradient(circle, rgba(255, 255, 255, 0.92) 0 2px, transparent 3px),
    radial-gradient(circle, rgba(255, 255, 255, 0.72) 0 3px, transparent 4px);
  background-position: 0 0, 32px -34px;
  background-size: 48px 54px, 76px 82px;
  animation: snow-fall 2.5s linear infinite;
  animation-play-state: paused;
}

.badge {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  box-sizing: border-box;
  padding: 6px 10px;
  border-radius: 7px;
  color: #fff;
  font-size: 12px;
}

.hot {
  background-color: #fb715e;
}

.cool {
  background-color: #4d9bef;
}

.btn-detail {
  position: static;
  width: 100%;
  min-height: 36px;
  padding: 7px 12px;
  border: 1px solid #aebfcb;
  border-radius: 7px;
  background: #fff;
  color: #284660;
  cursor: pointer;
  font-weight: bold;
}

.btn-detail:hover {
  border-color: #008f91;
  background: #f0fbfb;
  color: #007477;
}

@keyframes sunny-sky {
  from {
    background-position: 86% 60%;
    filter: saturate(0.88) brightness(0.95);
    transform: scale(1.03);
  }
  to {
    background-position: 67% 43%;
    filter: saturate(1.1) brightness(1.12);
    transform: scale(1.08);
  }
}

@keyframes cloudy-sky {
  from {
    background-position: 45% center;
    transform: scale(1.02);
  }
  to {
    background-position: 55% center;
    transform: scale(1.06);
  }
}

@keyframes rainy-sky {
  from {
    background-position: 45% center;
    filter: saturate(0.85) brightness(0.98);
    transform: scale(1.02);
  }
  to {
    background-position: 55% center;
    filter: saturate(1) brightness(0.92);
    transform: scale(1.06);
  }
}

@keyframes snowy-sky {
  from {
    background-position: 45% center;
    transform: scale(1.02);
  }
  to {
    background-position: 55% center;
    transform: scale(1.06);
  }
}

@keyframes sunlight {
  from {
    filter: brightness(0.88);
    opacity: 0.45;
    transform: translateX(8%) translateY(5%) scale(0.9);
  }
  to {
    filter: brightness(1.2);
    opacity: 0.9;
    transform: translateX(-8%) translateY(-4%) scale(1.12);
  }
}

@keyframes sun-arc {
  0% {
    opacity: 0;
    transform: translate(0, 150px) scale(0.7);
  }
  12% {
    opacity: 0.45;
  }
  52% {
    opacity: 0.82;
    transform: translate(-210px, -84px) scale(1);
  }
  86% {
    opacity: 0.5;
    transform: translate(-420px, 108px) scale(0.76);
  }
  100% {
    opacity: 0;
    transform: translate(-450px, 145px) scale(0.68);
  }
}

@keyframes rain-far {
  from {
    background-position: 0 -260px;
  }
  to {
    background-position: -42px 260px;
  }
}

@keyframes rain-middle {
  from {
    background-position: 0 -210px;
  }
  to {
    background-position: -64px 210px;
  }
}

@keyframes rain-near {
  from {
    background-position: 0 -320px;
  }
  to {
    background-position: -92px 320px;
  }
}

@keyframes snow-fall {
  from {
    background-position: 0 -54px, 32px -116px;
  }
  to {
    background-position: 20px 54px, 8px -4px;
  }
}

.weather-card:hover .sunny-background::after,
.weather-card:hover .snowy-background::after {
  animation-play-state: running;
}
</style>
