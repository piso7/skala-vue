<script setup>
// 방향, 자세, 크기와 속도가 서로 다른 사람들을 한 화면에 배치한다.
const crowdPeople = [
  { id: 1, direction: 'to-right', pose: 'pose-run', styleName: 'person-one' },
  { id: 2, direction: 'to-left', pose: 'pose-panic', styleName: 'person-two' },
  { id: 3, direction: 'to-right', pose: 'pose-panic', styleName: 'person-three' },
  { id: 4, direction: 'to-left', pose: 'pose-run', styleName: 'person-four' },
  { id: 5, direction: 'to-right', pose: 'pose-run', styleName: 'person-five' },
  { id: 6, direction: 'to-left', pose: 'pose-panic', styleName: 'person-six' },
]
</script>

<template>
  <div class="panic-crowd" aria-hidden="true">
    <div v-for="person in crowdPeople" :key="person.id" class="panic-person" :class="[person.direction, person.pose, person.styleName]">
      <!-- 왼쪽으로 가는 사람은 이 묶음만 좌우로 뒤집는다. -->
      <div class="person-direction">
        <span class="person-pixel-fire"></span>

        <div class="panic-body">
          <span class="person-head"></span>
          <span class="person-torso"></span>

          <span class="person-limb arm arm-back"><i></i></span>
          <span class="person-limb leg leg-back"><i><b></b></i></span>
          <span class="person-limb arm arm-front"><i></i></span>
          <span class="person-limb leg leg-front"><i><b></b></i></span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panic-crowd {
  position: absolute;
  z-index: 3;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.panic-person {
  position: absolute;
  width: 90px;
  height: 150px;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

.to-right {
  left: -150px;
  animation-name: crowd-run-right;
}

.to-left {
  right: -150px;
  animation-name: crowd-run-left;
}

.to-left .person-direction {
  transform: scaleX(-1);
}

.person-one {
  bottom: 8px;
  animation-duration: 7.2s;
  animation-delay: -0.7s;
}

.person-two {
  bottom: 68px;
  opacity: 0.8;
  transform: scale(0.76);
  animation-duration: 8.4s;
  animation-delay: -2.4s;
}

.person-three {
  bottom: 30px;
  transform: scale(0.9);
  animation-duration: 9s;
  animation-delay: -5.8s;
}

.person-four {
  bottom: 3px;
  transform: scale(1.08);
  animation-duration: 7.5s;
  animation-delay: -5.1s;
}

.person-five {
  bottom: 92px;
  opacity: 0.68;
  transform: scale(0.68);
  animation-duration: 8.8s;
  animation-delay: -7.2s;
}

.person-six {
  bottom: 36px;
  transform: scale(0.88);
  animation-duration: 7.8s;
  animation-delay: -6.6s;
}

.person-direction {
  position: relative;
  width: 100%;
  height: 100%;
}

.person-pixel-fire {
  position: absolute;
  z-index: 0;
  right: 2px;
  bottom: 0;
  left: 4px;
  height: 118px;
  background: linear-gradient(90deg, transparent 0 14%, #d63205 14% 30%, #ff6509 30% 68%, #8c1803 68% 83%, transparent 83%);
  clip-path: polygon(0 100%, 0 64%, 14% 64%, 14% 36%, 30% 36%, 30% 10%, 43% 10%, 43% 0, 59% 0, 59% 28%, 75% 28%, 75% 55%, 100% 55%, 100% 100%);
  opacity: 0.8;
  transform-origin: center bottom;
  animation: person-fire-jump 0.5s steps(3, end) infinite;
}

.panic-body {
  position: absolute;
  z-index: 2;
  right: 13px;
  bottom: 8px;
  width: 62px;
  height: 130px;
  transform: rotate(8deg);
  transform-origin: center bottom;
  animation: person-bounce 0.27s ease-in-out infinite alternate;
}

.person-head {
  position: absolute;
  z-index: 5;
  top: 0;
  left: 22px;
  width: 22px;
  height: 26px;
  border-radius: 48% 48% 42% 42%;
  background: #07090a;
  box-shadow: -2px 0 #ff6418;
}

.person-head::after {
  position: absolute;
  top: -4px;
  left: 2px;
  width: 20px;
  height: 9px;
  border-radius: 60% 50% 20% 20%;
  background: #020303;
  content: '';
}

.person-torso {
  position: absolute;
  z-index: 3;
  top: 27px;
  left: 18px;
  width: 29px;
  height: 49px;
  border-radius: 9px 11px 7px 7px;
  background: linear-gradient(90deg, #050607, #252829 60%, #090b0c);
  box-shadow: -3px 0 rgba(255, 84, 16, 0.48);
  clip-path: polygon(8% 0, 88% 4%, 100% 90%, 20% 100%, 0 28%);
}

.person-limb,
.person-limb i {
  position: absolute;
  display: block;
  border-radius: 8px;
  transform-origin: center 4px;
}

.person-limb {
  background: linear-gradient(90deg, #060708, #272a2b);
}

.person-limb i {
  top: 27px;
  left: 0;
  background: #090b0c;
}

.arm {
  top: 31px;
  left: 24px;
  width: 8px;
  height: 34px;
}

.arm i {
  width: 8px;
  height: 31px;
}

.arm-front,
.leg-front {
  z-index: 4;
}

.arm-back,
.leg-back {
  z-index: 1;
  filter: brightness(0.6);
}

.leg {
  top: 70px;
  left: 27px;
  width: 10px;
  height: 40px;
}

.leg i {
  top: 32px;
  width: 9px;
  height: 40px;
}

.leg i b {
  position: absolute;
  right: -12px;
  bottom: -3px;
  width: 22px;
  height: 9px;
  border-radius: 8px 11px 4px 4px;
  background: #030404;
}

/* 일반 달리기 자세는 양팔이 앞뒤로 교차한다. */
.pose-run .arm-front {
  animation: arm-run-front 0.54s ease-in-out infinite alternate;
}

.pose-run .arm-back {
  animation: arm-run-back 0.54s ease-in-out infinite alternate;
}

/* 공포 자세는 양팔을 머리 위로 뻗은 상태에서 흔들리게 한다. */
.pose-panic .arm-front {
  animation: arm-panic-front 0.38s ease-in-out infinite alternate;
}

.pose-panic .arm-back {
  animation: arm-panic-back 0.38s ease-in-out infinite alternate;
}

.leg-front {
  animation: leg-run-front 0.54s ease-in-out infinite alternate;
}

.leg-back {
  animation: leg-run-back 0.54s ease-in-out infinite alternate;
}

.leg-front i {
  animation: knee-run-front 0.54s ease-in-out infinite alternate;
}

.leg-back i {
  animation: knee-run-back 0.54s ease-in-out infinite alternate;
}

@keyframes crowd-run-right {
  from { left: -150px; }
  to { left: calc(100vw + 150px); }
}

@keyframes crowd-run-left {
  from { right: -150px; }
  to { right: calc(100vw + 150px); }
}

@keyframes person-bounce {
  from { transform: translateY(1px) rotate(7deg); }
  to { transform: translateY(-7px) rotate(11deg); }
}

@keyframes person-fire-jump {
  0%, 100% { transform: translateY(5px) scaleY(0.9); }
  50% { transform: translateY(-8px) scaleY(1.12); }
}

@keyframes arm-run-front {
  from { transform: rotate(-62deg); }
  to { transform: rotate(48deg); }
}

@keyframes arm-run-back {
  from { transform: rotate(50deg); }
  to { transform: rotate(-58deg); }
}

@keyframes arm-panic-front {
  from { transform: rotate(146deg); }
  to { transform: rotate(168deg); }
}

@keyframes arm-panic-back {
  from { transform: rotate(-148deg); }
  to { transform: rotate(-172deg); }
}

@keyframes leg-run-front {
  from { transform: rotate(-48deg); }
  to { transform: rotate(42deg); }
}

@keyframes leg-run-back {
  from { transform: rotate(45deg); }
  to { transform: rotate(-45deg); }
}

@keyframes knee-run-front {
  from { transform: rotate(18deg); }
  to { transform: rotate(-68deg); }
}

@keyframes knee-run-back {
  from { transform: rotate(-65deg); }
  to { transform: rotate(12deg); }
}
</style>
