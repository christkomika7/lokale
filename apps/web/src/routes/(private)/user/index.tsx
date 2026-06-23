import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(private)/user/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(private)/user/"!</div>
}
