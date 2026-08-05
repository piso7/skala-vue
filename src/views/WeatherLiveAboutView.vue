<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <section class="live-about">
    <header class="about-hero">
      <div>
        <p>ABOUT WEATHER LAB</p>
        <h2>날씨를 보는 일을<br />조금 더 재미있게</h2>
        <span>Vue 3로 시작해 Router, Pinia, Axios와 실시간 기상 데이터를 차례로 연결한 날씨 대시보드입니다.</span>
      </div>
      <div class="about-signal">
        <i></i>
        <strong>OPENWEATHER LIVE</strong>
        <span>11개 도시 관측 중</span>
      </div>
    </header>

    <div class="about-feature-grid">
      <article>
        <span>01</span>
        <h3>실시간 관측</h3>
        <p>Axios로 불러온 기온, 체감온도, 습도와 풍속을 도시별로 비교합니다.</p>
      </article>
      <article>
        <span>02</span>
        <h3>나만의 도시</h3>
        <p>Pinia에 저장한 즐겨찾기와 섭씨·화씨 설정을 목록과 상세 화면에서 함께 사용합니다.</p>
      </article>
      <article>
        <span>03</span>
        <h3>날씨 인터랙션</h3>
        <p>3D 지구와 폭염·폭풍우 모션으로 숫자만으로는 느끼기 어려운 날씨를 표현합니다.</p>
      </article>
    </div>

    <button class="about-home-button" @click="goHome">대시보드로 돌아가기 <span>→</span></button>
  </section>
</template>

<style scoped>
.live-about {
  color: #eaf5fa;
}

.about-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 30px;
  min-height: 310px;
  box-sizing: border-box;
  padding: 42px 48px;
  border: 1px solid #29475a;
  border-radius: 18px;
  background:
    radial-gradient(circle at 83% 28%, rgba(44, 172, 183, 0.24), transparent 28%),
    linear-gradient(135deg, #081725, #102d3e);
}

.about-hero p {
  margin: 0 0 12px;
  color: #63d5da;
  font-size: 11px;
  font-weight: bold;
  letter-spacing: 2px;
}

.about-hero h2 {
  margin: 0;
  color: #f3fafc;
  font-size: clamp(31px, 4vw, 48px);
  line-height: 1.2;
}

.about-hero > div > span {
  display: block;
  max-width: 600px;
  margin-top: 18px;
  color: #9ab6c7;
  line-height: 1.8;
}

.about-signal {
  display: flex;
  align-items: center;
  flex-direction: column;
  min-width: 170px;
  padding: 24px 20px;
  border: 1px solid rgba(100, 211, 203, 0.28);
  border-radius: 16px;
  background: rgba(7, 30, 38, 0.72);
  text-align: center;
}

.about-signal i {
  width: 12px;
  height: 12px;
  margin-bottom: 13px;
  border-radius: 50%;
  background: #42dda7;
  box-shadow: 0 0 0 7px rgba(66, 221, 167, 0.1), 0 0 20px rgba(66, 221, 167, 0.72);
}

.about-signal strong {
  color: #b8f3e0;
  font-size: 11px;
  letter-spacing: 1px;
}

.about-signal span {
  margin-top: 5px;
  color: #6f9b99;
  font-size: 11px;
}

.about-feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-top: 16px;
}

.about-feature-grid article {
  padding: 25px;
  border: 1px solid #263f50;
  border-radius: 15px;
  background: #0d202e;
}

.about-feature-grid article > span {
  color: #3db7bd;
  font-size: 11px;
  font-weight: bold;
}

.about-feature-grid h3 {
  margin: 12px 0 8px;
  color: #eaf5f9;
}

.about-feature-grid p {
  margin: 0;
  color: #829dad;
  font-size: 13px;
  line-height: 1.7;
}

.about-home-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-top: 16px;
  padding: 15px 18px;
  border: 1px solid #2d8991;
  border-radius: 12px;
  background: #123741;
  color: #b9edf0;
  cursor: pointer;
  font-weight: bold;
}

.about-home-button:hover {
  background: #184852;
}

.about-home-button span {
  font-size: 20px;
}

@media (max-width: 720px) {
  .about-hero {
    align-items: flex-start;
    flex-direction: column;
    padding: 30px 26px;
  }

  .about-signal {
    box-sizing: border-box;
    width: 100%;
  }

  .about-feature-grid {
    grid-template-columns: 1fr;
  }
}
</style>
