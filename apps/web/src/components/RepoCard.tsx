"use client";

import Link from "next/link";
import { useState } from "react";

interface RepoCardProps {
  repoFullName: string;
  enabled: boolean;
  minSeverity: string;
}

export function RepoCard({ repoFullName, enabled: initialEnabled, minSeverity }: RepoCardProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [loading, setLoading] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

  async function toggleEnabled() {
    setLoading(true);
    try {
      const res = await fetch(
        `${apiUrl}/repos/${encodeURIComponent(repoFullName)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enabled: !enabled }),
        }
      );
      if (res.ok) {
        setEnabled(!enabled);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{repoFullName}</p>
        <p className="text-sm text-gray-500 mt-0.5">
          Min severity: <span className="font-medium">{minSeverity}</span>
        </p>
      </div>
      <div className="flex items-center gap-4 ml-4">
        <button
          onClick={toggleEnabled}
          disabled={loading}
          aria-label={enabled ? "Disable" : "Enable"}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 ${
            enabled ? "bg-blue-600" : "bg-gray-200"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <Link
          href={`/dashboard/repos/${encodeURIComponent(repoFullName)}`}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Configure
        </Link>
      </div>
    </div>
  );
}
