<template>
  <div>
    <component 
      :is="feature?.sys.contentType.sys.id!" v-for="feature in features" :key="feature?.sys.id"
      v-bind="feature" />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug
const contentType = 'page'

const { data } = await useFetch(`/api/contentful-page?contentType=${contentType}&slug=${slug}`)

useHeadSafe({
  title: data.value?.title,
  meta: [
    {
      name: 'description',
      content: data.value?.description
    }
  ]
})

useServerSeoMeta({
  title: data.value?.title,
  ogTitle: data.value?.title,
  description: data.value?.description,
  ogDescription: data.value?.description
})

const features = computed(() => data.value?.features)

</script>
