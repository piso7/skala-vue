<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { weatherCities } from '../data/weatherCities'

const route = useRoute()
const router = useRouter()

// 주소의 cityId와 같은 도시를 기본 날씨 목록에서 찾는다.
const cityData = computed(() => {
  return weatherCities.find((item) => item.id === route.params.cityId)
})

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="router-detail-container">
    <p class="detail-label">ROUTER CITY DETAIL</p>
    <h3>지역별 상세 날씨</h3>

    <div v-if="cityData" class="router-info-card">
      <span>지정 지역</span>
      <h4>{{ cityData.fullName }}</h4>
      <strong>{{ cityData.temp }}°C</strong>
      <p>현재 날씨 · {{ cityData.status }}</p>

      <div class="router-detail-grid">
        <div>체감 온도 <b>{{ cityData.feels }}°C</b></div>
        <div>대기 습도 <b>{{ cityData.humidity }}%</b></div>
      </div>
    </div>

    <p v-else class="empty-message">해당 지역의 상세 데이터가 없습니다.</p>
    <button class="back-btn" @click="goHome">대시보드로 돌아가기</button>
  </div>
</template>

<style scoped>
.router-detail-container {
  max-width: 720px;
  margin: 0 auto;
  padding: 28px;
  border: 1px solid #dce7ee;
  border-radius: 16px;
  background: #fff;
}

.detail-label {
  margin: 0 0 8px;
  color: #008f91;
  font-size: 12px;
  font-weight: bold;
  letter-spacing: 1.2px;
}

.router-detail-container h3 {
  margin: 0 0 20px;
  color: #17324d;
}

.router-info-card {
  padding: 22px;
  border-radius: 14px;
  background: #f5fbfc;
}

.router-info-card span,
.router-detail-grid {
  color: #587087;
  font-size: 13px;
}

.router-info-card h4 {
  margin: 6px 0;
  color: #17324d;
  font-size: 22px;
}

.router-info-card > strong {
  color: #17324d;
  font-size: 38px;
}

.router-info-card p {
  color: #007477;
  font-weight: bold;
}

.router-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.router-detail-grid div {
  padding: 12px;
  border-radius: 9px;
  background: #fff;
}

.router-detail-grid b {
  display: block;
  margin-top: 5px;
  color: #284660;
}

.back-btn {
  width: 100%;
  margin-top: 18px;
  padding: 11px;
  border: 0;
  border-radius: 8px;
  background: #008f91;
  color: #fff;
  cursor: pointer;
  font-weight: bold;
}
</style>
