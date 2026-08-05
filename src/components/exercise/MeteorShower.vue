<template>
  <div class="meteor-shower" aria-hidden="true">
    <!-- 번쩍임은 가장자리에서만 보여 중앙 경고창이 묻히지 않게 한다. -->
    <span class="atmosphere-flash flash-left"></span>
    <span class="atmosphere-flash flash-right"></span>

    <!-- 각 운석은 이동 경로와 속도를 다르게 잡아 같은 장면이 반복되는 느낌을 줄였다. -->
    <span class="meteor meteor-one">
      <i class="meteor-tail"></i>
      <i class="meteor-head"></i>
      <i class="meteor-fragment fragment-one"></i>
      <i class="meteor-fragment fragment-two"></i>
    </span>
    <span class="meteor meteor-two">
      <i class="meteor-tail"></i>
      <i class="meteor-head"></i>
      <i class="meteor-fragment fragment-one"></i>
    </span>
    <span class="meteor meteor-three">
      <i class="meteor-tail"></i>
      <i class="meteor-head"></i>
      <i class="meteor-fragment fragment-one"></i>
      <i class="meteor-fragment fragment-two"></i>
    </span>
    <span class="meteor meteor-four">
      <i class="meteor-tail"></i>
      <i class="meteor-head"></i>
    </span>
    <span class="meteor meteor-five">
      <i class="meteor-tail"></i>
      <i class="meteor-head"></i>
      <i class="meteor-fragment fragment-one"></i>
    </span>
    <span class="meteor meteor-six">
      <i class="meteor-tail"></i>
      <i class="meteor-head"></i>
    </span>

    <!-- 멀리 떨어진 충돌 지점은 불빛과 연기만 남겨 깊이감을 만든다. -->
    <span class="impact impact-left"><i></i></span>
    <span class="impact impact-right"><i></i></span>
  </div>
</template>

<style scoped>
.meteor-shower {
  position: fixed;
  z-index: 3;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  isolation: isolate;
  -webkit-mask-image: radial-gradient(ellipse clamp(180px, 25vw, 360px) clamp(120px, 22vh, 230px) at 50% 48%, transparent 0 68%, rgba(0, 0, 0, 0.34) 86%, #000 100%);
  mask-image: radial-gradient(ellipse clamp(180px, 25vw, 360px) clamp(120px, 22vh, 230px) at 50% 48%, transparent 0 68%, rgba(0, 0, 0, 0.34) 86%, #000 100%);
}

.meteor-shower::before {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 12% 12%, rgba(255, 103, 24, 0.12), transparent 28%),
    radial-gradient(circle at 88% 18%, rgba(255, 41, 9, 0.1), transparent 26%);
  content: '';
  mix-blend-mode: screen;
  animation: sky-breathe 5.6s ease-in-out infinite alternate;
}

.atmosphere-flash {
  position: absolute;
  width: 42vw;
  height: 42vw;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 235, 183, 0.32), rgba(255, 91, 22, 0.12) 28%, transparent 68%);
  filter: blur(16px);
  mix-blend-mode: screen;
  opacity: 0;
}

.flash-left {
  top: -22vw;
  left: -18vw;
  animation: atmosphere-flash 7.4s ease-out 1.2s infinite;
}

.flash-right {
  top: -19vw;
  right: -17vw;
  animation: atmosphere-flash 9.1s ease-out 4.5s infinite;
}

.meteor {
  --meteor-size: 14px;
  --tail-length: 190px;
  --tail-width: 8px;
  --meteor-angle: 42deg;
  --start-x: -24vw;
  --travel-x: 18vw;
  --travel-y: 86vh;
  --meteor-duration: 3.4s;
  --meteor-delay: 0s;
  position: absolute;
  width: var(--meteor-size);
  height: var(--meteor-size);
  transform: translate3d(var(--start-x), -25vh, 0) rotate(var(--meteor-angle));
  animation: meteor-fall var(--meteor-duration) cubic-bezier(0.23, 0.72, 0.44, 1) var(--meteor-delay) infinite;
  will-change: transform, opacity;
}

