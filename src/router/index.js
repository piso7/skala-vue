import { createRouter, createWebHistory } from 'vue-router'

// 주소(path)마다 어떤 화면을 보여줄지 정하는 목록
const routes = [
  {
    path: '/',
    name: 'WeatherHome',
    // 같은 주소를 사용하더라도 과제 4와 과제 5에는 서로 다른 화면을 넣는다.
    components: {
      task4: () => import('../views/WeatherHomeView.vue'),
      task5: () => import('../views/WeatherLiveHomeView.vue'),
    },
  },
  {
    path: '/about',
    name: 'WeatherAbout',
    components: {
      task4: () => import('../views/WeatherAboutView.vue'),
      task5: () => import('../views/WeatherLiveAboutView.vue'),
    },
  },
  {
    // :cityId 자리에 city_01, city_02 같은 도시 번호가 들어간다.
    path: '/weather/:cityId',
    name: 'WeatherDetail',
    components: {
      // 과제 4는 기본 데이터, 과제 5는 API 데이터를 사용하는 상세 화면이다.
      task4: () => import('../views/WeatherRouterDetailView.vue'),
      task5: () => import('../views/WeatherDetailView.vue'),
    },
  },
  {
    // 위 주소들과 일치하지 않으면 NotFound 화면을 보여준다.
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    components: {
      task4: () => import('../views/NotFoundView.vue'),
      task5: () => import('../views/NotFoundView.vue'),
    },
  },
]

const router = createRouter({
  // 배포 주소의 기본 경로를 함께 넘겨 새로고침해도 같은 라우트를 찾게 한다.
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
