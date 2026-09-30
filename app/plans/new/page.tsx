import NewPlanForm from './NewPlanForm'

export default async function NewPlanPage({
  searchParams,
}: {
  searchParams: Promise<{
    mountainId?: string
    date?: string
  }>
}) {
  const params = await searchParams

  return (
    <NewPlanForm
      mountainIdFromUrl={params.mountainId ?? ''}
      dateFromUrl={params.date ?? ''}
    />
  )
}