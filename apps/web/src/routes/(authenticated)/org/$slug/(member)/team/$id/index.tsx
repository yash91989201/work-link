import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(authenticated)/org/$slug/(member)/team/$id/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(authenticated)/org/$slug/team/$slug/"!</div>
}
