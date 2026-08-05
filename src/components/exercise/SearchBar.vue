<script setup>
defineProps({
  currentQuery: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update-query'])

// 입력값을 부모로 보내 실제 카드 필터와 주소 검색어를 함께 바꾼다.
const changeQuery = (event) => {
  emit('update-query', event.target.value)
}
</script>

<template>
  <div class="search-bar">
    <h3>도시 검색</h3>
    <input type="text" :value="currentQuery" @input="changeQuery" placeholder="검색할 도시 이름 입력" />
    <p>
      검색 중인 도시: <strong>{{ currentQuery }}</strong>
    </p>
  </div>
</template>

<style scoped>
.search-bar h3 {
  margin: 0 0 12px;
  color: #17324d;
  font-size: 18px;
}

.search-bar input {
  box-sizing: border-box;
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #b9cbd8;
  border-radius: 9px;
  color: #17324d;
  font-size: 15px;
  outline: none;
}

.search-bar input:focus {
  border-color: #008f91;
  box-shadow: 0 0 0 3px rgba(0, 143, 145, 0.12);
}

.search-bar p {
  margin: 12px 0 0;
  color: #587087;
  font-size: 14px;
}
</style>
