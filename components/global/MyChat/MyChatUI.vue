<template>
  <div class="max-w-[500px]">
    <div class="max-h-[300px] overflow-y-scroll rounded-t-md bg-slate-50 p-4 flex gap-4 flex-col border border-b-0">
      <div
v-for="message in messages" :key="message.content" class="p-2 bg-slate-100 rounded-md font-light text-sm"
        :class="message.role === 'user' && 'self-end bg-slate-200'">
        {{ message.content }}
      </div>
      <div v-if="answer.content || isLoading" ref="answerRef" class="p-2 bg-slate-100 rounded-md font-light text-sm">{{ isLoading ? '...' : answer.content }}</div>
    </div>
    <form class="flex gap-4 flex-col" @submit.prevent="submitHandler">
      <textarea
v-model="question" class="border border-t-0 p-4 resize-none text-sm rounded-sm"
        :placeholder="inputPlaceholder" required />
      <button class="py-2 px-4 w-fit ml-auto bg-rose-500 rounded-sm text-white uppercase text-xs font-bold" type="submit">{{ send }}</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { MyChatUIProps } from './MyChatUIProps'
import { throttle } from 'lodash';

const { initialMessage } = defineProps<MyChatUIProps>()

const answerRef = ref<HTMLDivElement>()
const question = ref()

const { sendMessage, answer, isLoading, messages } = useOpenai({ initialMessage })

watch(answer, throttle(() => {
  if(answerRef.value) answerRef.value.scrollIntoView({ behavior: 'smooth' })
}, 200), { deep: true })

const submitHandler = async () => {
  const value  = question.value
  question.value = null
  await sendMessage(value)
}

</script>