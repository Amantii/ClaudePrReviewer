import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { SignInButton } from "@/components/SignInButton";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center space-y-8 p-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">PR Reviewer</h1>
          <p className="mt-4 text-lg text-gray-600">
            AI-powered code reviews for your GitHub pull requests, powered by
            Claude.
          </p>
        </div>
        <SignInButton />
      </div>
    </main>
  );
}
