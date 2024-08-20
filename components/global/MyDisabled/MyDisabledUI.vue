<template>
  <div class="h-screen flex justify-center items-center">
    <div class="text-gray-800 text-center">
      <h1 class="text-4xl font-bold">{{ heading1stRow }} <br>
        <span class="text-6xl font-bold">{{ heading2ndRow }}</span>
      </h1>
      <h2 class="text-base mb-3">{{ subheading }}</h2>
      <p class="text-sm italic text-gray-600">{{ description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">

import type { MyDisabledUIProps } from './MyDisabledUIProps'

defineProps<MyDisabledUIProps>()

</script>