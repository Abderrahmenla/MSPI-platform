export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;

  return (
    <div>
      <h1 className="text-2xl font-bold">Customer Detail</h1>
      <p className="mt-2 text-gray-500">Customer {uuid} placeholder</p>
    </div>
  );
}
