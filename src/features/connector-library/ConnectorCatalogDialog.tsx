"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { BookOpen, Copy, PackageSearch } from "lucide-react";
import type { PluginCatalogConnector } from "@/features/connector-library/catalog";
import {
  getPluginCatalogSnapshot,
  subscribePluginCatalog,
} from "@/features/connector-library/catalog-store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** Produces the explicit operator steps Druff copies without executing or persisting them. */
export function connectorSetupInstructions(connector: PluginCatalogConnector): string {
  return [
    "plugins:",
    `  ${connector.id}:`,
    `    distribution: ${connector.distribution}`,
    `    version: ${connector.version}`,
    "",
    "dander plugins install",
    "# Restart dander graph serve so the manifest-declared plugin becomes active.",
  ].join("\n");
}

/** Searchable, display-only catalog backed by Dander's curated package metadata. */
export function ConnectorCatalogDialog(): React.JSX.Element {
  const connectors = useSyncExternalStore(
    subscribePluginCatalog,
    getPluginCatalogSnapshot,
    getPluginCatalogSnapshot,
  );
  const [query, setQuery] = useState("");
  const [copyStatus, setCopyStatus] = useState<{ id: string; failed: boolean } | null>(null);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return connectors;
    return connectors.filter((connector) =>
      [connector.display_name, connector.id, connector.description, connector.distribution].some(
        (value) => value.toLocaleLowerCase().includes(normalized),
      ),
    );
  }, [connectors, query]);

  async function copySetup(connector: PluginCatalogConnector): Promise<void> {
    try {
      await navigator.clipboard.writeText(connectorSetupInstructions(connector));
      setCopyStatus({ id: connector.id, failed: false });
    } catch {
      setCopyStatus({ id: connector.id, failed: true });
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full justify-start">
          <PackageSearch />
          Browse catalog
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Connector catalog</DialogTitle>
          <DialogDescription>
            Curated packages published on PyPI. Druff can copy setup steps, but it never installs a
            package or changes dander.yaml.
          </DialogDescription>
        </DialogHeader>
        <Input
          aria-label="Search connector catalog"
          placeholder="Search connectors"
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
        />
        {filtered.length === 0 ? (
          <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            {connectors.length === 0
              ? "Open a graph from a Dander version that exposes the plugin catalog."
              : "No connectors match that search."}
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {filtered.map((connector) => (
              <article key={connector.id} className="flex flex-col gap-3 rounded-xl border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{connector.display_name}</h3>
                    <p className="text-xs text-muted-foreground">{connector.description}</p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2 py-1 text-[0.65rem] font-semibold whitespace-nowrap",
                      connector.installed
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {connector.installed
                      ? `Installed ${connector.installed_version}`
                      : "Not installed"}
                  </span>
                </div>
                <dl className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 text-xs">
                  <dt className="text-muted-foreground">Package</dt>
                  <dd className="font-mono break-all">
                    {connector.distribution}=={connector.version}
                  </dd>
                  <dt className="text-muted-foreground">Dander</dt>
                  <dd>
                    {connector.dander_specifier} ·{" "}
                    {connector.compatible ? "compatible" : "upgrade required"}
                  </dd>
                  <dt className="text-muted-foreground">Support</dt>
                  <dd>{connector.support_status}</dd>
                  <dt className="text-muted-foreground">Validation</dt>
                  <dd>{connector.validation_status}</dd>
                </dl>
                <div className="mt-auto flex flex-wrap items-center gap-1">
                  <Button asChild variant="ghost" size="xs">
                    <a href={connector.documentation_url} target="_blank" rel="noreferrer">
                      <BookOpen /> Docs
                    </a>
                  </Button>
                  <Button asChild variant="ghost" size="xs">
                    <a href={connector.pypi_url} target="_blank" rel="noreferrer">
                      PyPI
                    </a>
                  </Button>
                  <Button asChild variant="ghost" size="xs">
                    <a href={connector.repository_url} target="_blank" rel="noreferrer">
                      Repository
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    className="ml-auto"
                    onClick={() => void copySetup(connector)}
                  >
                    <Copy />
                    {copyStatus?.id === connector.id
                      ? copyStatus.failed
                        ? "Copy failed"
                        : "Copied"
                      : "Copy setup"}
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
