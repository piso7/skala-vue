<script setup>
import { ref, provide, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import WeatherMockup from './components/exercise/WeatherMockup.vue'
import WeatherComposition from './components/exercise/WeatherComposition.vue'
import WeatherParent from './components/exercise/WeatherParent.vue'
import UnitToggler from './components/exercise/UnitToggler.vue'

const router = useRouter()
const activeTask = ref(5)
const starlinkRequest = ref(0)

// 상단 버튼의 요청을 과제 5 안쪽의 날씨 컴포넌트까지 전달한다.
provide('starlinkRequest', starlinkRequest)

// 다른 과제로 이동할 때는 상세 주소를 닫고 해당 과제의 첫 화면을 보여 준다.
const openTask = (taskNumber) => {
  activeTask.value = taskNumber

  if (router.currentRoute.value.path !== '/') {
    router.push('/')
  }
}

const openStarlinkTracking = async () => {
  activeTask.value = 5

  if (router.currentRoute.value.path !== '/') {
    await router.push('/')
  }

  await nextTick()
  starlinkRequest.value += 1
}

// 날씨 대시보드는 스타링크 기능을 실행하지 않고 첫 화면으로만 이동한다.
const openWeatherDashboard = async () => {
  activeTask.value = 5
  starlinkRequest.value = 0

  if (router.currentRoute.value.path !== '/') {
    await router.push('/')
  }

  await nextTick()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div class="assignment-shell">
    <header class="assignment-switcher">
      <button class="assignment-brand" type="button" @click="openTask(5)">
        <span>WEATHER LAB</span>
        <strong>Vue 날씨 대시보드</strong>
      </button>

      <nav class="task-tabs" aria-label="과제 화면 선택">
        <button class="final-task-button" :class="{ active: activeTask === 5 }" :aria-pressed="activeTask === 5" @click="openTask(5)">
          <span>현재 과제</span>
          과제 5 · FINAL
        </button>

        <div class="history-tabs">
          <span class="history-label">발전 과정</span>
          <button v-for="taskNumber in 4" :key="taskNumber" :class="{ active: activeTask === taskNumber }" :aria-pressed="activeTask === taskNumber" @click="openTask(taskNumber)">
            과제 {{ taskNumber }}
          </button>
        </div>
      </nav>
    </header>

    <section v-if="activeTask === 5" class="app-container app-container-task5">
      <div class="task-title-row">
        <div>
          <span>FINAL PROJECT</span>
          <h1>⛅ 과제 5: 스토어·실시간 날씨 적용</h1>
        </div>
        <p>OpenWeather · Pinia · Vue Router</p>
      </div>
      <div class="router-dashboard-wrapper">
        <nav class="navigation-bar">
          <RouterLink to="/" class="nav-item" @click.prevent="openWeatherDashboard">🌦️ 날씨 대시보드</RouterLink>
          <span class="divider">|</span>
          <RouterLink to="/about" class="nav-item">ℹ️ 서비스 소개</RouterLink>
          <button class="starlink-nav-button" type="button" @click="openStarlinkTracking">
            <span class="starlink-nav-icon">◈</span>
            <span>
              <small>3D ORBIT</small>
              <strong>스타링크 추적</strong>
            </span>
          </button>
          <span class="live-indicator"><i></i> OpenWeather Live</span>
          <UnitToggler />
        </nav>
        <main>
          <!-- 과제 5는 첫 화면으로 두고 실시간 API 화면을 연결한다. -->
          <RouterView name="task5" :key="$route.name" />
        </main>
      </div>
    </section>

    <section v-else-if="activeTask === 4" class="app-container app-container-task4">
      <h1>⛅ 과제 4: 라우터 적용</h1>
      <hr />
      <div class="router-dashboard-wrapper">
        <nav class="navigation-bar">
          <RouterLink to="/" class="nav-item">🌦️ 날씨 대시보드</RouterLink>
          <span class="divider">|</span>
          <RouterLink to="/about" class="nav-item">ℹ️ 서비스 소개</RouterLink>
        </nav>
        <main>
          <RouterView name="task4" :key="$route.name" />
        </main>
      </div>
    </section>

    <section v-else-if="activeTask === 3" class="app-container app-container-task3">
      <h1>⛅ 과제 3: 날씨 (컴포넌트)</h1>
      <hr />
      <WeatherParent />
    </section>

    <section v-else-if="activeTask === 2" class="app-container app-container-task2">
      <h1>⛅ 과제 2: 날씨 (컴포지션)</h1>
      <hr />
      <WeatherComposition />
    </section>

    <section v-else class="app-container app-container-task1">
      <h1>⛅ 과제 1: 날씨 (Mockup)</h1>
      <hr />
      <WeatherMockup />
    </section>
  </div>
</template>

<style>
@import '@/assets/exercise.css';
</style>
