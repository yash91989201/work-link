import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(authenticated)/org/$slug/(admin)/dashboard/')(
  {
    component: RouteComponent,
  },
)

function RouteComponent() {
  return <div>Hello "/(authenticated)/org/(admin)/dashboard/"!</div>
}
