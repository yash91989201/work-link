import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(authenticated)/org/$slug/(member)/team/$id/module/$slug/feature/$slug/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      Hello "/(authenticated)/org/$slug/team/$slug/module/$slug/feature/$slug/"!
    </div>
  )
}
