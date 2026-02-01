import DocWorkspace from "@/components/DocWorkspace";

interface DocPageProps {
  params: { id: string };
}

export default function DocPage({ params }: DocPageProps) {
  return <DocWorkspace docId={params.id} />;
}
