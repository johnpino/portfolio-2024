<!-- eslint-disable vue/no-v-html -->
<template>
  <div>
    <div class="max-w-[500px]">
      <div
        ref="scrollableAreaRef"
        class="rich-text h-80 overflow-y-scroll rounded-md bg-slate-50 p-4 flex gap-4 flex-col border mb-4"
      >
        <template v-if="queries?.length">
          <div class="flex gap-4 flex-wrap">
            <button
              v-for="(query, i) in queries"
              :key="query.value"
              class="group rounded-sm text-xs font-light flex-shrink-0 flex items-center transition-all bg-slate-100 disabled:bg-slate-50 disabled:text-slate-300"
              :class="{ 'hidden lg:flex': i > 2 }"
              :disabled="query.wasSent || isLoading || !isMounted"
              @click="sendQuery(query)"
            >
              <span class="px-3">{{ query.value }}</span>
              <div class="p-3 border-l border-solid border-slate-100 bg-slate-200 group-disabled:bg-slate-50 group-hover:bg-rose-500 group-hover:text-white rounded-tr-sm rounder-br-sm transition-all">
                <Icon
                  name="fa6-regular:paper-plane"
                  mode="svg"
                />
              </div>
            </button>
          </div>
          <hr class="border-slate-200">
        </template>
        <div
          v-for="message in messagesUI"
          :key="message.content?.toString()"
          ref="messagesRef"
          class="py-2 px-4 bg-slate-100 rounded-md font-light text-sm max-w-[85%]"
          :class="{ 'self-end bg-slate-200': message.role === 'user' }"
          v-html="message.content"
        />
        <div
          v-if="isLoading || answer.content"
          ref="answerRef"
          class="py-2 px-4 bg-slate-100 rounded-md font-light text-sm"
        >
          <template v-if="answer.content">
            <div v-html="answer.content" />
          </template>
          <template v-else>
            <Icon name="svg-spinners:180-ring-with-bg" /> <span class="italic">{{ loadingLabel }}</span>
          </template>
        </div>
      </div>
      <form
        class="grid grid-cols-[1fr_auto] gap-4 items-end mb-4"
        @submit.prevent="submitHandler"
      >
        <textarea
          ref="textareaRef"
          v-model="question"
          rows="1"
          maxlength="150"
          class="w-full border p-4 resize-none text-sm rounded-md"
          :disabled="isLoading || !isMounted"
          :placeholder="!isMounted ? 'Loading...' : inputPlaceholder"
          required
        />
        <button
          class="h-12 aspect-square bg-rose-500 rounded-full text-white text-xs font-bold disabled:bg-rose-200 flex justify-center items-center flex-shrink-0 transition-all hover:bg-rose-700 p-3"
          type="submit"
          :disabled="isLoading || !isMounted"
        >
          <Icon
            name="fa6-regular:paper-plane"
            mode="svg"
            size="1rem"
          />
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import autosize from 'autosize'
import type { MyChatUIProps } from './MyChatUIProps'

const { initialMessage, predefinedQueries } = defineProps<MyChatUIProps>()

const isMounted = ref(false)
const answerRef = ref<HTMLDivElement>()
const scrollableAreaRef = ref<HTMLDivElement>()
const question = ref()

const { sendMessage, answer, isLoading, messages } = useChat({ initialMessage })

const messagesUI = computed(() => messages.filter(message => message.role === 'user' || (message.role === 'assistant' && !message.tool_calls)))

watch(answer, useThrottle(() => {
  if (answerRef.value) answerRef.value.scrollIntoView({ behavior: 'smooth' })
}, 200), { deep: true })

watch(
  messages,
  async () => {
    await nextTick()

    if (scrollableAreaRef.value) {
      scrollableAreaRef.value.scrollTop = scrollableAreaRef.value.scrollHeight
    }
  },
  { deep: true },
)

// Adjust loading label based on loading state
let timeoutId: ReturnType<typeof setTimeout>

watch(isLoading, (newVal) => {
  if (!newVal) {
    clearTimeout(timeoutId)
    loadingLabel.value = '...'
  }

  if (newVal) {
    timeoutId = setTimeout(() => {
      loadingLabel.value = 'This might take a moment, please hang tight...'
    }, 2000)
  }
})

const submitHandler = async () => {
  const value = question.value
  question.value = null
  await nextTick()
  if (textareaRef.value) autosize.update(textareaRef.value)
  await sendMessage(value)
}

const loadingLabel = ref('...')

const queries: Array<{ value: string, wasSent: boolean }> = reactive(predefinedQueries?.map(query => ({ value: query, wasSent: false })) || [])

const sendQuery = async (query: { value: string, wasSent: boolean }) => {
  const foundQuery = queries.find(q => q.value === query.value)
  if (foundQuery) {
    foundQuery.wasSent = true
  }

  await sendMessage(query.value)
}

const textareaRef = ref<HTMLTextAreaElement>()

onMounted(() => {
  isMounted.value = true
  if (textareaRef.value) autosize(textareaRef.value)
})
</script>
