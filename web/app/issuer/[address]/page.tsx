import { IssuerView } from "@/components/IssuerView";

export default async function IssuerPage({ params }: { params: Promise<{ address: string }> }) {
  const { address } = await params;
  return <IssuerView address={address} />;
}
