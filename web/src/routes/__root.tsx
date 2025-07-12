import { createRootRoute, Outlet } from '@tanstack/react-router'
import { NotificationProvider } from '@/context/NotificationContext'
import { AuthProvider } from '@/context/AuthContext'
import { SidebarMenuProvider } from '@/context/SidebarMenuContext'
import { TranslationProvider } from '@/context/TranslationContext'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <TranslationProvider>
          <SidebarMenuProvider>
            <div className="min-h-screen bg-background text-foreground">
              <Outlet />
            </div>
          </SidebarMenuProvider>
        </TranslationProvider>
      </NotificationProvider>
    </AuthProvider>
  )
}