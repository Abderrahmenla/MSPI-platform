export default async function ProductEditPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;

  return (
    <div>
      <h1 className="text-2xl font-bold">Product Edit</h1>
      <p className="mt-2 text-gray-500">Product {uuid} placeholder</p>
    </div>
  );
}
