<template>
  <div class="text-gray-800 text-center max-w-[500px]">
    <h1 class="text-5xl lg:text-6xl font-bold mb-8">{{ title }}</h1>
    <h2 class="text-base mb-4">{{ subtitle }}</h2>
    <p class="text-sm italic text-gray-600">{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
import type { MyHeroUIProps } from './MyHeroUIProps';

defineProps<MyHeroUIProps>()

</script>