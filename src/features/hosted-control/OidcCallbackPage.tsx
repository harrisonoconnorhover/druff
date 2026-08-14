"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SIGNIN_CALLBACK_PATH, SIGNOUT_CALLBACK_PATH } from "@/features/hosted-control/bootstrap";
import { useHostedControl } from "@/features/hosted-control/HostedControlProvider";
import { HostedWorkspace } from "@/features/hosted-control/HostedWorkspace";

export function OidcCallbackPage({ kind }: { kind: "signin" | "signout" }) {
  const control = useHostedControl();
  const started = useRef(false);
  const callbackUrl = useRef<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (callbackUrl.current !== null) return;
    callbackUrl.current = window.location.href;
    const cleanPath = kind === "signin" ? SIGNIN_CALLBACK_PATH : SIGNOUT_CALLBACK_PATH;
    window.history.replaceState(null, "", cleanPath);
  }, [kind]);

  useEffect(() => {
    if (control.mode !== "hosted" || started.current || callbackUrl.current === null) return;
    started.current = true;
    const complete =
      kind === "signin"
        ? control.completeSignIn(callbackUrl.current)
        : control.completeSignOut(callbackUrl.current);
    void complete
      .then(() => {
        window.history.replaceState(null, "", "/");
        setCompleted(true);
      })
      .catch(() => {
        setFailed(true);
      });
  }, [control, kind]);

  if (completed) return <HostedWorkspace />;

  if (control.mode === "loading") {
    return <p className="text-sm text-muted-foreground">Verifying the identity response…</p>;
  }
  if (control.mode === "loopback") {
    return (
      <div className="text-sm">
        <h1 className="font-semibold">Hosted sign-in is not configured</h1>
        <p className="mt-2 text-muted-foreground">
          This Druff deployment is in explicit loopback/offline mode.
        </p>
        <Link className="mt-4 inline-block underline" href="/">
          Return to Druff
        </Link>
      </div>
    );
  }
  if (control.mode === "error") {
    return (
      <div role="alert" className="text-sm">
        <h1 className="font-semibold">Hosted configuration is blocked</h1>
        <p className="mt-2 text-muted-foreground">{control.error}</p>
      </div>
    );
  }
  if (failed) {
    return (
      <div role="alert" className="text-sm">
        <h1 className="font-semibold">
          {kind === "signin" ? "Sign-in could not be verified" : "Sign-out could not be verified"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          No hosted request was sent. Return to Druff and start a new identity-provider flow.
        </p>
        <Link className="mt-4 inline-block underline" href="/">
          Return to Druff
        </Link>
      </div>
    );
  }
  return (
    <p className="text-sm text-muted-foreground">
      {kind === "signin" ? "Completing sign-in…" : "Completing sign-out…"}
    </p>
  );
}
