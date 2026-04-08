import { SignIn } from "@clerk/clerk-react";

export default function Login() {
  return (
    <div className="page auth-page">
      <SignIn routing="hash" afterSignInUrl="/" />
    </div>
  );
}
