"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { GraphPersistenceControls } from "@/features/graph-io/useGraphPersistence";

const PORTABLE_GRAPH_ID = /^[a-z0-9][a-z0-9_-]{0,62}$/;

export function RemoteGraphDialog({
  persistence,
  canCreate = true,
}: {
  persistence: GraphPersistenceControls;
  canCreate?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [project, setProject] = useState("");
  const [graphId, setGraphId] = useState("");

  function handleOpenChange(next: boolean): void {
    setOpen(next);
    if (next) {
      setProject("");
      void persistence.loadProjects().then((projects) => {
        const first = projects[0];
        if (!first) return;
        setProject(first);
        return persistence.loadGraphs(first);
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="sm"
          disabled={persistence.status === "loading" || persistence.status === "saving"}
        >
          Browse hosted graphs
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Hosted projects and graphs</DialogTitle>
          <DialogDescription>
            Open a canonical graph, or attach the current local draft by creating a new graph.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2">
          <Label htmlFor="hosted-project">Logical project</Label>
          <select
            id="hosted-project"
            className="h-9 rounded-md border bg-background px-3 text-sm"
            value={project}
            disabled={persistence.browsing}
            onChange={(event) => {
              const selected = event.target.value;
              setProject(selected);
              void persistence.loadGraphs(selected);
            }}
          >
            <option value="" disabled>
              Choose a project
            </option>
            {persistence.projects.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="max-h-72 overflow-auto rounded-md border">
          {persistence.graphs.length === 0 ? (
            <p className="p-3 text-sm text-muted-foreground">
              {persistence.browsing ? "Loading graphs…" : "No graphs in this project."}
            </p>
          ) : (
            <ul className="divide-y">
              {persistence.graphs.map((graph) => (
                <li key={`${graph.project}/${graph.graph}`} className="flex items-center gap-3 p-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{graph.graph}</div>
                    <div
                      className="truncate font-mono text-[11px] text-muted-foreground"
                      title={graph.content_sha256}
                    >
                      Content SHA-256: {graph.content_sha256}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      void persistence.open({ project: graph.project, graph: graph.graph });
                      setOpen(false);
                    }}
                  >
                    Open
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {persistence.nextCursor !== null ? (
          <Button
            variant="ghost"
            size="sm"
            disabled={persistence.browsing || project === ""}
            onClick={() => void persistence.loadGraphs(project, true)}
          >
            Load more
          </Button>
        ) : null}

        {!persistence.attached ? (
          <div className="grid gap-2 rounded-md border p-3">
            <Label htmlFor="new-hosted-graph">Create from current local draft</Label>
            <div className="flex gap-2">
              <Input
                id="new-hosted-graph"
                value={graphId}
                placeholder="customer-sync"
                maxLength={63}
                onChange={(event) => setGraphId(event.target.value)}
              />
              <Button
                disabled={
                  !canCreate ||
                  project === "" ||
                  !PORTABLE_GRAPH_ID.test(graphId) ||
                  persistence.status === "saving"
                }
                onClick={() => {
                  void persistence.create(project, graphId);
                  setOpen(false);
                }}
              >
                Create
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {canCreate
                ? "Use lowercase letters, numbers, hyphens, or underscores; begin with a letter or number."
                : "This hosted role does not advertise graph.edit; creating graphs is unavailable."}
            </p>
          </div>
        ) : null}

        {persistence.browseError ? (
          <p role="alert" className="text-sm text-destructive">
            {persistence.browseError}
          </p>
        ) : null}
        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  );
}
