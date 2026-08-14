import { OidcCallbackPage } from "@/features/hosted-control/OidcCallbackPage";

export default function SignInCallbackPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <OidcCallbackPage kind="signin" />
    </main>
  );
}
