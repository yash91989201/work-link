import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(authenticated)/org/$slug/(member)/(base-modules)/attendance/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      Hello "/(authenticated)/org/$slug/(member)/(base-modules)/attendance/"!
    </div>
  )
}
