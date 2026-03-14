import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RepoCard } from "@/components/RepoCard";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  const repos = await prisma.repoConfig.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Repositories</h1>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Sign out
            </button>
          </form>
        </div>

        {repos.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg">No repositories configured yet.</p>
            <p className="mt-2 text-sm">
              Install the GitHub App on a repository to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {repos.map((repo) => (
              <RepoCard
                key={repo.repoFullName}
                repoFullName={repo.repoFullName}
                enabled={repo.enabled}
                minSeverity={repo.minSeverity}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
