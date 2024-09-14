<template>
  <div class="text-gray-800 text-center max-w-[500px]">
    <h1 class="text-5xl lg:text-6xl font-bold mb-8">
      {{ title }}
    </h1>
    <h2 class="text-base text-gray-600">
      {{ subtitle }}
    </h2>
    <p
      v-if="description"
      class="text-sm italic text-gray-600 mt-4"
    >
      {{ description }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { MyHeroUIProps } from './MyHeroUIProps'

defineProps<MyHeroUIProps>()
</script>
