export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;

  return (
    <div>
      <h1 className="text-2xl font-bold">Quote Detail</h1>
      <p className="mt-2 text-gray-500">Quote {uuid} placeholder</p>
    </div>
  );
}
