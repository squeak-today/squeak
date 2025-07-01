import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/login')({
  component: Login,
})

function Login() {
  return <div className="p-2">Hello from Login!</div>
}