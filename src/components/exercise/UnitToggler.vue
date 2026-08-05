<script setup>
import { useConfigStore } from '@/stores/configStore'

const configStore = useConfigStore()
</script>

<template>
  <div class="unit-toggler">
    <span>날씨 단위 <strong>{{ configStore.unit === 'celsius' ? '섭씨(℃)' : '화씨(℉)' }}</strong></span>
    <button class="toggle-btn" @click="configStore.toggleUnit">단위변경</button>
  </div>
</template>

<style scoped>
.unit-toggler {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  margin-left: auto;
  color: #587087;
  font-size: 13px;
}

.unit-toggler strong {
  color: #17324d;
}

.toggle-btn {
  padding: 7px 11px;
  border: 1px solid #008f91;
  border-radius: 7px;
  background-color: #008f91;
  color: white;
  cursor: pointer;
  font-weight: bold;
}

.toggle-btn:hover {
  background-color: #007477;
}
</style>
