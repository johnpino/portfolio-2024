<template>
  <div>
    <h1 class="font-bold text-center mb-4">Test OpenAI</h1>
    <div class="max-w-[500px] mx-auto mb-8">
      <div v-for="message in messages" :key="message.content" class="mb-8">
        {{ message.content }}
      </div>
    </div>

    <div class="max-w-[500px] mx-auto mb-8">{{ requestStatus === 'pending' ? 'Loading' : answer.content }}</div>
    <form class=" flex gap-4 flex-col max-w-[500px] mx-auto" @submit.prevent="submitHandler">
      <textarea v-model="question" class="border" />
      <button type="submit">Send</button>
    </form>


  </div>
</template>

<script lang="ts" setup>

const question = ref()

const { sendMessage, answer, requestStatus, messages } = useOpenai()

const submitHandler = async () => {
  await sendMessage(question.value)
  question.value = null
}

</script>