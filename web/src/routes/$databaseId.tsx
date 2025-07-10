import { createFileRoute } from '@tanstack/react-router'
import { DatabasePage } from '@/components/pages/DatabasePage'

export const Route = createFileRoute('/$databaseId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { databaseId } = Route.useParams();
  
  return <DatabasePage databaseId={databaseId} />;
}
