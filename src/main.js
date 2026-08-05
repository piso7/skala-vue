import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)

// 스토어를 먼저 등록해야 하위 컴포넌트에서 전역 상태를 사용할 수 있다.
app.use(createPinia())
// router/index.js에 만든 주소 설정을 Vue 앱에 연결한다.
app.use(router)
app.use(ElementPlus)

app.mount('#app')
