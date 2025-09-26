import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(authenticated)/org/$slug/(member)/(base-modules)/communication/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(authenticated)/org/$slug/(modules)/communication/"!</div>
}
