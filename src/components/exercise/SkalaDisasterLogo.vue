<script setup>
defineProps({
  type: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div class="disaster-skala-logo" aria-hidden="true">
    <!-- 폭염 화면에서는 로고 뒤의 불꽃과 불씨가 서로 다른 속도로 움직인다. -->
    <div v-if="type === 'heat'" class="heat-skala">
      <i class="flame flame-one"></i>
      <i class="flame flame-two"></i>
      <i class="flame flame-three"></i>
      <i class="flame flame-four"></i>
      <strong>SKALA</strong>
      <span class="ember ember-one"></span>
      <span class="ember ember-two"></span>
      <span class="ember ember-three"></span>
    </div>

    <!-- 폭풍우 화면에서는 로고와 물결을 함께 움직여 물에 떠내려가는 느낌을 만든다. -->
    <div v-else class="storm-skala">
      <strong>SKALA</strong>
      <i class="water-wake"></i>
    </div>
  </div>
</template>

<style scoped>
.disaster-skala-logo {
  position: fixed;
  z-index: 4;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.heat-skala {
  position: absolute;
  top: 2vh;
  left: 50%;
  width: 440px;
  height: 155px;
  transform: translateX(-50%);
}

/* 글자와 불꽃을 따로 움직여 로고 전체가 단순히 흔들리는 것처럼 보이지 않게 한다. */
.heat-skala strong {
  position: absolute;
  z-index: 2;
  top: 58px;
  left: 50%;
  color: #fff4bf;
  font-size: 62px;
  font-style: italic;
  font-weight: 900;
  letter-spacing: 10px;
  text-shadow:
    0 -5px 8px #fff0a1,
    0 0 16px #ff9f21,
    0 14px 28px #d92808;
  transform: translateX(-50%) skewX(-7deg);
  animation: skala-burn-shake 0.68s ease-in-out infinite alternate;
}

.flame {
  position: absolute;
  bottom: 5px;
  width: 68px;
  height: 115px;
  border-radius: 70% 12% 62% 38%;
  background: linear-gradient(135deg, #fff7a9 5%, #ffb526 34%, #f23a09 70%, rgba(116, 2, 0, 0.12));
  filter: drop-shadow(0 0 15px rgba(255, 70, 8, 0.88));
  mix-blend-mode: screen;
  transform: rotate(44deg) scale(0.8);
  transform-origin: 50% 100%;
  animation: flame-dance 0.7s ease-in-out infinite alternate;
}

.flame-one {
  left: 57px;
  animation-delay: -0.22s;
}

.flame-two {
  left: 145px;
  height: 137px;
  animation-delay: -0.48s;
}

.flame-three {
  right: 137px;
  height: 128px;
  animation-delay: -0.1s;
}

.flame-four {
  right: 48px;
  animation-delay: -0.37s;
}

.ember {
  position: absolute;
  bottom: 8px;
  width: 7px;
  height: 7px;
  border-radius: 2px;
  background: #ffe266;
  box-shadow: 0 0 10px #ff5f1b;
  animation: ember-rise 2.1s ease-out infinite;
}

.ember-one {
  left: 27%;
}

.ember-two {
  left: 61%;
  animation-delay: -0.78s;
}

.ember-three {
  left: 75%;
  animation-delay: -1.42s;
}

.storm-skala {
  position: absolute;
  top: 70%;
  left: -220px;
  animation: skala-drift 9s linear -3s infinite;
}

.storm-skala strong {
  display: block;
  padding: 13px 24px 12px;
  border: 3px solid rgba(220, 250, 255, 0.86);
  border-radius: 7px;
  background: linear-gradient(145deg, #f0fdff, #8dd4e7 56%, #317c9b);
  box-shadow:
    0 12px 22px rgba(0, 13, 28, 0.5),
    inset 0 2px rgba(255, 255, 255, 0.82);
  color: #063b56;
  font-size: 34px;
  font-style: italic;
  font-weight: 900;
  letter-spacing: 7px;
  animation: skala-water-bob 0.95s ease-in-out infinite alternate;
}

.water-wake {
  display: block;
  width: 180px;
  height: 12px;
  margin: -3px auto 0;
  border-radius: 50%;
  background: rgba(199, 246, 255, 0.72);
  box-shadow:
    -45px 7px 0 -3px rgba(117, 218, 244, 0.55),
    55px 4px 0 -4px rgba(117, 218, 244, 0.46);
  filter: blur(2px);
}

@keyframes skala-burn-shake {
  from {
    filter: brightness(0.94);
    transform: translateX(-50%) skewX(-7deg) rotate(-0.8deg) scale(0.98);
  }
  to {
    filter: brightness(1.18);
    transform: translateX(-50%) skewX(-7deg) rotate(0.8deg) scale(1.04);
  }
}

@keyframes flame-dance {
  from {
    opacity: 0.68;
    transform: rotate(39deg) scale(0.68, 0.82);
  }
  to {
    opacity: 1;
    transform: rotate(49deg) scale(0.94, 1.14) translateY(-7px);
  }
}

@keyframes ember-rise {
  0% {
    opacity: 0;
    transform: translate(0, 0) rotate(0);
  }
  30% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translate(24px, -135px) rotate(170deg) scale(0.35);
  }
}

@keyframes skala-drift {
  from {
    left: -220px;
  }
  to {
    left: calc(100% + 40px);
  }
}

@keyframes skala-water-bob {
  from {
    transform: translateY(-6px) rotate(-8deg);
  }
  to {
    transform: translateY(7px) rotate(6deg);
  }
}

@media (max-width: 650px) {
  .heat-skala {
    top: 1vh;
    transform: translateX(-50%) scale(0.72);
  }

  .storm-skala strong {
    font-size: 24px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .heat-skala strong,
  .flame,
  .ember,
  .storm-skala,
  .storm-skala strong {
    animation-duration: 20s;
  }
}
</style>
