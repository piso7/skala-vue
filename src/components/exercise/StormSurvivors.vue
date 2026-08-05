<script setup>
// 사람마다 높이와 속도를 다르게 두어 한 줄로 반복되는 느낌을 줄였다.
const swimmers = [
  { id: 1, direction: 'right', lane: 'lane-front', delay: '-2.8s', duration: '10.5s', scale: 1.08, shirt: '#f15b4f', skin: '#d49a70' },
  { id: 2, direction: 'left', lane: 'lane-middle', delay: '-7.1s', duration: '13.8s', scale: 0.86, shirt: '#f2b84b', skin: '#b97852' },
  { id: 3, direction: 'right', lane: 'lane-back', delay: '-10.4s', duration: '16.5s', scale: 0.7, shirt: '#38a5a8', skin: '#e0ad82' },
  { id: 4, direction: 'left', lane: 'lane-front', delay: '-5.9s', duration: '11.7s', scale: 1, shirt: '#ec704f', skin: '#8f5f45' },
  { id: 5, direction: 'right', lane: 'lane-middle', delay: '-13.2s', duration: '14.6s', scale: 0.82, shirt: '#e9c65c', skin: '#c88d65' },
  { id: 6, direction: 'left', lane: 'lane-back', delay: '-1.4s', duration: '17.2s', scale: 0.68, shirt: '#d9545d', skin: '#d8a27a' },
]

// 잔해는 사람보다 느리게 흘려 물살의 깊이감을 만든다.
const debrisItems = [
  { id: 1, type: 'plank', top: '12%', delay: '-8s', duration: '20s' },
  { id: 2, type: 'bottle', top: '31%', delay: '-2s', duration: '24s' },
  { id: 3, type: 'crate', top: '47%', delay: '-14s', duration: '28s' },
  { id: 4, type: 'plank small', top: '66%', delay: '-17s', duration: '23s' },
]
</script>

<template>
  <div class="storm-survivors" aria-hidden="true">
    <div class="storm-shade"></div>

    <div class="storm-clouds cloud-layer-back"></div>
    <div class="storm-clouds cloud-layer-front"></div>

    <!-- 굵기와 속도가 다른 두 빗줄기를 겹쳐 폭우를 표현한다. -->
    <div class="rain rain-far"></div>
    <div class="rain rain-near"></div>

    <div class="lightning lightning-one"><i></i><i></i><i></i></div>
    <div class="lightning lightning-two"><i></i><i></i><i></i></div>
    <div class="lightning-flash"></div>

    <div class="distant-water">
      <span></span>
      <span></span>
      <span></span>
    </div>

    <div class="flood-water">
      <div class="water-rim rim-back"></div>
      <div class="water-rim rim-front"></div>
      <div class="water-body"></div>
      <div class="water-current current-one"></div>
      <div class="water-current current-two"></div>

      <div class="debris-field">
        <span
          v-for="item in debrisItems"
          :key="item.id"
          class="debris"
          :class="item.type"
          :style="{ '--top': item.top, '--delay': item.delay, '--duration': item.duration }"
        >
          <i></i>
        </span>
      </div>

      <div class="rescue-buoy">
        <span class="buoy-rope"></span>
        <span class="buoy-ring"></span>
      </div>

      <div class="swimmer-field">
        <div
          v-for="swimmer in swimmers"
          :key="swimmer.id"
          class="swimmer"
          :class="[`to-${swimmer.direction}`, swimmer.lane, `swimmer-${swimmer.id}`]"
          :style="{
            '--delay': swimmer.delay,
            '--duration': swimmer.duration,
            '--scale': swimmer.scale,
            '--shirt': swimmer.shirt,
            '--skin': swimmer.skin,
          }"
        >
          <div class="swimmer-direction">
            <span class="swimmer-wake wake-back"></span>
            <span class="swimmer-wake wake-front"></span>

            <!-- 팔과 다리를 나누어 실제 수영 동작처럼 교차시킨다. -->
            <div class="swimmer-body">
              <span class="swimmer-head"><i></i></span>
              <span class="swimmer-neck"></span>
              <span class="swimmer-torso"></span>
              <span class="swimmer-arm arm-back"><i></i></span>
              <span class="swimmer-arm arm-front"><i></i></span>
              <span class="swimmer-leg leg-back"><i></i></span>
              <span class="swimmer-leg leg-front"><i></i></span>
            </div>

            <span class="splash splash-one"></span>
            <span class="splash splash-two"></span>
            <span class="splash splash-three"></span>
          </div>
        </div>
      </div>

      <div class="rain-impact impact-one"></div>
      <div class="rain-impact impact-two"></div>
    </div>

    <div class="storm-vignette"></div>
  </div>
