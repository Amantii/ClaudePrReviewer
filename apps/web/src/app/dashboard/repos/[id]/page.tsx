import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ConfigForm } from "@/components/ConfigForm";

interface PageProps {
  params: { id: string };
}

export default async function RepoConfigPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  const repoFullName = decodeURIComponent(params.id);

  const repo = await prisma.repoConfig.findUnique({
    where: { repoFullName },
  });

  if (!repo) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            &larr; Back to dashboard
          </Link>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-6">
            {repo.repoFullName}
          </h1>

          <ConfigForm
            repoFullName={repo.repoFullName}
            ignorePaths={repo.ignorePaths}
            customInstructions={repo.customInstructions}
            minSeverity={repo.minSeverity}
          />
        </div>
      </div>
    </main>
  );
}
