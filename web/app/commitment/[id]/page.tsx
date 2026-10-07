import { CommitmentView } from "@/components/CommitmentView";

export function generateStaticParams() {
  return [0, 1, 2, 3, 4, 5].map((id) => ({ id: String(id) }));
}

export default async function CommitmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CommitmentView id={id} />;
}
