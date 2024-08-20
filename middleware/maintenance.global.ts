export default defineNuxtRouteMiddleware((to) => {
    const config = useRuntimeConfig()

    if (to.path !== config.public.maintenanceUrl && config.public.backSoon === 'true') return navigateTo(config.public.maintenanceUrl, { redirectCode: 503 })

})
