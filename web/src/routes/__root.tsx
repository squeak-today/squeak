import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { AuthProvider } from '../context/AuthContext'


export const Route = createRootRoute({
  component: () => (
    <>
      <AuthProvider>
        <div className="p-2 flex gap-2">
          <Link to="/" className="[&.active]:font-bold">
            Home
          </Link>{' '}
          <Link to="/login" className="[&.active]:font-bold">
            Login
          </Link>
        </div>
      </AuthProvider>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
})