.meteor-tail {
  position: absolute;
  top: 50%;
  right: 40%;
  width: var(--tail-length);
  height: var(--tail-width);
  border-radius: 100% 0 0 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 76, 20, 0.18) 28%, rgba(255, 174, 62, 0.7) 72%, #fff5cb);
  filter: blur(1px);
  transform: translateY(-50%);
  transform-origin: right center;
  animation: tail-shiver 0.18s ease-in-out infinite alternate;
}

.meteor-tail::before,
.meteor-tail::after {
  position: absolute;
  right: 0;
  border-radius: inherit;
  content: '';
}

.meteor-tail::before {
  top: 50%;
  width: 72%;
  height: 220%;
  background: linear-gradient(90deg, transparent, rgba(255, 49, 12, 0.34), rgba(255, 206, 93, 0.68));
  filter: blur(7px);
  transform: translateY(-50%);
}

.meteor-tail::after {
  top: 38%;
  width: 44%;
  height: 28%;
  background: rgba(255, 255, 227, 0.95);
  box-shadow: -42px 1px 5px rgba(255, 139, 35, 0.72);
}

.meteor-head {
  position: absolute;
  z-index: 2;
  inset: 0;
  border: 1px solid rgba(255, 235, 179, 0.75);
  border-radius: 48% 56% 45% 58%;
  background:
    radial-gradient(circle at 68% 34%, #fff6cf 0 11%, transparent 12%),
    radial-gradient(circle at 35% 65%, #ff7d1c 0 13%, transparent 14%),
    linear-gradient(145deg, #ffcc71 5%, #d63a11 52%, #39100e 100%);
  box-shadow:
    0 0 8px 3px rgba(255, 221, 144, 0.9),
    0 0 24px 10px rgba(255, 74, 20, 0.72),
    0 0 54px 18px rgba(221, 28, 7, 0.32);
  animation: meteor-heat 0.24s ease-in-out infinite alternate;
}

.meteor-fragment {
  position: absolute;
  top: 48%;
  right: calc(var(--meteor-size) + 20px);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #ffd16d;
  box-shadow: 0 0 7px 3px rgba(255, 70, 15, 0.8);
  animation: fragment-flicker 0.48s ease-in-out infinite alternate;
}

.fragment-one {
  transform: translateY(-11px);
}

.fragment-two {
  right: calc(var(--meteor-size) + 54px);
  transform: translateY(10px) scale(0.65);
  animation-delay: -0.22s;
}

.meteor-one {
  --meteor-size: 18px;
  --tail-length: 240px;
  --tail-width: 10px;
  --meteor-angle: 132deg;
  --start-x: 23vw;
  --travel-x: -34vw;
  --travel-y: 92vh;
  --meteor-duration: 4.8s;
  --meteor-delay: -1.1s;
  top: -16vh;
  left: 70vw;
}

.meteor-two {
  --meteor-size: 9px;
  --tail-length: 135px;
  --tail-width: 5px;
  --meteor-angle: 37deg;
  --travel-x: 17vw;
  --travel-y: 76vh;
  --meteor-duration: 3.6s;
  --meteor-delay: -2.7s;
  top: -11vh;
  left: 8vw;
}

.meteor-three {
  --meteor-size: 13px;
  --tail-length: 195px;
  --tail-width: 7px;
  --meteor-angle: 43deg;
  --travel-x: 21vw;
  --travel-y: 88vh;
  --meteor-duration: 5.7s;
  --meteor-delay: -4.3s;
  top: -20vh;
  left: 86vw;
}

.meteor-four {
  --meteor-size: 7px;
  --tail-length: 112px;
  --tail-width: 4px;
  --meteor-angle: 51deg;
  --travel-x: 22vw;
  --travel-y: 66vh;
  --meteor-duration: 3.2s;
  --meteor-delay: -0.4s;
  top: 3vh;
  left: 25vw;
}

.meteor-five {
  --meteor-size: 11px;
  --tail-length: 170px;
  --tail-width: 6px;
  --meteor-angle: 139deg;
  --start-x: 18vw;
  --travel-x: -27vw;
  --travel-y: 80vh;
  --meteor-duration: 4.3s;
  --meteor-delay: -3.1s;
  top: -18vh;
  left: 82vw;
}

.meteor-six {
  --meteor-size: 6px;
  --tail-length: 96px;
  --tail-width: 3px;
  --meteor-angle: 40deg;
  --travel-x: 14vw;
  --travel-y: 58vh;
  --meteor-duration: 2.9s;
  --meteor-delay: -1.8s;
  top: 8vh;
  left: 3vw;
  opacity: 0.78;
}

.impact {
  position: absolute;
  bottom: -62px;
  width: 270px;
  height: 145px;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(255, 238, 172, 0.86), rgba(255, 99, 20, 0.48) 24%, rgba(181, 20, 6, 0.2) 48%, transparent 72%);
  filter: blur(7px);
  mix-blend-mode: screen;
  opacity: 0;
}

.impact::before {
  position: absolute;
  right: 24%;
  bottom: 34%;
  left: 24%;
  height: 52%;
  border-radius: 50% 50% 24% 24%;
  background: linear-gradient(0deg, rgba(255, 77, 13, 0.45), rgba(78, 26, 24, 0.05));
  filter: blur(13px);
  content: '';
  transform: translateY(-18px) scaleY(1.6);
}

.impact i {
  position: absolute;
  top: 31%;
  left: 50%;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #fff0b2;
  box-shadow:
    -42px -13px 0 -3px rgba(255, 113, 29, 0.78),
    38px -20px 0 -4px rgba(255, 190, 72, 0.74),
    66px 4px 0 -5px rgba(255, 85, 18, 0.66);
  transform: translateX(-50%);
}

.impact-left {
  left: -55px;
  animation: impact-glow 8.6s ease-out 2s infinite;
}

.impact-right {
  right: -38px;
  width: 330px;
  animation: impact-glow 10.4s ease-out 6.1s infinite;
}

@keyframes meteor-fall {
  0%,
  8% {
    opacity: 0;
    transform: translate3d(var(--start-x), -25vh, 0) rotate(var(--meteor-angle)) scale(0.72);
  }

  12% {
    opacity: 1;
  }

  72% {
    opacity: 1;
  }

  88%,
  100% {
    opacity: 0;
    transform: translate3d(var(--travel-x), var(--travel-y), 0) rotate(var(--meteor-angle)) scale(1.08);
  }
}

@keyframes tail-shiver {
  from {
    transform: translateY(-50%) scaleX(0.94) rotate(-0.6deg);
  }

  to {
    transform: translateY(-50%) scaleX(1.04) rotate(0.8deg);
  }
}

@keyframes meteor-heat {
  from {
    filter: brightness(0.94);
    transform: scale(0.96) rotate(-4deg);
  }

  to {
    filter: brightness(1.22);
    transform: scale(1.08) rotate(4deg);
  }
}

@keyframes fragment-flicker {
  from {
    opacity: 0.28;
    transform: translate(-2px, -8px) scale(0.55);
  }

  to {
    opacity: 1;
    transform: translate(-14px, 6px) scale(1);
  }
}

@keyframes atmosphere-flash {
  0%,
  13%,
  100% {
    opacity: 0;
    transform: scale(0.62);
  }

  17% {
    opacity: 0.9;
  }

  25% {
    opacity: 0.14;
    transform: scale(1.14);
  }
}

@keyframes impact-glow {
  0%,
  22%,
  100% {
    opacity: 0;
    transform: scale(0.72);
  }

  25% {
    opacity: 0.9;
  }

  31% {
    opacity: 0.28;
    transform: scale(1.18);
  }

  43% {
    opacity: 0;
    transform: scale(1.34);
  }
}

@keyframes sky-breathe {
  from {
    opacity: 0.45;
  }

  to {
    opacity: 0.9;
  }
}

@media (max-width: 720px) {
  .meteor {
    --tail-length: 118px;
  }

  .meteor-one {
    --tail-length: 160px;
    left: 78vw;
  }

  .meteor-four,
  .meteor-six {
    display: none;
  }

  .impact {
    width: 190px;
    height: 110px;
  }

  .impact-right {
    width: 220px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .meteor,
  .atmosphere-flash,
  .impact {
    display: none;
  }

  .meteor-shower::before {
    animation: none;
    opacity: 0.45;
  }
}
</style>
