<template>
  <section class="base-dashboard-card">
    <slot></slot>
  </section>
</template>

<style scoped>
.base-dashboard-card {
  margin-bottom: 18px;
  padding: 22px;
  border: 1px solid #dce7ee;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 8px 22px rgba(26, 62, 87, 0.06);
}
</style>