</template>

<style scoped>
.storm-survivors {
  position: fixed;
  z-index: 3;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  isolation: isolate;
}

.storm-shade {
  position: absolute;
  z-index: 0;
  inset: 0;
  background:
    radial-gradient(circle at 50% 38%, rgba(48, 89, 110, 0.15), transparent 42%),
    linear-gradient(180deg, rgba(7, 17, 27, 0.76), rgba(6, 28, 39, 0.48) 47%, rgba(3, 27, 39, 0.2));
  animation: storm-breathe 4.8s ease-in-out infinite alternate;
}

.storm-clouds {
  position: absolute;
  right: -18%;
  left: -18%;
  border-radius: 50%;
  filter: blur(18px);
}

.cloud-layer-back {
  z-index: 1;
  top: -19%;
  height: 36%;
  background:
    radial-gradient(ellipse at 12% 70%, #273b48 0 12%, transparent 29%),
    radial-gradient(ellipse at 35% 61%, #1f3542 0 17%, transparent 34%),
    radial-gradient(ellipse at 60% 73%, #263e4b 0 18%, transparent 35%),
    radial-gradient(ellipse at 87% 57%, #172c38 0 18%, transparent 36%);
  opacity: 0.88;
  animation: cloud-drift-back 18s ease-in-out infinite alternate;
}

.cloud-layer-front {
  z-index: 2;
  top: -13%;
  height: 31%;
  background:
    radial-gradient(ellipse at 4% 54%, #111f29 0 13%, transparent 28%),
    radial-gradient(ellipse at 29% 49%, #1b2b34 0 19%, transparent 35%),
    radial-gradient(ellipse at 53% 57%, #10232e 0 17%, transparent 33%),
    radial-gradient(ellipse at 78% 43%, #1b2d37 0 19%, transparent 36%),
    radial-gradient(ellipse at 98% 62%, #10242f 0 16%, transparent 32%);
  opacity: 0.96;
  animation: cloud-drift-front 12s ease-in-out infinite alternate;
}

.rain {
  position: absolute;
  z-index: 7;
  inset: -35% -15% -25%;
  transform: skewX(-12deg);
  transform-origin: center;
}

.rain-far {
  background-image: repeating-linear-gradient(
    101deg,
    transparent 0,
    transparent 18px,
    rgba(166, 216, 235, 0.32) 19px,
    transparent 21px,
    transparent 38px
  );
  background-size: 46px 58px;
  opacity: 0.56;
  animation: rain-fall-far 0.48s linear infinite;
}

.rain-near {
  background-image: repeating-linear-gradient(
    101deg,
    transparent 0,
    transparent 47px,
    rgba(211, 239, 249, 0.58) 49px,
    rgba(211, 239, 249, 0.13) 51px,
    transparent 54px,
    transparent 78px
  );
  background-size: 82px 116px;
  filter: blur(0.35px);
  opacity: 0.7;
  animation: rain-fall-near 0.31s linear infinite;
}

.lightning {
  position: absolute;
  z-index: 4;
  top: 3%;
  width: 95px;
  height: 48%;
  opacity: 0;
  filter: drop-shadow(0 0 9px #cceeff) drop-shadow(0 0 24px rgba(155, 219, 255, 0.75));
}

.lightning i {
  position: absolute;
  display: block;
  width: 5px;
  border-radius: 999px;
  background: linear-gradient(180deg, #f4fdff, #a8d9f0);
  transform-origin: top center;
}

.lightning i:nth-child(1) {
  top: 0;
  left: 54px;
  height: 38%;
  transform: rotate(13deg);
}

.lightning i:nth-child(2) {
  top: 35%;
  left: 38px;
  height: 34%;
  transform: rotate(-17deg);
}

.lightning i:nth-child(3) {
  top: 65%;
  left: 51px;
  height: 37%;
  transform: rotate(18deg);
}

.lightning-one {
  left: 17%;
  animation: lightning-strike-one 7.8s steps(1, end) infinite;
}

.lightning-two {
  right: 16%;
  transform: scale(0.72) rotate(8deg);
  animation: lightning-strike-two 10.2s 3.4s steps(1, end) infinite;
}

.lightning-flash {
  position: absolute;
  z-index: 3;
  inset: 0;
  background: rgba(197, 229, 244, 0.44);
  opacity: 0;
  mix-blend-mode: screen;
  animation: sky-flash 7.8s steps(1, end) infinite;
}

.distant-water {
  position: absolute;
  z-index: 4;
  right: -8%;
  bottom: 37%;
  left: -8%;
  height: 12%;
  opacity: 0.62;
}

.distant-water span {
  position: absolute;
  right: 0;
  left: 0;
  height: 42%;
  border-top: 3px solid rgba(137, 205, 219, 0.42);
  border-radius: 50%;
  transform: scaleX(1.2);
  animation: distant-wave 3.2s ease-in-out infinite alternate;
}

.distant-water span:nth-child(2) {
  top: 34%;
  animation-delay: -1.4s;
}

.distant-water span:nth-child(3) {
  top: 69%;
  animation-delay: -2.2s;
}

.flood-water {
  position: absolute;
  z-index: 5;
  right: 0;
  bottom: 0;
  left: 0;
  height: 49%;
  animation: water-rise 2.8s cubic-bezier(0.22, 0.72, 0.22, 1) both;
}

.water-rim {
  position: absolute;
  right: -8%;
  left: -8%;
  border-radius: 50%;
}

.rim-back {
  z-index: 1;
  top: -4%;
  height: 18%;
  border-top: 10px solid rgba(128, 196, 208, 0.78);
  background: rgba(36, 108, 126, 0.48);
  filter: blur(1.2px);
  animation: water-rim-back 3.8s ease-in-out infinite alternate;
}

.rim-front {
  z-index: 8;
  top: -1%;
  height: 13%;
  border-top: 5px solid rgba(188, 231, 237, 0.8);
  box-shadow: 0 -5px 22px rgba(111, 201, 219, 0.34);
  opacity: 0.8;
  animation: water-rim-front 2.5s ease-in-out infinite alternate;
}

.water-body {
  position: absolute;
  z-index: 0;
  inset: 3% 0 0;
  background:
    radial-gradient(ellipse at 22% 8%, rgba(176, 227, 234, 0.32), transparent 19%),
    radial-gradient(ellipse at 72% 20%, rgba(92, 171, 188, 0.25), transparent 24%),
    linear-gradient(180deg, rgba(34, 124, 145, 0.9), rgba(12, 73, 93, 0.96) 46%, #083c54);
  box-shadow: inset 0 24px 45px rgba(132, 216, 225, 0.18);
}

.water-body::after {
  position: absolute;
  inset: 0;
  background-image:
    repeating-radial-gradient(ellipse at 35% 10%, transparent 0 26px, rgba(151, 216, 226, 0.12) 27px 29px, transparent 30px 66px),
    linear-gradient(100deg, transparent 30%, rgba(194, 235, 239, 0.08) 48%, transparent 65%);
  background-size: 220px 76px, 170% 100%;
  content: '';
  animation: underwater-drift 7s linear infinite;
}

.water-current {
  position: absolute;
  z-index: 2;
  right: -20%;
  left: -20%;
  height: 18px;
  border-top: 2px solid rgba(169, 224, 230, 0.44);
  border-radius: 50%;
  opacity: 0.75;
}

.current-one {
  top: 34%;
  animation: current-flow 5.2s linear infinite;
}

.current-two {
  top: 69%;
  transform: scaleX(0.8);
  animation: current-flow 6.8s -3s linear infinite reverse;
}

.debris-field,
.swimmer-field {
  position: absolute;
  z-index: 4;
  inset: 0;
  overflow: hidden;
}

.debris {
  position: absolute;
  top: var(--top);
  left: -130px;
  display: block;
  animation: debris-drift var(--duration) var(--delay) linear infinite;
}

.debris i {
  display: block;
  animation: debris-bob 1.8s ease-in-out infinite alternate;
}

.debris.plank i {
  width: 104px;
  height: 14px;
  border: 2px solid #543a26;
  border-radius: 4px 9px 5px 3px;
  background:
    linear-gradient(90deg, transparent 48%, rgba(59, 36, 22, 0.65) 50% 52%, transparent 54%),
    linear-gradient(#a77949, #78502f);
  box-shadow: 0 6px 8px rgba(2, 31, 42, 0.35);
  transform: rotate(-7deg);
}

.debris.plank.small i {
  width: 68px;
  transform: rotate(11deg);
}

.debris.bottle i {
  width: 18px;
  height: 43px;
  border: 2px solid rgba(184, 225, 213, 0.76);
  border-radius: 4px 4px 9px 9px;
  background: rgba(82, 153, 138, 0.42);
  box-shadow: inset 4px 0 rgba(216, 246, 236, 0.2);
  transform: rotate(67deg);
}

.debris.bottle i::before {
  position: absolute;
  top: -7px;
  left: 3px;
  width: 8px;
  height: 7px;
  border-radius: 2px 2px 0 0;
  background: #d6d4bd;
  content: '';
}

.debris.crate i {
  width: 54px;
  height: 42px;
  border: 4px solid #573b26;
  background:
    linear-gradient(45deg, transparent 45%, #604027 47% 53%, transparent 55%),
    linear-gradient(-45deg, transparent 45%, #604027 47% 53%, transparent 55%),
    #93643b;
  box-shadow: 0 8px 10px rgba(2, 31, 42, 0.42);
  transform: rotate(8deg);
}

.rescue-buoy {
  position: absolute;
  z-index: 5;
  right: 8%;
  top: 21%;
  width: 100px;
  height: 68px;
  animation: buoy-float 2.2s ease-in-out infinite alternate;
}

.buoy-ring {
  position: absolute;
  z-index: 2;
  top: 0;
  left: 18px;
  width: 50px;
  height: 50px;
  border: 11px solid #ee654c;
  border-radius: 50%;
  background: rgba(230, 247, 244, 0.3);
  box-shadow:
    inset 0 0 0 2px rgba(255, 255, 255, 0.52),
    0 8px 12px rgba(2, 31, 42, 0.42);
  transform: rotateX(58deg) rotateZ(-9deg);
}

.buoy-ring::before,
.buoy-ring::after {
  position: absolute;
  top: -10px;
  width: 13px;
  height: 50px;
  background: #f7e9d3;
  content: '';
}

.buoy-ring::before {
  left: 7px;
}

.buoy-ring::after {
  right: 7px;
}

.buoy-rope {
  position: absolute;
  z-index: 1;
  top: 35px;
  left: 0;
  width: 96px;
  height: 25px;
  border-bottom: 3px solid #d7c18e;
  border-radius: 50%;
  transform: rotate(7deg);
}

.swimmer {
  position: absolute;
  width: 142px;
  height: 102px;
  animation-duration: var(--duration);
  animation-delay: var(--delay);
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

.swimmer.to-right {
  left: -190px;
  animation-name: swim-to-right;
}

.swimmer.to-left {
  right: -190px;
  animation-name: swim-to-left;
}

.lane-front {
  z-index: 6;
  top: 40%;
}

.lane-middle {
  z-index: 4;
  top: 21%;
  opacity: 0.9;
}

.lane-back {
  z-index: 2;
  top: 7%;
  opacity: 0.72;
  filter: saturate(0.72);
}

.swimmer-direction {
  position: relative;
  width: 142px;
  height: 102px;
  transform: scale(var(--scale));
  transform-origin: center bottom;
}

.to-left .swimmer-direction {
  transform: scaleX(-1) scale(var(--scale));
}

.swimmer-body {
  position: absolute;
  z-index: 4;
  right: 20px;
  bottom: 17px;
  width: 105px;
  height: 68px;
  transform: rotate(-4deg);
  transform-origin: 70% 70%;
  animation: swimmer-bob 0.9s ease-in-out infinite alternate;
}

.swimmer-head {
  position: absolute;
  z-index: 7;
  top: 2px;
  right: 1px;
  width: 25px;
  height: 28px;
  border-radius: 48% 52% 43% 45%;
  background: var(--skin);
  box-shadow: inset -4px -2px rgba(91, 56, 42, 0.23);
}

.swimmer-head::before {
  position: absolute;
  top: -5px;
  right: 1px;
  left: 0;
  height: 12px;
  border-radius: 60% 68% 30% 20%;
  background: #202328;
  content: '';
}

.swimmer-head::after {
  position: absolute;
  top: 13px;
  right: -2px;
  width: 5px;
  height: 3px;
  border-radius: 50%;
  background: #302722;
  content: '';
}

.swimmer-head i {
  position: absolute;
  top: 9px;
  right: 5px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #202328;
}

.swimmer-neck {
  position: absolute;
  z-index: 4;
  top: 24px;
  right: 22px;
  width: 13px;
  height: 14px;
  border-radius: 5px;
  background: var(--skin);
  transform: rotate(26deg);
}

.swimmer-torso {
  position: absolute;
  z-index: 3;
  top: 25px;
  right: 27px;
  width: 58px;
  height: 28px;
  border-radius: 18px 12px 10px 18px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--shirt), white 8%), var(--shirt));
  box-shadow: inset 0 -5px rgba(11, 56, 67, 0.18);
  transform: rotate(4deg);
}

.swimmer-torso::after {
  position: absolute;
  bottom: -2px;
  left: -17px;
  width: 25px;
  height: 24px;
  border-radius: 50% 6px 9px 50%;
  background: #303944;
  content: '';
}

.swimmer-arm,
.swimmer-arm i,
.swimmer-leg,
.swimmer-leg i {
  position: absolute;
  display: block;
  border-radius: 999px;
  background: var(--skin);
  transform-origin: 5px 5px;
}

.swimmer-arm {
  z-index: 5;
  top: 29px;
  right: 65px;
  width: 10px;
  height: 38px;
}

.swimmer-arm i {
  top: 30px;
  left: 0;
  width: 9px;
  height: 35px;
}

.arm-front {
  animation: arm-stroke-front 1.08s cubic-bezier(0.46, 0, 0.54, 1) infinite;
}

.arm-front i {
  transform: rotate(-22deg);
}

.arm-back {
  z-index: 1;
  filter: brightness(0.78);
  animation: arm-stroke-back 1.08s -0.54s cubic-bezier(0.46, 0, 0.54, 1) infinite;
}

.arm-back i {
  transform: rotate(26deg);
}

.swimmer-leg {
  z-index: 2;
  top: 40px;
  left: 6px;
  width: 11px;
  height: 40px;
  background: #303944;
  transform-origin: 6px 5px;
}

.swimmer-leg i {
  top: 32px;
  left: 1px;
  width: 9px;
  height: 37px;
}

.leg-front {
  animation: leg-kick-front 0.72s ease-in-out infinite alternate;
}

.leg-back {
  z-index: 1;
  filter: brightness(0.72);
  animation: leg-kick-back 0.72s -0.36s ease-in-out infinite alternate;
}

.swimmer-wake {
  position: absolute;
  z-index: 2;
  right: 7px;
  bottom: 13px;
  width: 130px;
  height: 24px;
  border-top: 4px solid rgba(210, 243, 246, 0.78);
  border-radius: 50%;
  transform: rotate(-2deg);
}

.wake-back {
  right: 63px;
  width: 92px;
  opacity: 0.48;
  animation: wake-stretch 0.82s ease-in-out infinite alternate;
}

.wake-front {
  z-index: 8;
  right: 0;
  bottom: 7px;
  width: 108px;
  border-top-width: 3px;
  opacity: 0.72;
}

.splash {
  position: absolute;
  z-index: 9;
  right: 62px;
  bottom: 26px;
  width: 8px;
  height: 8px;
  border: 3px solid rgba(222, 247, 249, 0.86);
  border-right-color: transparent;
  border-bottom-color: transparent;
  border-radius: 50%;
  opacity: 0;
  animation: swimmer-splash 1.08s ease-out infinite;
}

.splash-two {
  right: 47px;
  animation-delay: -0.34s;
}

.splash-three {
  right: 81px;
  animation-delay: -0.71s;
}

.swimmer-2 .swimmer-body,
.swimmer-5 .swimmer-body {
  animation-delay: -0.45s;
}

.swimmer-3 .swimmer-body,
.swimmer-6 .swimmer-body {
  animation-delay: -0.72s;
}

.rain-impact {
  position: absolute;
  z-index: 9;
  inset: 0;
  background-image: radial-gradient(ellipse, transparent 0 38%, rgba(210, 242, 246, 0.72) 42% 48%, transparent 53%);
  background-repeat: repeat;
  opacity: 0.66;
}

.impact-one {
  background-position: 12px 6px;
  background-size: 87px 26px;
  animation: rain-ripples 0.72s steps(3, end) infinite;
}

.impact-two {
  background-position: 54px 17px;
  background-size: 139px 38px;
  opacity: 0.35;
  animation: rain-ripples 1.1s -0.38s steps(3, end) infinite;
}

.storm-vignette {
  position: absolute;
  z-index: 12;
  inset: 0;
  box-shadow:
    inset 0 0 16vw rgba(0, 8, 17, 0.7),
    inset 0 -8vh 12vh rgba(0, 21, 31, 0.32);
}

@keyframes storm-breathe {
  to { opacity: 0.86; }
}

@keyframes cloud-drift-back {
  from { transform: translateX(-2%) scale(1); }
  to { transform: translateX(4%) scale(1.05); }
}

@keyframes cloud-drift-front {
  from { transform: translateX(3%) scale(1.04); }
  to { transform: translateX(-4%) scale(0.98); }
}

@keyframes rain-fall-far {
  from { background-position: 0 0; }
  to { background-position: -19px 116px; }
}

@keyframes rain-fall-near {
  from { background-position: 0 0; }
  to { background-position: -28px 232px; }
}

@keyframes lightning-strike-one {
  0%, 7%, 9%, 12%, 100% { opacity: 0; }
  7.5%, 9.5%, 10.5% { opacity: 0.95; }
}

@keyframes lightning-strike-two {
  0%, 62%, 64%, 67%, 100% { opacity: 0; }
  62.5%, 64.5%, 65.5% { opacity: 0.78; }
}

@keyframes sky-flash {
  0%, 7%, 9%, 12%, 100% { opacity: 0; }
  7.5% { opacity: 0.5; }
  9.5% { opacity: 0.22; }
  10.5% { opacity: 0.38; }
}

@keyframes distant-wave {
  from { transform: translateX(-2%) scaleX(1.18); }
  to { transform: translateX(2%) scaleX(1.24); }
}

@keyframes water-rise {
  from { transform: translateY(34%); }
  to { transform: translateY(0); }
}

@keyframes water-rim-back {
  from { transform: translate(-2%, 2%) scaleX(1.02); }
  to { transform: translate(2%, -3%) scaleX(1.08); }
}

@keyframes water-rim-front {
  from { transform: translateX(2%) scaleX(1.03); }
  to { transform: translate(-2%, 3%) scaleX(0.98); }
}

@keyframes underwater-drift {
  from { background-position: 0 0, 0 0; }
  to { background-position: 220px 0, 170% 0; }
}

@keyframes current-flow {
  from { transform: translateX(-8%) scaleX(0.94); }
  to { transform: translateX(8%) scaleX(1.08); }
}

@keyframes debris-drift {
  from { transform: translateX(0); }
  to { transform: translateX(calc(100vw + 280px)); }
}

@keyframes debris-bob {
  from { transform: translateY(-4px) rotate(-4deg); }
  to { transform: translateY(7px) rotate(7deg); }
}

@keyframes buoy-float {
  from { transform: translateY(-7px) rotate(-5deg); }
  to { transform: translateY(8px) rotate(6deg); }
}

@keyframes swim-to-right {
  from { transform: translateX(0); }
  to { transform: translateX(calc(100vw + 380px)); }
}

@keyframes swim-to-left {
  from { transform: translateX(0); }
  to { transform: translateX(calc(-100vw - 380px)); }
}

@keyframes swimmer-bob {
  from { transform: translateY(-4px) rotate(-6deg); }
  to { transform: translateY(5px) rotate(2deg); }
}

@keyframes arm-stroke-front {
  0% { transform: rotate(118deg); }
  35% { transform: rotate(32deg); }
  68% { transform: rotate(-72deg); }
  100% { transform: rotate(-242deg); }
}

@keyframes arm-stroke-back {
  0% { transform: rotate(-242deg); }
  35% { transform: rotate(-72deg); }
  68% { transform: rotate(32deg); }
  100% { transform: rotate(118deg); }
}

@keyframes leg-kick-front {
  from { transform: rotate(62deg); }
  to { transform: rotate(105deg); }
}

@keyframes leg-kick-back {
  from { transform: rotate(106deg); }
  to { transform: rotate(52deg); }
}

@keyframes wake-stretch {
  from { transform: scaleX(0.76) rotate(-2deg); opacity: 0.28; }
  to { transform: scaleX(1.1) rotate(-2deg); opacity: 0.72; }
}

@keyframes swimmer-splash {
  0% { transform: translate(0, 4px) scale(0.35); opacity: 0; }
  25% { opacity: 0.9; }
  100% { transform: translate(-19px, -27px) scale(1.3); opacity: 0; }
}

@keyframes rain-ripples {
  from { background-size: 58px 18px; opacity: 0.72; }
  to { background-size: 105px 33px; opacity: 0.18; }
}

@media (max-width: 720px) {
  .flood-water {
    height: 53%;
  }

  .swimmer-direction {
    transform: scale(calc(var(--scale) * 0.78));
  }

  .to-left .swimmer-direction {
    transform: scaleX(-1) scale(calc(var(--scale) * 0.78));
  }

  .rescue-buoy {
    right: 3%;
    transform: scale(0.78);
  }

  .rain-near {
    opacity: 0.55;
  }

  .lightning-one {
    left: 4%;
  }

  .lightning-two {
    right: 2%;
  }
}

@media (max-height: 620px) {
  .flood-water {
    height: 55%;
  }

  .swimmer-direction {
    transform: scale(calc(var(--scale) * 0.72));
  }

  .to-left .swimmer-direction {
    transform: scaleX(-1) scale(calc(var(--scale) * 0.72));
  }
}

@media (prefers-reduced-motion: reduce) {
  .storm-survivors *,
  .storm-survivors *::before,
  .storm-survivors *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
  }
}
</style>
