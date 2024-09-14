<!-- eslint-disable vue/no-v-html -->
<template>
  <div>
    <template v-if="queries?.length">
      <div class="max-w-[500px] overflow-x-scroll mb-2 pb-2">
        <div class="flex gap-4">
          <template
            v-for="query in queries"
            :key="query"
          >
            <button
              class="py-2 px-4 rounded-sm text-xs font-light flex-shrink-0 flex gap-2 items-center transition-all"
              :class="query.wasSent ? 'bg-slate-50 text-slate-300' : 'bg-slate-200'"
              :disabled="query.wasSent || isLoading || !isMounted"
              @click="sendQuery(query)"
            >
              {{ query.value }}
              <Icon
                name="fa6-regular:paper-plane"
                class="mr-2"
              />
            </button>
          </template>
        </div>
      </div>
    </template>
    <div class="max-w-[500px]">
      <div
        ref="scrollableAreaRef"
        class="rich-text max-h-[300px] overflow-y-scroll rounded-t-md bg-slate-50 p-4 flex gap-4 flex-col border border-b-0"
      >
        <div
          v-for="message in messagesUI"
          :key="message.content?.toString()"
          ref="messagesRef"
          class="py-2 px-4 bg-slate-100 rounded-md font-light text-sm"
          :class="message.role === 'user' && 'self-end bg-slate-200'"
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
        class="flex gap-4 flex-col"
        @submit.prevent="submitHandler"
        @keyup.enter="submitHandler"
      >
        <textarea
          v-model="question"
          maxlength="150"
          class="border border-t-0 p-4 resize-none text-sm rounded-sm"
          :disabled="!isMounted"
          :placeholder="!isMounted ? 'Loading...' : inputPlaceholder"
          required
        />
        <button
          class="py-2 px-4 w-fit ml-auto bg-rose-500 rounded-sm text-white text-xs font-bold disabled:bg-rose-200"
          type="submit"
          :disabled="isLoading || !isMounted"
        >
          {{ send }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
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

onMounted(() => {
  isMounted.value = true
})
</script>
