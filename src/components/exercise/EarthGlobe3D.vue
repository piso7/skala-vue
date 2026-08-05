<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import earthTextureUrl from '../../assets/weather/earth-texture-nasa-8192.jpg'

const props = defineProps({
  cityItem: {
    type: Object,
    default: null,
  },
  isFahrenheit: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['ready'])

const canvasHost = ref(null)
const isSceneReady = ref(false)
const sceneError = ref('')
const isCityMoving = ref(false)
const isTracking = ref(true)
const satelliteLabelStyle = ref({ left: '50%', top: '24%', opacity: 0 })
const tracker = reactive({
  name: 'STARLINK-01',
  altitude: 550,
  velocity: '7.59',
  signal: 98,
})

// Three.js 화면은 Vue의 반응형 상태와 별도로 계속 갱신되므로 필요한 객체를 따로 보관한다.
let scene
let camera
let renderer
let controls
let earthRoot
let cityMarker
let satelliteLayer
let orbitLayer
let trackingBeam
let activeSatellite
let resizeObserver
let animationFrame
let lastFrameTime = 0
let trackerChangedAt = 0
let labelFrameCount = 0
let earthTexture
let cityTransition = null
const satellites = []

const displayTemp = (temp) => {
  if (props.isFahrenheit) {
    return Math.round((temp * 9) / 5 + 32)
  }

  return temp
}

const latitudeText = computed(() => {
  if (!props.cityItem) return ''
  return `${Math.abs(props.cityItem.lat).toFixed(2)}°${props.cityItem.lat >= 0 ? 'N' : 'S'}`
})

const longitudeText = computed(() => {
  if (!props.cityItem) return ''
  return `${Math.abs(props.cityItem.lon).toFixed(2)}°${props.cityItem.lon >= 0 ? 'E' : 'W'}`
})

const sceneStatus = computed(() => {
  if (sceneError.value) return '3D 렌더링을 시작할 수 없습니다.'
  if (!isSceneReady.value) return '3D 지구를 준비하고 있습니다.'
  if (isCityMoving.value && props.cityItem) return `${props.cityItem.name} 궤도 접근 중`
  if (props.cityItem) return `${props.cityItem.name} 좌표 고정`
  return '마우스로 회전 · 휠로 확대'
})

// 위도와 경도를 구체 표면의 3차원 좌표로 바꾼다.
const latLonToVector = (latitude, longitude, radius) => {
  const phi = THREE.MathUtils.degToRad(90 - latitude)
  const theta = THREE.MathUtils.degToRad(longitude + 180)

  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  )
}

const easeInOut = (value) => {
  if (value < 0.5) return 4 * value * value * value
  return 1 - Math.pow(-2 * value + 2, 3) / 2
}

// 작은 점을 구 주변에 흩뿌려 별이 멀리 있는 것처럼 보이게 한다.
const createStars = () => {
  const starCount = 900
  const positions = new Float32Array(starCount * 3)

  for (let index = 0; index < starCount; index += 1) {
    const radius = 10 + Math.random() * 15
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta)
    positions[index * 3 + 1] = radius * Math.cos(phi)
    positions[index * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta)
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const material = new THREE.PointsMaterial({
    color: 0xaedcff,
    size: 0.035,
    transparent: true,
    opacity: 0.72,
    sizeAttenuation: true,
  })
  scene.add(new THREE.Points(geometry, material))
}

