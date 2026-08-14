import { GraphEditor } from "@/features/graph-io/GraphEditor";
import { Inspector } from "@/features/pipeline-canvas/inspector/Inspector";
import {
  HostedControlGate,
  HostedControlStatus,
} from "@/features/hosted-control/HostedControlProvider";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <header className="flex items-center justify-between gap-4 border-b px-4 py-3">
        <div>
          <h1 className="text-sm font-semibold">Druff</h1>
          <p className="text-xs text-muted-foreground">Dander pipeline-graph editor</p>
        </div>
        <HostedControlStatus />
      </header>
      <HostedControlGate>
        <div className="flex min-w-0 flex-1">
          <div className="min-w-0 flex-1">
            <GraphEditor />
          </div>
          <Inspector />
        </div>
      </HostedControlGate>
    </main>
  );
}
