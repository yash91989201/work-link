import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(authenticated)/org/$slug/(admin)/dashboard/attendance/analytics',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      Hello "/(authenticated)/org/$slug/(admin)/dashboard/attendance/analytics"!
    </div>
  )
}
