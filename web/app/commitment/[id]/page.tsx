import { CommitmentView } from "@/components/CommitmentView";

export default async function CommitmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CommitmentView id={id} />;
}
