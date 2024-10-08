// https://nuxt.com/docs/api/configuration/nuxt-config

import { fileURLToPath } from 'url'

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  modules: ['@nuxtjs/tailwindcss', '@nuxt/eslint', 'nuxt-lodash', '@nuxt/icon'],
  alias: {
    'contentful-types': fileURLToPath(new URL('./contentful/types', import.meta.url)),
  },
  runtimeConfig: {
    contentfulAPIBaseUrl: process.env.CONTENTFUL_API_BASE_URL,
    contentfulAPIEndpoint: process.env.CONTENTFUL_API_ENDPOINT,
    contentfulSpaceID: process.env.CONTENTFUL_SPACE_ID,
    contentfulEnvironment: process.env.CONTENTFUL_ENVIRONMENT,
    contentfulDeliveryAccessToken: process.env.CONTENTFUL_DELIVERY_ACCESS_TOKEN,
    contentfulWebhookSecret: process.env.CONTENTFUL_WEBHOOK_SECRET,
    openaiApiKey: process.env.OPENAI_API_KEY,
    assistantId: process.env.OPENAI_ASSITANT_ID,
    mailgunApiKey: process.env.MAILGUN_API_KEY,
    mailgunDomain: process.env.MAILGUN_DOMAIN,
    pineconeApiKey: process.env.PINECONE_API_KEY,
    pineconeIndex: process.env.PINECONE_INDEX,
    pdfShiftApiKey: process.env.PDFSHIFT_API_KEY,
    public: {
      backSoon: process.env.PUBLIC_BACK_SOON,
      maintenanceUrl: process.env.PUBLIC_MAINTENANCE_URL,
    },
  },
  eslint: {
    config: {
      stylistic: true,
    },
  },
  nitro: {
    vercel: {
      functions: {
        'api/create/chat.ts': {
          maxDuration: 20,
        },
      },
    },
    serverAssets: [
      {
        baseName: 'templates',
        dir: './assets/templates',
      },
    ],
  },
  icon: {
    serverBundle: {
      collections: ['svg-spinners', 'fa6-regular'],
    },
  },
  tailwindcss: {
    config: {
      safelist: ['text-rose-500'],
    },
  },
  experimental: {
    asyncContext: true,
  },
})
