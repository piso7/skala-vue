<script setup>
import WeatherMockup from './components/exercise/WeatherMockup.vue'
import WeatherComposition from './components/exercise/WeatherComposition.vue'
import WeatherParent from './components/exercise/WeatherParent.vue'
import UnitToggler from './components/exercise/UnitToggler.vue'
</script>

<template>
  <div class="app-container app-container-task1">
    <h1>⛅ 과제 1: 날씨 (Mockup)</h1>
    <hr />
    <WeatherMockup />
  </div>
  <div class="app-container app-container-task2">
    <h1>⛅ 과제 2: 날씨 (컴포지션)</h1>
    <hr />
    <WeatherComposition />
  </div>
  <div class="app-container app-container-task3">
    <h1>⛅ 과제 3: 날씨 (컴포넌트)</h1>
    <hr />
    <WeatherParent />
  </div>
  <div class="app-container app-container-task4">
    <h1>⛅ 과제 4: 라우터적용</h1>
    <hr />
    <div class="router-dashboard-wrapper">
      <nav class="navigation-bar">
        <!-- RouterLink는 새로고침 없이 주소와 화면을 바꿔 준다. -->
        <RouterLink to="/" class="nav-item">🌦️ 날씨 대시보드</RouterLink>
        <span class="divider">|</span>
        <RouterLink to="/about" class="nav-item">ℹ️ 서비스 소개</RouterLink>
      </nav>
      <main>
        <!-- task4라는 이름의 라우터 컴포넌트만 이 위치에 표시된다. -->
        <RouterView name="task4" />
      </main>
    </div>
  </div>
  <div class="app-container app-container-task5">
    <h1>⛅ 과제 5: 스토어·실시간 날씨 적용</h1>
    <hr />
    <div class="router-dashboard-wrapper">
      <nav class="navigation-bar">
        <RouterLink to="/" class="nav-item">🌦️ 날씨 대시보드</RouterLink>
        <span class="divider">|</span>
        <RouterLink to="/about" class="nav-item">ℹ️ 서비스 소개</RouterLink>
        <span class="live-indicator"><i></i> OpenWeather Live</span>
        <UnitToggler />
      </nav>
      <main>
        <!-- task5 화면을 따로 지정해 과제 4가 실시간 기능의 영향을 받지 않게 한다. -->
        <RouterView name="task5" />
      </main>
    </div>
  </div>
</template>

<style>
/* 과제 화면에서 공통으로 사용하는 스타일을 불러온다. */
@import '@/assets/exercise.css';
</style>
