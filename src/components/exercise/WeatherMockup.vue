<script setup>
import { ref } from 'vue'

// 과제 1에서는 서버 대신 고정된 날씨 목록을 사용한다.
const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, status: '맑음', area: '국내' },
  { id: 'city_02', name: '수원', temp: 24, status: '비', area: '국내' },
  { id: 'city_03', name: '부산', temp: 26, status: '구름', area: '국내' },
  { id: 'city_04', name: '대전', temp: 22, status: '흐림', area: '국내' },
  { id: 'city_05', name: '광주', temp: 30, status: '맑음', area: '국내' },
  { id: 'city_06', name: '제주', temp: 27, status: '비', area: '국내' },
  { id: 'city_07', name: '도쿄', temp: 31, status: '맑음', area: '해외' },
  { id: 'city_08', name: '뉴욕', temp: 19, status: '흐림', area: '해외' },
  { id: 'city_09', name: '파리', temp: 21, status: '구름', area: '해외' },
  { id: 'city_10', name: '시드니', temp: 15, status: '비', area: '해외' },
])

// 검색어와 선택 결과를 화면에 바로 반영하기 위한 상태
const searchQuery = ref('')
const selectedCityInfo = ref('카드를 클릭하거나 검색해 보세요.')
const selectedCity = ref('')
const selectedArea = ref('')

const selectCity = (item) => {
  selectedCity.value = item.name
  selectedArea.value = item.area
  selectedCityInfo.value = `${item.name}의 날씨는 ${item.status}, ${item.temp}°C 입니다.`
}

const showAllCity = () => {
  selectedCity.value = ''
  selectedArea.value = ''
  selectedCityInfo.value = '카드를 클릭하거나 검색해 보세요.'
}

// 상세보기는 과제 1의 범위에 맞춰 간단한 알림창으로 표시한다.
const showDetail = (cityName, status) => {
  window.alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다.`)
}
</script>

<template>
  <div class="dashboard-wrapper">
    <section class="search-box-task1">
      <h3>🔍 도시 검색</h3>
      <!-- input type="text" v-model="searchQuery" placeholder="검색할 도시 이름 입력" / -->
      <input type="text" :value="searchQuery" @input="(e) => (searchQuery = e.target.value)" placeholder="검색할 도시 이름 입력" />
      <p>
        검색 중인 도시: <strong>{{ searchQuery }}</strong>
      </p>
    </section>

    <section class="area-box">
      <h3>📍 지역 선택</h3>



      <div class="area-row">
        <span class="area-label">국내</span>
        <button v-for="item in weatherList" :key="item.id" v-show="item.area === '국내'" class="area-btn" :class="{ on: selectedCity === item.name }" @click="selectCity(item)">
          {{ item.name }}
        </button>
      </div>



      <div class="area-row">
        <span class="area-label">해외</span>
        <button v-for="item in weatherList" :key="item.id" v-show="item.area === '해외'" class="area-btn" :class="{ on: selectedCity === item.name }" @click="selectCity(item)">
          {{ item.name }}
        </button>
      </div>



      <button class="btn-all" @click="showAllCity">전체 보기</button>
    </section>

    <section class="list-box-task1">
      <h3>🏙️ 지역별 날씨 현황</h3>


      <div v-show="selectedArea === '' || selectedArea === '국내'">
        <h4 class="list-title">국내</h4>
        <div class="card-list">
          <div v-for="item in weatherList" :key="item.id" v-show="item.area === '국내' && (selectedCity === '' || selectedCity === item.name)" class="weather-card" @click="selectCity(item)">
            <h4>{{ item.name }} ({{ item.status }})</h4>
            <p>현재 기온: {{ item.temp }}°C</p>

            <span v-if="item.temp >= 25" class="badge hot">🔥 더움 (25도 이상)</span>
            <span v-else class="badge cool">❄️ 선선함 (25도 미만)</span>

            <button class="btn-detail" @click.stop="showDetail(item.name, item.status)">상세보기</button>
          </div>
        </div>
      </div>

      <div v-show="selectedArea === '' || selectedArea === '해외'">
        <h4 class="list-title">해외</h4>
        <div class="card-list">
          <div v-for="item in weatherList" :key="item.id" v-show="item.area === '해외' && (selectedCity === '' || selectedCity === item.name)" class="weather-card" @click="selectCity(item)">
            <h4>{{ item.name }} ({{ item.status }})</h4>
            <p>현재 기온: {{ item.temp }}°C</p>

            <span v-if="item.temp >= 25" class="badge hot">🔥 더움 (25도 이상)</span>
            <span v-else class="badge cool">❄️ 선선함 (25도 미만)</span>

            <button class="btn-detail" @click.stop="showDetail(item.name, item.status)">상세보기</button>
          </div>
        </div>
      </div>
    </section>


    <div class="status-bar">
      {{ selectedCityInfo }}
    </div>
  </div>
</template>
