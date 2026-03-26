export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;

  return (
    <div>
      <h1 className="text-2xl font-bold">Order Detail</h1>
      <p className="mt-2 text-gray-500">Order {uuid} placeholder</p>
    </div>
  );
}
