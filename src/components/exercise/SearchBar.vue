<script setup>
defineProps({
  currentQuery: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update-query'])

const changeQuery = (event) => {
  emit('update-query', event.target.value)
}
</script>

<template>
  <div class="search-bar">
    <h3>🔍 도시 검색</h3>
    <input type="text" :value="currentQuery" @input="changeQuery" placeholder="검색할 도시 이름 입력" />
    <p>
      검색 중인 도시: <strong>{{ currentQuery }}</strong>
    </p>
  </div>
</template>

<style scoped>
.search-bar h3 {
  margin-top: 0;
}

.search-bar input {
  box-sizing: border-box;
  width: 100%;
  padding: 9px;
  border: 1px solid #ced4da;
  border-radius: 5px;
}

.search-bar p {
  margin-bottom: 0;
}
</style>
