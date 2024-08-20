// https://nuxt.com/docs/api/configuration/nuxt-config

import { fileURLToPath } from 'url'

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss", "@nuxt/eslint"],
  alias: {
    'contentful-types': fileURLToPath(new URL('./contentful/types', import.meta.url)),
  },
  runtimeConfig: {
    contentfulAPIBaseUrl: process.env.CONTENTFUL_API_BASE_URL,
    contentfulAPIEndpoint: process.env.CONTENTFUL_API_ENDPOINT,
    contentfulSpaceID: process.env.CONTENTFUL_SPACE_ID,
    contentfulEnvironment: process.env.CONTENTFUL_ENVIRONMENT,
    contentfulDeliveryAccessToken: process.env.CONTENTFUL_DELIVERY_ACCESS_TOKEN,
    public: {
      backSoon: process.env.PUBLIC_BACK_SOON,
      maintenanceUrl: process.env.PUBLIC_MAINTENANCE_URL
    }
  }
})
