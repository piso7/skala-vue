<script setup>
defineProps({
  cityItem: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['select-card', 'click-detail'])

const selectCard = (cityItem) => {
  emit('select-card', `${cityItem.name}이 선택되었습니다.`, cityItem.name)
}

const clickDetail = (cityItem) => {
  emit('click-detail', cityItem.name, cityItem.status)
}
</script>

<template>
  <div class="weather-card" @click="selectCard(cityItem)">
    <div v-if="cityItem.status === '맑음'" class="weather-background sunny-background"></div>
    <div v-else-if="cityItem.status === '구름' || cityItem.status === '흐림'" class="weather-background cloudy-background"></div>
    <div v-else-if="cityItem.status === '비'" class="weather-background rainy-background"></div>
    <div v-else-if="cityItem.status === '눈'" class="weather-background snowy-background"></div>

    <span v-if="cityItem.area === '해외'" class="flag">{{ cityItem.flag }}</span>
    <h4>{{ cityItem.name }} ({{ cityItem.status }})</h4>
    <p>현재 기온: {{ cityItem.temp }}°C</p>

    <span v-if="cityItem.temp >= 25" class="badge hot">🔥 더움 (25도 이상)</span>
    <span v-else class="badge cool">❄️ 선선함 (25도 미만)</span>

    <button class="btn-detail" @click.stop="clickDetail(cityItem)">상세보기</button>
  </div>
</template>

<style scoped>
.weather-card {
  min-height: 138px;
  box-sizing: border-box;
  padding: 14px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.weather-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 12px rgba(0, 0, 0, 0.12);
}

.weather-card h4,
.weather-card p,
.badge,
.btn-detail,
.flag {
  position: relative;
  z-index: 1;
}

.weather-card h4 {
  margin: 0 0 8px;
}

.weather-card p {
  margin: 0 0 10px;
}

.weather-background {
  position: absolute;
  inset: 0;
  clip-path: polygon(58% 0, 100% 0, 100% 100%, 58% 100%, 45% 50%);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
}

.weather-card:hover .weather-background {
  opacity: 0.7;
  animation-play-state: running;
}

.sunny-background {
  background:
    radial-gradient(circle at 85% 18%, rgba(255, 239, 130, 0.95) 0 8%, rgba(255, 210, 70, 0.45) 16%, transparent 34%),
    linear-gradient(135deg, #fffdf4, #fff 58%);
  animation: sunshine 2.5s ease-in-out infinite alternate;
  animation-play-state: paused;
}

.cloudy-background {
  background:
    radial-gradient(ellipse at 82% 18%, rgba(214, 225, 234, 0.9) 0 14%, transparent 15%),
    radial-gradient(ellipse at 64% 28%, rgba(214, 225, 234, 0.9) 0 18%, transparent 19%),
    linear-gradient(135deg, #f6f8fa, #fff 65%);
  background-size: 130% 130%;
  animation: cloudy-sky 4s ease-in-out infinite alternate;
  animation-play-state: paused;
}

.rainy-background {
  background-color: #edf5fb;
  background-image:
    linear-gradient(115deg, transparent 45%, rgba(99, 159, 206, 0.65) 46%, rgba(99, 159, 206, 0.65) 49%, transparent 50%),
    linear-gradient(115deg, transparent 45%, rgba(99, 159, 206, 0.5) 46%, rgba(99, 159, 206, 0.5) 49%, transparent 50%);
  background-position: 0 0, 18px -18px;
  background-size: 32px 38px, 37px 45px;
  animation: rainfall 0.55s linear infinite;
  animation-play-state: paused;
}

.snowy-background {
  background-color: #f3f8fc;
  background-image:
    radial-gradient(circle, rgba(139, 183, 215, 0.9) 0 2px, transparent 3px),
    radial-gradient(circle, rgba(139, 183, 215, 0.65) 0 3px, transparent 4px);
  background-position: 0 0, 17px -22px;
  background-size: 34px 38px, 48px 52px;
  animation: snowfall 2s linear infinite;
  animation-play-state: paused;
}

.flag {
  float: right;
  font-size: 20px;
}

.badge {
  display: inline-block;
  padding: 4px 8px;
  color: #fff;
  font-size: 12px;
  border-radius: 4px;
}

.hot {
  background-color: #ff7675;
}

.cool {
  background-color: #74b9ff;
}

.btn-detail {
  display: block;
  margin-top: 10px;
  padding: 6px 10px;
  border: 1px solid #adb5bd;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
}

@keyframes sunshine {
  from {
    filter: brightness(0.95);
    transform: scale(0.98);
  }
  to {
    filter: brightness(1.15);
    transform: scale(1.04);
  }
}

@keyframes cloudy-sky {
  from {
    background-position: 0 0;
  }
  to {
    background-position: 12px 7px;
  }
}

@keyframes rainfall {
  from {
    background-position: 0 0, 18px -18px;
  }
  to {
    background-position: -12px 38px, 6px 27px;
  }
}

@keyframes snowfall {
  from {
    background-position: 0 0, 17px -22px;
  }
  to {
    background-position: 12px 38px, 29px 30px;
  }
}

</style>
