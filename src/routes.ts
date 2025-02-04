import { createRouter, createRoute, createRootRoute } from '@tanstack/react-router'
import { HomePage } from './pages/HomePage'
import { GamePage } from './pages/GamePage'

const rootRoute = createRootRoute()

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})

const gameRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/game',
  component: GamePage,
})

const routeTree = rootRoute.addChildren([indexRoute, gameRoute])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}