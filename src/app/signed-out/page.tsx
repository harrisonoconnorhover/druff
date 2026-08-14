import { OidcCallbackPage } from "@/features/hosted-control/OidcCallbackPage";

export default function SignOutCallbackPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <OidcCallbackPage kind="signout" />
    </main>
  );
}
