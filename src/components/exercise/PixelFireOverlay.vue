<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const createFlameRow = (rowName) => {
  return Array.from({ length: 14 }, (_, flameIndex) => {
    return {
      id: `${rowName}-${flameIndex}`,
      blocks: Array.from({ length: 12 }, (_, blockIndex) => {
        return {
          id: blockIndex + 1,
          // 아래쪽 블록은 불씨 역할을 하므로 처음부터 켜 둔다.
          visible: blockIndex < 3 || Math.random() > 0.45,
        }
      }),
    }
  })
}

const backFlames = ref(createFlameRow('back'))
const frontFlames = ref(createFlameRow('front'))
let fireTimer

const changeFlameBlocks = (flames, isBackRow) => {
  return flames.map((flame) => {
    return {
      ...flame,
      blocks: flame.blocks.map((block, blockIndex) => {
        // 맨 아래 두 칸은 계속 남겨 화면 아래의 불길이 끊어지지 않게 한다.
        if (blockIndex < 2) {
          return { ...block, visible: true }
        }

        // 모든 블록을 한 번에 바꾸지 않고 일부만 바꿔 불규칙한 윤곽을 만든다.
        if (Math.random() < 0.4) {
          return block
        }

        const heightChance = Math.max(0.12, 0.86 - blockIndex * 0.07)
        const backRowBonus = isBackRow ? 0.08 : 0

        return {
          ...block,
          visible: Math.random() < heightChance + backRowBonus,
        }
      }),
    }
  })
}

const updateFireBlocks = () => {
  backFlames.value = changeFlameBlocks(backFlames.value, true)
  frontFlames.value = changeFlameBlocks(frontFlames.value, false)
}

onMounted(() => {
  fireTimer = setInterval(updateFireBlocks, 145)
})

onBeforeUnmount(() => {
  clearInterval(fireTimer)
})
</script>

<template>
  <div class="pixel-fire-screen" aria-hidden="true">
    <!-- 화면 전체에 붉은 픽셀 필터를 깔아 불 속에 들어온 느낌을 만든다. -->
    <div class="pixel-screen-tint"></div>

    <!-- 작은 사각 불티가 화면 아래에서 계단식으로 올라온다. -->
    <div class="pixel-embers">
      <i v-for="index in 16" :key="index"></i>
    </div>

    <!-- 뒤쪽 불꽃은 크고 어둡게, 앞쪽 불꽃은 밝고 선명하게 겹친다. -->
    <div class="pixel-fire-row fire-row-back">
      <span v-for="flame in backFlames" :key="flame.id" class="pixel-flame">
        <i v-for="block in flame.blocks" v-show="block.visible" :key="block.id" class="flame-block" :class="`block-${block.id}`"></i>
      </span>
    </div>

    <div class="pixel-fire-row fire-row-front">
      <span v-for="flame in frontFlames" :key="flame.id" class="pixel-flame">
        <i v-for="block in flame.blocks" v-show="block.visible" :key="block.id" class="flame-block" :class="`block-${block.id}`"></i>
      </span>
    </div>

    <div class="pixel-edge edge-left"></div>
    <div class="pixel-edge edge-right"></div>
  </div>
</template>

<style scoped>
.pixel-fire-screen {
  position: absolute;
  z-index: 2;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  image-rendering: pixelated;
}

/* 얇은 격자를 사용해 화면 전체를 모자이크처럼 보이게 한다. */
.pixel-fire-screen::before {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(90deg, rgba(255, 91, 12, 0.08) 1px, transparent 1px),
    linear-gradient(rgba(255, 91, 12, 0.07) 1px, transparent 1px);
  background-size: 24px 24px;
  content: '';
  animation: pixel-grid-flash 1s steps(2, end) infinite;
}

.pixel-screen-tint {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(113, 13, 0, 0.42) 0 5%, transparent 11% 89%, rgba(113, 13, 0, 0.42) 95% 100%),
    linear-gradient(0deg, rgba(139, 19, 0, 0.48) 0 12%, transparent 52%);
  animation: pixel-screen-flash 0.8s steps(3, end) infinite;
}

.pixel-fire-row {
  position: absolute;
  right: -4%;
  bottom: -8%;
  left: -4%;
  display: grid;
  grid-template-columns: repeat(14, 1fr);
  align-items: end;
  height: 58%;
}

.fire-row-back {
  z-index: 1;
  bottom: -2%;
  height: 64%;
  opacity: 0.66;
}

.fire-row-front {
  z-index: 3;
  height: 47%;
}

.pixel-flame {
  position: relative;
  display: block;
  width: 108%;
  height: 88%;
  margin-left: -4%;
}

.pixel-flame:nth-child(3n) {
  height: 68%;
}

.pixel-flame:nth-child(3n + 1) {
  height: 100%;
}

.pixel-flame:nth-child(4n) {
  height: 78%;
}

.flame-block {
  position: absolute;
  display: block;
  box-sizing: border-box;
  border: 1px solid rgba(255, 151, 31, 0.16);
  background: #db3405;
  box-shadow: inset -3px -3px rgba(91, 13, 1, 0.2);
}

