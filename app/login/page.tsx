import { Suspense } from "react";
import { AuthPage } from "@/components/AuthPage";

export default function LoginRoute() {
  // <Suspense> is required because AuthPage calls useSearchParams() to read
  // the ?redirect=… param the proxy sets when bouncing unauthenticated users.
  return (
    <Suspense fallback={null}>
      <AuthPage mode="login" />
    </Suspense>
  );
}
