import { createFileRoute } from '@tanstack/react-router'
import { ContentPage } from '@/components/pages/ContentPage'

export const Route = createFileRoute('/databases_/$databaseId/content/$contentId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { databaseId, contentId } = Route.useParams();
  
  return <ContentPage databaseId={databaseId} contentId={contentId} />;
} 