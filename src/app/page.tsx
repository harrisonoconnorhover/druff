import { PipelineCanvas } from "@/features/pipeline-canvas/PipelineCanvas";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <header className="border-b px-4 py-3">
        <h1 className="text-sm font-semibold">Druff</h1>
        <p className="text-xs text-muted-foreground">Dander pipeline-graph editor</p>
      </header>
      <div className="flex-1">
        <PipelineCanvas />
      </div>
    </main>
  );
}
