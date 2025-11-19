import React, { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { API_URL } from "@/lib/dbconfig";

type BtxProject = {
  projectId: string;
  eventId: string;
  ticker: string;
  name: string;
  description?: string;
  basePrice?: number;
  currentPrice?: number;
  seedAmount?: number;
  netShares?: number;
  totalVolume?: number;
  totalTrades?: number;
  isActive?: boolean;
  createdAt?: number;
  updatedAt?: number;
};

type ApiResponse<T> = {
  message: string;
  data: T;
};

const formatCurrency = (n: number | undefined | null) =>
  typeof n === "number" ? `$${n.toFixed(2)}` : "—";

const formatDate = (ms?: number) => {
  if (!ms) return "—";
  try {
    return new Date(ms).toLocaleString();
  } catch {
    return String(ms);
  }
};

const BtxAdminPage: React.FC = () => {
  const [projects, setProjects] = useState<BtxProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );

  const [projectId, setProjectId] = useState("");
  const [ticker, setTicker] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [seedAmount, setSeedAmount] = useState<string>("0");

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const [lastRequestDebug, setLastRequestDebug] = useState<string | null>(null);
  const [lastResponseDebug, setLastResponseDebug] = useState<string | null>(
    null,
  );

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("[BTX admin] API_URL =", API_URL);
  }, []);

  const selectedProject = useMemo(
    () => projects.find((p) => p.projectId === selectedProjectId) || null,
    [projects, selectedProjectId],
  );

  // hydrate form when selecting an existing project
  useEffect(() => {
    if (!selectedProject) return;

    setProjectId(selectedProject.projectId);
    setTicker(selectedProject.ticker);
    setName(selectedProject.name);
    setDescription(selectedProject.description || "");
    setSeedAmount(
      typeof selectedProject.seedAmount === "number"
        ? String(selectedProject.seedAmount)
        : "0",
    );
    setFormError(null);
    setFormSuccess(null);
  }, [selectedProject]);

  const resetForm = () => {
    setProjectId("");
    setTicker("");
    setName("");
    setDescription("");
    setSeedAmount("0");
    setSelectedProjectId(null);
    setFormError(null);
    setFormSuccess(null);
    setLastRequestDebug(null);
    setLastResponseDebug(null);
  };

  // API calls

  const loadProjects = async () => {
    const url = `${API_URL}/btx/projects`;
    try {
      setLoadingProjects(true);
      setError(null);

      setLastRequestDebug(
        JSON.stringify(
          {
            ts: new Date().toISOString(),
            method: "GET",
            url,
          },
          null,
          2,
        ),
      );
      setLastResponseDebug(null);

      // eslint-disable-next-line no-console
      console.log("[BTX admin] GET projects →", url);

      const res = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      const rawText = await res.text();

      setLastResponseDebug(
        JSON.stringify(
          {
            ts: new Date().toISOString(),
            status: res.status,
            ok: res.ok,
            url: res.url,
            bodyPreview: rawText.slice(0, 500),
          },
          null,
          2,
        ),
      );

      // eslint-disable-next-line no-console
      console.log(
        "[BTX admin] GET projects response:",
        res.status,
        res.statusText,
        rawText,
      );

      if (!res.ok) {
        throw new Error(
          `Failed to load projects (${res.status}): ${
            rawText || res.statusText
          }`,
        );
      }

      let json: ApiResponse<BtxProject[]>;
      try {
        json = JSON.parse(rawText) as ApiResponse<BtxProject[]>;
      } catch (parseErr: any) {
        // eslint-disable-next-line no-console
        console.error(
          "[BTX admin] GET projects JSON parse error:",
          parseErr,
          "raw=",
          rawText,
        );
        throw new Error(
          `Projects response was not valid JSON: ${
            parseErr?.message || String(parseErr)
          }`,
        );
      }

      const list = Array.isArray(json.data) ? json.data : [];

      list.sort((a, b) => {
        const ta = (a.ticker || "").toUpperCase();
        const tb = (b.ticker || "").toUpperCase();
        if (ta < tb) return -1;
        if (ta > tb) return 1;
        return (a.name || "").localeCompare(b.name || "");
      });

      setProjects(list);
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error("[BTX admin] loadProjects error", err);
      setError(
        err?.message ||
          "Failed to load BTX projects. Check the backend logs for details.",
      );
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    void loadProjects();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const trimmedProjectId = projectId.trim();
    const trimmedTicker = ticker.trim();

    if (!trimmedProjectId || !trimmedTicker) {
      setFormError("projectId and ticker are required.");
      return;
    }

    const parsedSeed = Number(seedAmount);
    if (seedAmount !== "" && (!Number.isFinite(parsedSeed) || parsedSeed < 0)) {
      setFormError("Seed amount must be a non-negative number.");
      return;
    }

    const payload = {
      projectId: trimmedProjectId,
      eventId: "kickstart",
      ticker: trimmedTicker,
      name: name.trim(),
      description: description.trim(),
      seedAmount: Number.isFinite(parsedSeed) ? parsedSeed : 0,
    };

    const params = new URLSearchParams();
    Object.entries(payload).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        String(value).trim().length > 0
      ) {
        params.append(key, String(value));
      }
    });

    const url = `${API_URL}/btx/admin/project?${params.toString()}`;

    setSubmitting(true);
    try {
      setLastRequestDebug(
        JSON.stringify(
          {
            ts: new Date().toISOString(),
            method: "GET",
            url,
            query: payload,
          },
          null,
          2,
        ),
      );
      setLastResponseDebug(null);

      // eslint-disable-next-line no-console
      console.log("[BTX admin] GET /btx/admin/project →", url, payload);

      const res = await fetch(url, { method: "GET" }).catch((err) => {
        console.error("[BTX admin] fetch network error", err);
        setLastResponseDebug(
          JSON.stringify(
            {
              ts: new Date().toISOString(),
              networkError: true,
              message: err?.message || String(err),
            },
            null,
            2,
          ),
        );
        throw err;
      });

      const rawText = await res.text();

      setLastResponseDebug(
        JSON.stringify(
          {
            ts: new Date().toISOString(),
            status: res.status,
            ok: res.ok,
            url: res.url,
            bodyPreview: rawText.slice(0, 500),
          },
          null,
          2,
        ),
      );

      console.log(
        "[BTX admin] GET /btx/admin/project response:",
        res.status,
        res.statusText,
        rawText,
      );

      if (!res.ok) {
        throw new Error(
          rawText ||
            `Admin project call failed with status ${res.status}: ${res.statusText}`,
        );
      }

      let json: ApiResponse<BtxProject>;
      try {
        json = JSON.parse(rawText) as ApiResponse<BtxProject>;
      } catch (parseErr: any) {
        console.error(
          "[BTX admin] admin/project JSON parse error:",
          parseErr,
          "raw=",
          rawText,
        );
        throw new Error(
          `Admin project response was not valid JSON: ${
            parseErr?.message || String(parseErr)
          }`,
        );
      }

      const created = json.data;

      if (!created || !created.projectId) {
        throw new Error("Admin endpoint returned an invalid project payload.");
      }

      setProjects((prev) => {
        const idx = prev.findIndex((p) => p.projectId === created.projectId);
        if (idx === -1) {
          return [...prev, created].sort((a, b) => {
            const ta = (a.ticker || "").toUpperCase();
            const tb = (b.ticker || "").toUpperCase();
            if (ta < tb) return -1;
            if (ta > tb) return 1;
            return (a.name || "").localeCompare(b.name || "");
          });
        }
        const copy = [...prev];
        copy[idx] = created;
        return copy;
      });

      setSelectedProjectId(created.projectId);
      setFormSuccess(
        `Project "${created.ticker}" (${created.projectId}) saved successfully.`,
      );
    } catch (err: any) {
      console.error("[BTX admin] save project error", err);
      setFormError(
        err?.message ||
          "Failed to save project. Ensure you're an admin and check backend logs.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>BTX Admin – Projects</title>
      </Head>
      <main className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                BTX Admin – Projects
              </h1>
              <p className="text-sm text-slate-400">
                Create and update BizTech Exchange (BTX) stocks for the
                KickStart event.
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Using API base:
                <span className="ml-1 font-mono text-[11px] text-slate-300">
                  {API_URL}
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={loadProjects}
                disabled={loadingProjects}
              >
                {loadingProjects ? "Refreshing…" : "Refresh projects"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetForm}
              >
                New project
              </Button>
            </div>
          </header>

          {error && (
            <div className="mb-4 rounded-md border border-red-500/60 bg-red-950/40 px-3 py-2 text-xs text-red-200">
              {error}
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-3">
            {/* LEFT: Existing projects list */}
            <Card className="flex flex-col bg-slate-900/80">
              <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                  Existing projects
                </h2>
                {loadingProjects && (
                  <span className="text-xs text-slate-500">Loading…</span>
                )}
              </div>
              <div className="flex-1 overflow-auto">
                {projects.length === 0 && !loadingProjects ? (
                  <div className="p-4 text-xs text-slate-400">
                    No BTX projects found yet. Use the form on the right to
                    create one.
                  </div>
                ) : (
                  <ul>
                    {projects.map((p) => {
                      const isSelected = p.projectId === selectedProjectId;
                      return (
                        <li
                          key={p.projectId}
                          className={`cursor-pointer border-b border-slate-800 px-4 py-2 text-xs hover:bg-slate-800/60 ${
                            isSelected ? "bg-slate-800/80" : ""
                          }`}
                          onClick={() => setSelectedProjectId(p.projectId)}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[11px] uppercase text-slate-300">
                                  {p.ticker}
                                </span>
                                <span className="truncate text-[11px] text-slate-500">
                                  {p.name}
                                </span>
                              </div>
                              <div className="mt-0.5 text-[10px] text-slate-500">
                                ID: {p.projectId}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs font-medium">
                                {formatCurrency(p.currentPrice)}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                Base: {formatCurrency(p.basePrice)}
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </Card>

            {/* MIDDLE + RIGHT: Form & details */}
            <div className="lg:col-span-2 space-y-4">
              {/* Create / update form */}
              <Card className="bg-slate-900/80">
                <div className="border-b border-slate-800 px-4 py-3">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                    Create / Update Project
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Fill out the fields and submit to create a new BTX stock or
                    update an existing one. The backend will compute{" "}
                    <span className="font-semibold">basePrice</span> and{" "}
                    <span className="font-semibold">currentPrice</span> from the
                    seed amount using BTX logic.
                  </p>
                </div>
                <form
                  className="space-y-4 px-4 py-4 text-sm"
                  onSubmit={handleSubmit}
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-200">
                        Project ID
                        <span className="ml-1 text-red-400">*</span>
                      </label>
                      <Input
                        className="h-9 bg-slate-950 text-xs"
                        placeholder="e.g. project11"
                        value={projectId}
                        onChange={(e) => setProjectId(e.target.value)}
                      />
                      <p className="text-[11px] text-slate-500">
                        Stable internal ID (also the DynamoDB partition key).
                        Keep it consistent if you&apos;re updating an existing
                        project.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-200">
                        Ticker
                        <span className="ml-1 text-red-400">*</span>
                      </label>
                      <Input
                        className="h-9 bg-slate-950 text-xs"
                        placeholder="e.g. TMA"
                        value={ticker}
                        onChange={(e) => setTicker(e.target.value)}
                      />
                      <p className="text-[11px] text-slate-500">
                        Short symbol shown in the BTX UI (e.g. &quot;TMA&quot;
                        for Team A).
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-200">
                        Name
                      </label>
                      <Input
                        className="h-9 bg-slate-950 text-xs"
                        placeholder="Team A"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                      <p className="text-[11px] text-slate-500">
                        Display name. If left blank, the backend may try to
                        hydrate this from the team table.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-200">
                        Seed amount
                      </label>
                      <Input
                        className="h-9 bg-slate-950 text-xs"
                        type="number"
                        min={0}
                        step={1}
                        value={seedAmount}
                        onChange={(e) => setSeedAmount(e.target.value)}
                      />
                      <p className="text-[11px] text-slate-500">
                        Non-negative number. Backend uses it to compute base
                        price with BTX&apos;s{" "}
                        <span className="italic">seed → price</span> formula.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-200">
                      Description
                    </label>
                    <Textarea
                      className="min-h-[80px] bg-slate-950 text-xs"
                      placeholder="Short description of this project / startup…"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <Separator className="bg-slate-800" />

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1 text-xs text-slate-400">
                      <div>
                        <span className="text-slate-500">Event ID: </span>
                        <span className="font-mono text-slate-200">
                          kickstart
                        </span>{" "}
                        <span className="text-slate-500">
                          (backend currently hardcodes this)
                        </span>
                      </div>
                      {selectedProject && (
                        <div className="text-slate-500">
                          This will{" "}
                          <span className="font-semibold">update</span> the
                          existing project{" "}
                          <span className="font-mono">
                            {selectedProject.ticker}
                          </span>{" "}
                          ({selectedProject.projectId}).
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="px-4"
                      >
                        {submitting
                          ? "Saving…"
                          : selectedProject
                            ? "Update project"
                            : "Create project"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={resetForm}
                        disabled={submitting}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>

                  {formError && (
                    <div className="mt-2 rounded border border-red-500/60 bg-red-950/40 px-3 py-2 text-xs text-red-200">
                      {formError}
                    </div>
                  )}
                  {formSuccess && (
                    <div className="mt-2 rounded border border-emerald-500/60 bg-emerald-950/40 px-3 py-2 text-xs text-emerald-200">
                      {formSuccess}
                    </div>
                  )}
                </form>
              </Card>

              {/* Details of selected project (read-only) */}
              {selectedProject && (
                <Card className="bg-slate-900/80">
                  <div className="border-b border-slate-800 px-4 py-3">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                      Selected Project Details
                    </h2>
                  </div>
                  <div className="space-y-2 px-4 py-4 text-sm">
                    <div className="grid gap-2 text-xs sm:grid-cols-2">
                      <div>
                        <span className="text-slate-500">Project ID:</span>{" "}
                        <span className="font-mono text-slate-200">
                          {selectedProject.projectId}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Event ID:</span>{" "}
                        <span className="font-mono text-slate-200">
                          {selectedProject.eventId}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Ticker:</span>{" "}
                        <span className="font-mono text-slate-200">
                          {selectedProject.ticker}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Name:</span>{" "}
                        <span className="text-slate-200">
                          {selectedProject.name}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Base price:</span>{" "}
                        <span className="font-mono text-slate-200">
                          {formatCurrency(selectedProject.basePrice)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Current price:</span>{" "}
                        <span className="font-mono text-slate-200">
                          {formatCurrency(selectedProject.currentPrice)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Seed amount:</span>{" "}
                        <span className="font-mono text-slate-200">
                          {typeof selectedProject.seedAmount === "number"
                            ? selectedProject.seedAmount
                            : "—"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Net shares:</span>{" "}
                        <span className="font-mono text-slate-200">
                          {selectedProject.netShares ?? 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Total volume:</span>{" "}
                        <span className="font-mono text-slate-200">
                          {selectedProject.totalVolume ?? 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Total trades:</span>{" "}
                        <span className="font-mono text-slate-200">
                          {selectedProject.totalTrades ?? 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Created at:</span>{" "}
                        <span className="font-mono text-slate-200">
                          {formatDate(selectedProject.createdAt)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Updated at:</span>{" "}
                        <span className="font-mono text-slate-200">
                          {formatDate(selectedProject.updatedAt)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Active:</span>{" "}
                        <span className="font-mono text-slate-200">
                          {selectedProject.isActive === false
                            ? "false"
                            : "true"}
                        </span>
                      </div>
                    </div>

                    {selectedProject.description && (
                      <>
                        <Separator className="my-2 bg-slate-800" />
                        <div className="text-xs text-slate-200">
                          <div className="mb-1 text-[11px] uppercase tracking-wide text-slate-400">
                            Description
                          </div>
                          <p className="whitespace-pre-wrap">
                            {selectedProject.description}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </Card>
              )}

              {/* Debug panel */}
              <Card className="bg-slate-900/80">
                <div className="border-b border-slate-800 px-4 py-3">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                    Debug (frontend)
                  </h2>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Use this to see the last request/response that the admin UI
                    made to the BTX API.
                  </p>
                </div>
                <div className="grid gap-4 px-4 py-4 text-xs md:grid-cols-2">
                  <div>
                    <div className="mb-1 font-semibold text-slate-300">
                      Last request
                    </div>
                    <pre className="max-h-64 overflow-auto rounded bg-slate-950/70 p-2 font-mono text-[11px] text-slate-200">
                      {lastRequestDebug || "—"}
                    </pre>
                  </div>
                  <div>
                    <div className="mb-1 font-semibold text-slate-300">
                      Last response / error
                    </div>
                    <pre className="max-h-64 overflow-auto rounded bg-slate-950/70 p-2 font-mono text-[11px] text-slate-200">
                      {lastResponseDebug || "—"}
                    </pre>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default BtxAdminPage;
