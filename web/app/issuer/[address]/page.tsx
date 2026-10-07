import { IssuerView } from "@/components/IssuerView";

export function generateStaticParams() {
  return [{ address: "0x794678AD7e8B6c87dAb33303a3A512c821e6De9A" }];
}

export default async function IssuerPage({ params }: { params: Promise<{ address: string }> }) {
  const { address } = await params;
  return <IssuerView address={address} />;
}
