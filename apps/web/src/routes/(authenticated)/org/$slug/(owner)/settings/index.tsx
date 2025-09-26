import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(authenticated)/org/$slug/(owner)/settings/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(authenticated)/org/(owner)/settings/"!</div>
}
