"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ConfigFormProps {
  repoFullName: string;
  ignorePaths: string[];
  customInstructions: string | null;
  minSeverity: string;
}

const severityOptions = ["critical", "warning", "suggestion", "praise"] as const;

export function ConfigForm({
  repoFullName,
  ignorePaths: initialIgnorePaths,
  customInstructions: initialCustomInstructions,
  minSeverity: initialMinSeverity,
}: ConfigFormProps) {
  const [ignorePaths, setIgnorePaths] = useState(initialIgnorePaths.join("\n"));
  const [customInstructions, setCustomInstructions] = useState(
    initialCustomInstructions ?? ""
  );
  const [minSeverity, setMinSeverity] = useState(initialMinSeverity);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      const res = await fetch(
        `${apiUrl}/repos/${encodeURIComponent(repoFullName)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ignorePaths: ignorePaths
              .split("\n")
              .map((p) => p.trim())
              .filter(Boolean),
            customInstructions: customInstructions || null,
            minSeverity,
          }),
        }
      );

      if (res.ok) {
        setSaved(true);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="ignorePaths"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Ignore Paths
        </label>
        <p className="text-xs text-gray-500 mb-2">
          One glob pattern per line (e.g. <code>*.lock</code>,{" "}
          <code>docs/**</code>)
        </p>
        <textarea
          id="ignorePaths"
          rows={4}
          value={ignorePaths}
          onChange={(e) => setIgnorePaths(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="*.lock&#10;docs/**&#10;*.generated.ts"
        />
      </div>

      <div>
        <label
          htmlFor="customInstructions"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Custom Instructions
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Additional guidance for the AI reviewer
        </p>
        <textarea
          id="customInstructions"
          rows={4}
          value={customInstructions}
          onChange={(e) => setCustomInstructions(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Focus on security vulnerabilities and performance..."
        />
      </div>

      <div>
        <label
          htmlFor="minSeverity"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Minimum Severity
        </label>
        <select
          id="minSeverity"
          value={minSeverity}
          onChange={(e) => setMinSeverity(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {severityOptions.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        {saved && (
          <span className="text-sm text-green-600 font-medium">Saved!</span>
        )}
      </div>
    </form>
  );
}