.block-1 {
  bottom: 0;
  left: 0;
  width: 58%;
  height: 24%;
  background: #8c1903;
}

.block-2 {
  right: 0;
  bottom: 0;
  width: 52%;
  height: 31%;
  background: #ef4807;
}

.block-3 {
  bottom: 20%;
  left: 17%;
  width: 58%;
  height: 24%;
  background: #ff6509;
}

.block-4 {
  right: 3%;
  bottom: 31%;
  width: 44%;
  height: 21%;
  background: #bd2604;
}

.block-5 {
  bottom: 42%;
  left: 29%;
  width: 39%;
  height: 19%;
  background: #ff8e10;
}

.block-6 {
  bottom: 55%;
  left: 43%;
  width: 31%;
  height: 17%;
  background: #e64005;
}

.block-7 {
  bottom: 68%;
  left: 31%;
  width: 27%;
  height: 16%;
  background: #ff7410;
}

.block-8 {
  bottom: 81%;
  left: 40%;
  width: 21%;
  height: 14%;
  background: #ffb326;
}

.block-9 {
  bottom: 37%;
  left: 0;
  width: 28%;
  height: 17%;
  background: #791402;
}

.block-10 {
  right: 0;
  bottom: 51%;
  width: 27%;
  height: 16%;
  background: #c72a04;
}

.block-11 {
  bottom: 66%;
  left: 5%;
  width: 23%;
  height: 15%;
  background: #e94306;
}

.block-12 {
  right: 15%;
  bottom: 88%;
  width: 19%;
  height: 12%;
  background: #ff8c14;
}

.pixel-flame:nth-child(even) .block-8 {
  left: 58%;
}

.pixel-flame:nth-child(3n) .block-11 {
  left: 68%;
}

.pixel-flame:nth-child(4n + 1) .block-12 {
  right: 62%;
}

.pixel-embers {
  position: absolute;
  z-index: 4;
  inset: 0;
}

.pixel-embers i {
  position: absolute;
  bottom: -24px;
  width: 12px;
  height: 12px;
  background: #ffb21c;
  box-shadow: 12px 0 #ef4a05, 0 12px #7d1603;
  animation: pixel-ember-rise 2.4s steps(8, end) infinite;
}

.pixel-embers i:nth-child(1) { left: 4%; animation-delay: -0.2s; }
.pixel-embers i:nth-child(2) { left: 11%; animation-delay: -1.4s; }
.pixel-embers i:nth-child(3) { left: 18%; animation-delay: -0.8s; }
.pixel-embers i:nth-child(4) { left: 25%; animation-delay: -2s; }
.pixel-embers i:nth-child(5) { left: 32%; animation-delay: -0.4s; }
.pixel-embers i:nth-child(6) { left: 39%; animation-delay: -1.7s; }
.pixel-embers i:nth-child(7) { left: 46%; animation-delay: -1s; }
.pixel-embers i:nth-child(8) { left: 53%; animation-delay: -2.2s; }
.pixel-embers i:nth-child(9) { left: 60%; animation-delay: -0.6s; }
.pixel-embers i:nth-child(10) { left: 67%; animation-delay: -1.8s; }
.pixel-embers i:nth-child(11) { left: 73%; animation-delay: -1.1s; }
.pixel-embers i:nth-child(12) { left: 79%; animation-delay: -2.3s; }
.pixel-embers i:nth-child(13) { left: 84%; animation-delay: -0.3s; }
.pixel-embers i:nth-child(14) { left: 89%; animation-delay: -1.5s; }
.pixel-embers i:nth-child(15) { left: 94%; animation-delay: -0.9s; }
.pixel-embers i:nth-child(16) { left: 98%; animation-delay: -2.1s; }

.pixel-edge {
  position: absolute;
  z-index: 2;
  top: 18%;
  bottom: 0;
  width: 7%;
  background:
    linear-gradient(0deg, #7c1604 0 15%, transparent 15% 20%, #c92c04 20% 35%, transparent 35% 42%, #e94a06 42% 54%, transparent 54% 68%, #8c1903 68% 78%, transparent 78%);
  opacity: 0.62;
  animation: pixel-edge-shift 1.1s steps(4, end) infinite;
}

.edge-left {
  left: 0;
}

.edge-right {
  right: 0;
  animation-delay: -0.55s;
  transform: scaleX(-1);
}

@keyframes pixel-ember-rise {
  0% { opacity: 0; transform: translateY(0); }
  18% { opacity: 1; }
  100% { opacity: 0; transform: translateY(-76vh) translateX(24px); }
}

@keyframes pixel-edge-shift {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-24px); }
}

@keyframes pixel-grid-flash {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.82; }
}

@keyframes pixel-screen-flash {
  0%, 100% { opacity: 0.74; }
  50% { opacity: 1; }
}

@media (max-width: 700px) {
  .pixel-fire-row {
    grid-template-columns: repeat(10, 1fr);
    right: -12%;
    left: -12%;
  }

  .pixel-flame:nth-child(n + 11) {
    display: none;
  }
}
</style>