// 지구보다 조금 큰 반투명 구체를 겹쳐 가장자리에 푸른 대기권 빛을 만든다.
const createAtmosphere = () => {
  const geometry = new THREE.SphereGeometry(2.52, 72, 72)
  const material = new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vertexNormal;
      void main() {
        vertexNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vertexNormal;
      void main() {
        float glow = pow(0.72 - dot(vertexNormal, vec3(0.0, 0.0, 1.0)), 2.4);
        gl_FragColor = vec4(0.12, 0.67, 1.0, glow * 0.68);
      }
    `,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
  })
  scene.add(new THREE.Mesh(geometry, material))
}

// 도시를 선택하면 구체 표면에 핀과 퍼지는 원이 함께 나타난다.
const createCityMarker = () => {
  cityMarker = new THREE.Group()

  const pinMaterial = new THREE.MeshStandardMaterial({
    color: 0xff5b52,
    emissive: 0xc71929,
    emissiveIntensity: 1.4,
    roughness: 0.3,
  })
  const pinHead = new THREE.Mesh(new THREE.SphereGeometry(0.038, 20, 20), pinMaterial)
  pinHead.position.y = 0.07
  const pinStem = new THREE.Mesh(new THREE.ConeGeometry(0.023, 0.115, 16), pinMaterial)
  pinStem.position.y = 0.005

  const pulseMaterial = new THREE.MeshBasicMaterial({
    color: 0xffb2a5,
    transparent: true,
    opacity: 0.68,
    side: THREE.DoubleSide,
  })
  const pulse = new THREE.Mesh(new THREE.RingGeometry(0.045, 0.065, 32), pulseMaterial)
  pulse.name = 'city-pulse'
  pulse.rotation.x = -Math.PI / 2
  pulse.position.y = -0.08

  cityMarker.add(pinHead, pinStem, pulse)
  cityMarker.visible = false
  earthRoot.add(cityMarker)
}

// 같은 원형 궤도를 기울기와 방향만 바꾸어 여러 궤도면으로 사용한다.
const createOrbitLine = (inclination, ascendingNode, color) => {
  const points = []
  const orbitRotation = new THREE.Quaternion().setFromEuler(
    new THREE.Euler(inclination, ascendingNode, 0, 'YXZ'),
  )

  for (let index = 0; index <= 160; index += 1) {
    const angle = (index / 160) * Math.PI * 2
    const point = new THREE.Vector3(Math.cos(angle) * 2.83, 0, Math.sin(angle) * 2.83)
    point.applyQuaternion(orbitRotation)
    points.push(point)
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  const material = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending,
  })
  orbitLayer.add(new THREE.Line(geometry, material))
}

// 실제 위치 정보 대신 과제 화면에서 확인할 수 있는 24개의 위성 궤도를 만든다.
const createStarlinkConstellation = () => {
  satelliteLayer = new THREE.Group()
  orbitLayer = new THREE.Group()
  scene.add(orbitLayer, satelliteLayer)

  // 네 개의 궤도면마다 여섯 개씩 배치해 어느 방향에서도 위성이 보이도록 했다.
  const planeCount = 4
  const satellitesPerPlane = 6
  const inclination = THREE.MathUtils.degToRad(53)
  const colors = [0x7ee7ff, 0xd6f6ff, 0x7cbcff, 0x9fffd8]

  for (let plane = 0; plane < planeCount; plane += 1) {
    const ascendingNode = (plane / planeCount) * Math.PI * 2
    createOrbitLine(inclination, ascendingNode, colors[plane])

    for (let number = 0; number < satellitesPerPlane; number += 1) {
      const satelliteNumber = plane * satellitesPerPlane + number + 1
      const material = new THREE.MeshStandardMaterial({
        color: 0xc9f6ff,
        emissive: 0x4abddb,
        emissiveIntensity: 1.8,
        roughness: 0.25,
      })
      const mesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.045, 0), material)
      satelliteLayer.add(mesh)
      satellites.push({
        name: `STARLINK-${String(satelliteNumber).padStart(2, '0')}`,
        mesh,
        phase: (number / satellitesPerPlane) * Math.PI * 2 + plane * 0.18,
        speed: 0.13 + plane * 0.004,
        rotation: new THREE.Quaternion().setFromEuler(
          new THREE.Euler(inclination, ascendingNode, 0, 'YXZ'),
        ),
      })
    }
  }

  activeSatellite = satellites[0]
  activeSatellite.mesh.scale.setScalar(1.9)
  activeSatellite.mesh.material.color.set(0xffe28a)
  activeSatellite.mesh.material.emissive.set(0xff8a28)

  const beamGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(),
    new THREE.Vector3(),
  ])
  const beamMaterial = new THREE.LineBasicMaterial({
    color: 0xffcf72,
    transparent: true,
    opacity: 0.72,
    blending: THREE.AdditiveBlending,
  })
  trackingBeam = new THREE.Line(beamGeometry, beamMaterial)
  scene.add(trackingBeam)
}

// 한 위성만 계속 강조하지 않고 5초마다 다음 추적 대상으로 바꾼다.
const changeTrackedSatellite = (elapsedTime) => {
  if (!isTracking.value || elapsedTime - trackerChangedAt < 5) return

  trackerChangedAt = elapsedTime
  const currentIndex = satellites.indexOf(activeSatellite)
  const nextIndex = (currentIndex + 5) % satellites.length

  activeSatellite.mesh.scale.setScalar(1)
  activeSatellite.mesh.material.color.set(0xc9f6ff)
  activeSatellite.mesh.material.emissive.set(0x4abddb)

  activeSatellite = satellites[nextIndex]
  activeSatellite.mesh.scale.setScalar(1.9)
  activeSatellite.mesh.material.color.set(0xffe28a)
  activeSatellite.mesh.material.emissive.set(0xff8a28)
  tracker.name = activeSatellite.name
  tracker.signal = 94 + (nextIndex % 5)
}

// 매 프레임 위성의 각도를 바꾸고, 추적 중인 위성과 지표 사이에 신호선을 연결한다.
const updateSatellites = (elapsedTime) => {
  satellites.forEach((satellite) => {
    const angle = satellite.phase + elapsedTime * satellite.speed
    satellite.mesh.position
      .set(Math.cos(angle) * 2.83, 0, Math.sin(angle) * 2.83)
      .applyQuaternion(satellite.rotation)
  })

  if (!activeSatellite || !trackingBeam) return

  const satellitePosition = activeSatellite.mesh.position
  const groundPosition = satellitePosition.clone().normalize().multiplyScalar(2.43)
  const beamPositions = trackingBeam.geometry.attributes.position
  beamPositions.setXYZ(0, satellitePosition.x, satellitePosition.y, satellitePosition.z)
  beamPositions.setXYZ(1, groundPosition.x, groundPosition.y, groundPosition.z)
  beamPositions.needsUpdate = true

  activeSatellite.mesh.scale.setScalar(1.75 + Math.sin(elapsedTime * 5) * 0.2)

  labelFrameCount += 1
  if (labelFrameCount % 6 === 0 && renderer) {
    // 3차원 위성 좌표를 화면 좌표로 바꾸어 HTML 이름표를 위성 옆에 붙인다.
    const projected = satellitePosition.clone().project(camera)
    satelliteLabelStyle.value = {
      left: `${(projected.x * 0.5 + 0.5) * 100}%`,
      top: `${(-projected.y * 0.5 + 0.5) * 100}%`,
      opacity: projected.z < 1 ? 1 : 0,
    }
  }
}

// 도시를 바꿀 때는 줌 아웃, 지구 회전, 줌 인 순서로 카메라를 움직인다.
const updateCityTransition = (time) => {
  if (!cityTransition) return

  const elapsed = time - cityTransition.startedAt
  const progress = Math.min(1, elapsed / cityTransition.duration)

  // 이미 다른 도시를 보고 있었다면 먼저 지구 전체가 보일 만큼 멀어진다.
  if (progress < 0.24 && !cityTransition.firstSelection) {
    const zoomOutProgress = easeInOut(progress / 0.24)
    camera.position.lerpVectors(cityTransition.startCamera, cityTransition.farCamera, zoomOutProgress)
  } else {
    const moveStart = cityTransition.firstSelection ? 0 : 0.24
    const moveProgress = Math.min(1, (progress - moveStart) / (0.67 - moveStart))
    earthRoot.quaternion.slerpQuaternions(
      cityTransition.startQuaternion,
      cityTransition.targetQuaternion,
      easeInOut(Math.max(0, moveProgress)),
    )

    // 도시가 화면 중앙에 도착한 뒤에만 가까운 거리로 확대한다.
    if (progress >= 0.67) {
      const zoomInProgress = easeInOut((progress - 0.67) / 0.33)
      camera.position.lerpVectors(cityTransition.farCamera, cityTransition.closeCamera, zoomInProgress)
    } else {
      camera.position.copy(cityTransition.farCamera)
    }
  }

  if (progress >= 1) {
    earthRoot.quaternion.copy(cityTransition.targetQuaternion)
    camera.position.copy(cityTransition.closeCamera)
    cityTransition = null
    isCityMoving.value = false
    cityMarker.visible = true
    controls.enabled = true
  }
}

// 선택한 위도와 경도가 카메라 정면을 향하도록 지구의 목표 회전값을 계산한다.
const moveToSelectedCity = () => {
  if (!isSceneReady.value || !earthRoot || !camera) return

  if (!props.cityItem) {
    cityTransition = null
    cityMarker.visible = false
    isCityMoving.value = false
    controls.enabled = true
    controls.autoRotate = true
    return
  }

  const firstSelection = !cityMarker.visible
  const cityNormal = latLonToVector(props.cityItem.lat, props.cityItem.lon, 1).normalize()
  const cameraDirection = new THREE.Vector3(0, 0.06, 1).normalize()
  const targetQuaternion = new THREE.Quaternion().setFromUnitVectors(cityNormal, cameraDirection)
  const markerPosition = latLonToVector(props.cityItem.lat, props.cityItem.lon, 2.46)

  cityMarker.position.copy(markerPosition)
  cityMarker.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    markerPosition.clone().normalize(),
  )
  cityMarker.visible = false
  isCityMoving.value = true
  controls.enabled = false
  controls.autoRotate = false

  cityTransition = {
    startedAt: performance.now(),
    duration: firstSelection ? 2100 : 2550,
    firstSelection,
    startQuaternion: earthRoot.quaternion.clone(),
    targetQuaternion,
    startCamera: camera.position.clone(),
    farCamera: new THREE.Vector3(0, 0.38, 7.7),
    closeCamera: new THREE.Vector3(0, 0.25, props.cityItem.area === '국내' ? 5.85 : 6.15),
  }
}

const toggleTracking = () => {
  isTracking.value = !isTracking.value
  satelliteLayer.visible = isTracking.value
  orbitLayer.visible = isTracking.value
  trackingBeam.visible = isTracking.value

  if (!isTracking.value) {
    satelliteLabelStyle.value = { ...satelliteLabelStyle.value, opacity: 0 }
  }
}

// 카드 크기가 바뀌면 캔버스와 카메라 비율도 같은 크기로 맞춘다.
const resizeScene = () => {
  if (!canvasHost.value || !renderer || !camera) return

  const width = canvasHost.value.clientWidth
  const height = canvasHost.value.clientHeight
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height, false)
}

// 화면이 열려 있는 동안 도시 이동, 위성 이동, 마우스 조작을 한 장면으로 그린다.
const animateScene = (time) => {
  animationFrame = requestAnimationFrame(animateScene)
  const elapsedTime = time / 1000
  const deltaTime = Math.min(0.04, (time - lastFrameTime) / 1000 || 0)
  lastFrameTime = time

  updateCityTransition(time)
  changeTrackedSatellite(elapsedTime)
  updateSatellites(elapsedTime)

  const pulse = cityMarker?.getObjectByName('city-pulse')
  if (pulse?.visible) {
    const pulseScale = 1 + (Math.sin(elapsedTime * 3.5) + 1) * 0.65
    pulse.scale.setScalar(pulseScale)
    pulse.material.opacity = 0.48 - (pulseScale - 1) * 0.16
  }

  controls.autoRotate = !props.cityItem && !isCityMoving.value
  controls.autoRotateSpeed = 0.48 + deltaTime
  controls.update()
  renderer.render(scene, camera)
}

// Vue 화면이 열린 뒤 카메라, 조명, 지구를 차례로 준비하고 애니메이션을 시작한다.
const createScene = () => {
  try {
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
    camera.position.set(0, 0.35, 7.7)

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    // 고해상도 화면에서도 선명하게 보이되, 지나치게 큰 렌더링으로 느려지지 않게 제한한다.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8))
    renderer.setClearColor(0x000000, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.12
    canvasHost.value.appendChild(renderer.domElement)

    // OrbitControls가 마우스 회전, 휠 확대와 대기 중 자동 회전을 맡는다.
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.045
    controls.enablePan = false
    controls.minDistance = 4.2
    controls.maxDistance = 10
    controls.rotateSpeed = 0.58
    controls.zoomSpeed = 0.75
    controls.autoRotate = true

    // 정면의 햇빛과 뒤쪽의 푸른 빛을 함께 사용해 구체의 둥근 윤곽을 살린다.
    scene.add(new THREE.HemisphereLight(0x8fd9ff, 0x061321, 1.45))
    const sunlight = new THREE.DirectionalLight(0xffffff, 3.5)
    sunlight.position.set(-5, 3, 5)
    scene.add(sunlight)
    const rimLight = new THREE.DirectionalLight(0x2db7ff, 2.2)
    rimLight.position.set(4, -2, -4)
    scene.add(rimLight)

    earthRoot = new THREE.Group()
    scene.add(earthRoot)
    // 2D 화면에서 사용하던 NASA 지도를 실제 구체의 표면에도 입힌다.
    earthTexture = new THREE.TextureLoader().load(earthTextureUrl)
    earthTexture.colorSpace = THREE.SRGBColorSpace
    earthTexture.anisotropy = renderer.capabilities.getMaxAnisotropy()

    const earthGeometry = new THREE.SphereGeometry(2.4, 96, 96)
    const earthMaterial = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.72,
      metalness: 0.02,
    })
    earthRoot.add(new THREE.Mesh(earthGeometry, earthMaterial))

    createAtmosphere()
    createStars()
    createCityMarker()
    createStarlinkConstellation()
    resizeScene()

    resizeObserver = new ResizeObserver(resizeScene)
    resizeObserver.observe(canvasHost.value)
    isSceneReady.value = true
    moveToSelectedCity()
    animationFrame = requestAnimationFrame(animateScene)
  } catch (error) {
    console.error('3D 지구 렌더링 오류:', error)
    sceneError.value = '이 브라우저에서는 WebGL 화면을 표시할 수 없습니다.'
  }
}

// 2D 모드로 돌아가거나 페이지를 닫을 때 그래픽 메모리에 남은 객체를 정리한다.
const disposeScene = () => {
  cancelAnimationFrame(animationFrame)
  resizeObserver?.disconnect()
  controls?.dispose()

  scene?.traverse((object) => {
    object.geometry?.dispose()
    if (Array.isArray(object.material)) {
      object.material.forEach((material) => material.dispose())
    } else {
      object.material?.dispose()
    }
  })

  earthTexture?.dispose()
  renderer?.dispose()
  renderer?.domElement.remove()
}

watch(
  () => props.cityItem?.id,
  () => moveToSelectedCity(),
)

onMounted(() => {
  // 부모 화면이 지구의 실제 위치를 기준으로 스크롤할 수 있도록 준비 완료를 알린다.
  emit('ready')
  createScene()
})
onBeforeUnmount(disposeScene)
</script>

<template>
  <section class="globe-3d-explorer">
    <aside class="globe-3d-copy">
      <div class="globe-3d-heading">
        <div>
          <p>ORBITAL DIGITAL TWIN</p>
          <span>TRUE 3D · WEBGL</span>
        </div>
        <i></i>
      </div>

      <h3 v-if="cityItem">{{ cityItem.flag }} {{ cityItem.fullName }}</h3>
      <h3 v-else>살아 움직이는<br />지구 궤도 관제실</h3>
      <p class="globe-3d-description">
        {{ cityItem ? '실제 구체 표면을 회전해 선택한 좌표를 추적하고 있습니다.' : '지구를 직접 돌려 보거나 도시를 선택해 위성 시점으로 이동해 보세요.' }}
      </p>

      <div v-if="cityItem" class="globe-city-readout">
        <div>
          <span>현재</span>
          <strong>{{ displayTemp(cityItem.temp) }}°{{ isFahrenheit ? 'F' : 'C' }}</strong>
        </div>
        <div>
          <span>체감</span>
          <strong>{{ displayTemp(cityItem.feels) }}°{{ isFahrenheit ? 'F' : 'C' }}</strong>
        </div>
        <div>
          <span>좌표</span>
          <strong>{{ latitudeText }} · {{ longitudeText }}</strong>
        </div>
      </div>

      <div class="starlink-console" :class="{ active: isTracking }">
        <div class="starlink-title">
          <div>
            <span>STARLINK ORBIT</span>
            <strong>{{ isTracking ? '위성 추적 중' : '추적 대기' }}</strong>
          </div>
          <button type="button" :aria-pressed="isTracking" @click="toggleTracking">
            {{ isTracking ? '추적 종료' : '추적 시작' }}
          </button>
        </div>

        <div class="starlink-data">
          <div><span>TRACKING</span><b>{{ tracker.name }}</b></div>
          <div><span>ALTITUDE</span><b>{{ tracker.altitude }} km</b></div>
          <div><span>VELOCITY</span><b>{{ tracker.velocity }} km/s</b></div>
          <div><span>SIGNAL</span><b>{{ tracker.signal }}%</b></div>
        </div>
        <p>과제용 궤도 시뮬레이션 · 궤도 높이는 화면 가독성을 위해 확대</p>
      </div>
    </aside>

    <div ref="canvasHost" class="globe-3d-stage">
      <div class="render-state"><i></i> LIVE RENDER</div>
      <div class="satellite-count">24 SATELLITES · 4 ORBIT PLANES</div>
      <div v-if="isTracking" class="satellite-label" :style="satelliteLabelStyle">
        <span></span>{{ tracker.name }}
      </div>
      <div v-if="sceneError" class="webgl-error">{{ sceneError }}</div>
      <p class="globe-3d-status">{{ sceneStatus }}</p>
    </div>
  </section>
</template>

<style scoped>
.globe-3d-explorer {
  position: relative;
  display: grid;
  grid-template-columns: minmax(275px, 0.68fr) minmax(0, 1.32fr);
  min-height: 680px;
  margin-bottom: 18px;
  overflow: hidden;
  border: 1px solid rgba(95, 194, 230, 0.3);
  border-radius: 20px;
  background:
    radial-gradient(circle at 74% 46%, rgba(15, 102, 156, 0.2), transparent 31%),
    linear-gradient(135deg, #050b14 0%, #071525 52%, #030811 100%);
  box-shadow: 0 22px 58px rgba(0, 8, 20, 0.35);
  color: #fff;
}

.globe-3d-explorer::before {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(111, 200, 231, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(111, 200, 231, 0.035) 1px, transparent 1px);
  background-size: 42px 42px;
  content: '';
  mask-image: linear-gradient(90deg, #000, transparent 72%);
  pointer-events: none;
}

.globe-3d-copy {
  position: relative;
  z-index: 2;
  align-self: center;
  padding: 42px 10px 42px 38px;
}

.globe-3d-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.globe-3d-heading p {
  margin: 0 0 6px;
  color: #6ee6ff;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.8px;
}

.globe-3d-heading span {
  color: #668ca3;
  font-size: 9px;
  letter-spacing: 1.2px;
}

.globe-3d-heading i {
  width: 7px;
  height: 7px;
  margin-right: 8px;
  border-radius: 50%;
  background: #65f2c5;
  box-shadow: 0 0 0 5px rgba(101, 242, 197, 0.1), 0 0 16px #65f2c5;
}

.globe-3d-copy h3 {
  margin: 0;
  color: #f2fbff;
  font-size: clamp(24px, 2.6vw, 31px);
  line-height: 1.32;
  letter-spacing: -0.8px;
}

.globe-3d-description {
  margin: 13px 0 22px;
  color: #8baabd;
  font-size: 13px;
  line-height: 1.7;
}

.globe-city-readout {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 14px;
}

.globe-city-readout div {
  padding: 11px 12px;
  border: 1px solid rgba(105, 195, 225, 0.17);
  border-radius: 10px;
  background: rgba(4, 19, 32, 0.66);
}

.globe-city-readout div:last-child {
  grid-column: 1 / -1;
}

.globe-city-readout span,
.globe-city-readout strong {
  display: block;
}

.globe-city-readout span {
  margin-bottom: 3px;
  color: #577f96;
  font-size: 9px;
  letter-spacing: 0.5px;
}

.globe-city-readout strong {
  color: #dff7ff;
  font-size: 14px;
}

.starlink-console {
  padding: 15px;
  border: 1px solid rgba(125, 169, 192, 0.18);
  border-radius: 13px;
  background: linear-gradient(145deg, rgba(6, 23, 38, 0.92), rgba(4, 13, 23, 0.94));
  opacity: 0.72;
  transition: border-color 0.3s, opacity 0.3s, box-shadow 0.3s;
}

.starlink-console.active {
  border-color: rgba(87, 220, 244, 0.34);
  box-shadow: inset 0 0 26px rgba(26, 146, 187, 0.07);
  opacity: 1;
}

.starlink-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.starlink-title span,
.starlink-title strong {
  display: block;
}

.starlink-title span {
  margin-bottom: 3px;
  color: #617f92;
  font-size: 8px;
  letter-spacing: 1.2px;
}

.starlink-title strong {
  color: #d6f8ff;
  font-size: 13px;
}

.starlink-title button {
  padding: 6px 9px;
  border: 1px solid rgba(99, 220, 239, 0.34);
  border-radius: 15px;
  background: rgba(32, 128, 158, 0.16);
  color: #83eaff;
  font-size: 10px;
  cursor: pointer;
}

.starlink-data {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 7px;
  margin-top: 13px;
}

.starlink-data div {
  padding: 8px;
  border-radius: 7px;
  background: rgba(91, 181, 210, 0.06);
}

.starlink-data span,
.starlink-data b {
  display: block;
}

.starlink-data span {
  margin-bottom: 3px;
  color: #537589;
  font-size: 7px;
  letter-spacing: 0.8px;
}

.starlink-data b {
  overflow: hidden;
  color: #bfeef8;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.starlink-console > p {
  margin: 10px 0 0;
  color: #496779;
  font-size: 8px;
  line-height: 1.5;
}

.globe-3d-stage {
  position: relative;
  z-index: 1;
  min-width: 0;
  min-height: 680px;
  cursor: grab;
}

.globe-3d-stage:active {
  cursor: grabbing;
}

.globe-3d-stage::after {
  position: absolute;
  inset: auto 8% 4% 8%;
  height: 18%;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(29, 133, 186, 0.18), transparent 68%);
  filter: blur(12px);
  content: '';
  pointer-events: none;
}

.globe-3d-stage :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
  outline: none;
}

.render-state,
.satellite-count,
.globe-3d-status {
  position: absolute;
  z-index: 3;
  border: 1px solid rgba(107, 197, 224, 0.18);
  background: rgba(2, 12, 22, 0.72);
  backdrop-filter: blur(10px);
  color: #739bb0;
  font-size: 9px;
  letter-spacing: 0.8px;
  pointer-events: none;
}

.render-state {
  top: 22px;
  right: 25px;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 10px;
  border-radius: 15px;
}

.render-state i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #69f4c8;
  box-shadow: 0 0 9px #69f4c8;
}

.satellite-count {
  top: 22px;
  left: 22px;
  padding: 7px 10px;
  border-radius: 15px;
}

.globe-3d-status {
  right: 50%;
  bottom: 20px;
  margin: 0;
  padding: 8px 13px;
  border-radius: 17px;
  color: #9dc9da;
  transform: translateX(50%);
}

.satellite-label {
  position: absolute;
  z-index: 4;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  border: 1px solid rgba(255, 210, 120, 0.46);
  border-radius: 11px;
  background: rgba(20, 15, 8, 0.78);
  color: #ffe3a0;
  font-size: 8px;
  letter-spacing: 0.6px;
  transform: translate(10px, -50%);
  transition: opacity 0.2s;
  pointer-events: none;
}

.satellite-label span {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #ffd069;
  box-shadow: 0 0 8px #ff9c42;
}

.webgl-error {
  position: absolute;
  inset: 50% auto auto 50%;
  width: min(320px, 80%);
  padding: 18px;
  border: 1px solid rgba(255, 124, 124, 0.34);
  border-radius: 12px;
  background: rgba(52, 10, 18, 0.8);
  color: #ffc3c3;
  font-size: 12px;
  text-align: center;
  transform: translate(-50%, -50%);
}

@media (max-width: 850px) {
  .globe-3d-explorer {
    grid-template-columns: 1fr;
  }

  .globe-3d-copy {
    padding: 30px 28px 0;
  }

  .globe-3d-stage {
    min-height: 590px;
  }
}

@media (max-width: 520px) {
  .globe-3d-stage {
    min-height: 460px;
  }

  .globe-3d-copy {
    padding: 25px 20px 0;
  }

  .satellite-count {
    display: none;
  }
}
</style>
