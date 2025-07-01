import { createRootRoute, Outlet } from '@tanstack/react-router'
import { NotificationProvider } from '@/context/NotificationContext'
import { AuthProvider } from '@/context/AuthContext'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <div className="min-h-screen bg-background text-foreground">
          <Outlet />
        </div>
      </NotificationProvider>
    </AuthProvider>
  )
}