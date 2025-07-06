import { createRootRoute, Outlet } from '@tanstack/react-router'
import { NotificationProvider } from '@/context/NotificationContext'
import { AuthProvider } from '@/context/AuthContext'
import { SidebarMenuProvider } from '@/context/SidebarMenuContext'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <SidebarMenuProvider>
          <div className="min-h-screen bg-background text-foreground">
            <Outlet />
          </div>
        </SidebarMenuProvider>
      </NotificationProvider>
    </AuthProvider>
  )
}