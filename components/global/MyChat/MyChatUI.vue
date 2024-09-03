<template>
  <div>
    <div>
      <div v-for="message in messages" :key="message.content" class="mb-8" >
        {{ message.content }}
      </div>
    </div>
    <div class="mb-8">{{ requestStatus === 'pending' ? 'Loading' : answer.content }}</div>
    <form class="flex gap-4 flex-col" @submit.prevent="submitHandler">
      <textarea v-model="question" class="border" />
      <button type="submit">{{ send }}</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { MyChatUIProps } from './MyChatUIProps'

defineProps<MyChatUIProps>()

const question = ref()

const { sendMessage, answer, requestStatus, messages } = useOpenai()

const submitHandler = async () => {
  await sendMessage(question.value)
  question.value = null
}

</script>