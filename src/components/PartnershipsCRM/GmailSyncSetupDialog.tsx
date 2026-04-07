import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

type GmailSyncSetupDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resolvedSyncIngestUrl: string;
  syncChecklistText: string;
  syncScriptTemplate: string;
  syncTestPayload: string;
  onCopy: (value: string, successMessage: string) => Promise<void> | void;
};

export function GmailSyncSetupDialog({
  open,
  onOpenChange,
  resolvedSyncIngestUrl,
  syncChecklistText,
  syncScriptTemplate,
  syncTestPayload,
  onCopy,
}: GmailSyncSetupDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1rem)] max-w-4xl overflow-hidden border-bt-blue-300 bg-bt-blue-500 p-0 text-white">
        <div className="flex max-h-[92vh] flex-col">
          <div className="border-b border-bt-blue-300/35 px-4 py-3">
            <h3 className="text-lg font-semibold text-white">
              Gmail Sync Setup
            </h3>
            <p className="text-sm text-bt-blue-100">
              Sync manual Gmail sends and replies into partner communication
              logs.
            </p>
          </div>

          <div className="space-y-3 overflow-y-auto p-4">
            <div className="rounded-md border border-bt-blue-300/30 bg-bt-blue-600/30 p-3">
              <p className="text-[11px] uppercase tracking-wide text-bt-blue-100">
                Webhook URL
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <p className="min-w-0 flex-1 break-all rounded-md border border-bt-blue-300/35 bg-bt-blue-700/45 px-2 py-1.5 text-xs text-bt-blue-50">
                  {resolvedSyncIngestUrl}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 border-bt-blue-300/40 bg-bt-blue-500/40 px-2 text-xs text-white hover:bg-bt-blue-500/60"
                  onClick={() =>
                    void onCopy(resolvedSyncIngestUrl, "Webhook URL copied")
                  }
                >
                  <Copy className="mr-1.5 h-3.5 w-3.5" />
                  Copy URL
                </Button>
              </div>
            </div>

            <div className="rounded-md border border-bt-blue-300/30 bg-bt-blue-600/30 p-3">
              <p className="text-[11px] uppercase tracking-wide text-bt-blue-100">
                Steps
              </p>
              <p className="mt-1 text-xs text-bt-blue-100">
                Use the same Gmail account you use for partner outreach.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <a
                  href="https://script.new"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-8 items-center rounded-md border border-bt-blue-300/40 bg-bt-blue-500/40 px-2 text-xs text-white hover:bg-bt-blue-500/60"
                >
                  Open Apps Script
                </a>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 border-bt-blue-300/40 bg-bt-blue-500/40 px-2 text-xs text-white hover:bg-bt-blue-500/60"
                  onClick={() =>
                    void onCopy(syncChecklistText, "Setup steps copied")
                  }
                >
                  <Copy className="mr-1.5 h-3.5 w-3.5" />
                  Copy Setup Steps
                </Button>
              </div>
              <ol className="mt-3 list-decimal space-y-3 pl-4 text-xs text-bt-blue-100">
                <li>
                  Create the script project.
                  <ul className="mt-1 list-disc space-y-1 pl-4">
                    <li>Open Apps Script.</li>
                    <li>Paste the template from this setup guide.</li>
                    <li>
                      Save and name it{" "}
                      <span className="font-mono text-bt-green-100">
                        Partnerships CRM Email Sync
                      </span>
                      .
                    </li>
                  </ul>
                </li>
                <li>
                  Run once and approve access.
                  <ul className="mt-1 list-disc space-y-1 pl-4">
                    <li>
                      Select function{" "}
                      <span className="font-mono text-bt-green-100">
                        syncPartnershipEmails
                      </span>{" "}
                      and click Run.
                    </li>
                    <li>
                      In the permissions popup, click through and allow access.
                    </li>
                    <li>
                      If Google shows an unverified warning:{" "}
                      <span className="font-mono text-bt-green-100">
                        Advanced
                      </span>{" "}
                      then{" "}
                      <span className="font-mono text-bt-green-100">
                        Go to ... (unsafe)
                      </span>
                      .
                    </li>
                  </ul>
                </li>
                <li>
                  Add the automatic trigger.
                  <ul className="mt-1 list-disc space-y-1 pl-4">
                    <li>Open Triggers (clock icon in left sidebar).</li>
                    <li>Click + Add Trigger.</li>
                    <li>
                      Function:{" "}
                      <span className="font-mono text-bt-green-100">
                        syncPartnershipEmails
                      </span>
                      .
                    </li>
                    <li>
                      Event source:{" "}
                      <span className="font-mono text-bt-green-100">
                        Time-driven
                      </span>
                      .
                    </li>
                    <li>
                      Type:{" "}
                      <span className="font-mono text-bt-green-100">
                        Minutes timer
                      </span>
                      .
                    </li>
                    <li>
                      Interval:{" "}
                      <span className="font-mono text-bt-green-100">
                        Every 10 minutes
                      </span>{" "}
                      (or Every 15 minutes).
                    </li>
                  </ul>
                </li>
                <li>
                  Verify in CRM.
                  <ul className="mt-1 list-disc space-y-1 pl-4">
                    <li>Return to Email Ops and click Refresh.</li>
                    <li>
                      Confirm Last Sync updates and your address appears in
                      Synced Accounts.
                    </li>
                  </ul>
                </li>
              </ol>
              <p className="mt-2 text-xs text-bt-blue-100">
                Multi-exec setup: each exec can connect their own inbox. Shared
                threads stay clean.
              </p>
            </div>

            <div className="rounded-md border border-bt-blue-300/30 bg-bt-blue-600/30 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[11px] uppercase tracking-wide text-bt-blue-100">
                  Apps Script Template
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 border-bt-blue-300/40 bg-bt-blue-500/40 px-2 text-xs text-white hover:bg-bt-blue-500/60"
                  onClick={() =>
                    void onCopy(syncScriptTemplate, "Script template copied")
                  }
                >
                  <Copy className="mr-1.5 h-3.5 w-3.5" />
                  Copy Script
                </Button>
              </div>
              <Textarea
                value={syncScriptTemplate}
                readOnly
                className="mt-2 min-h-[320px] border-bt-blue-300/40 bg-bt-blue-700/45 font-mono text-xs text-bt-blue-50"
              />
            </div>

            <div className="rounded-md border border-bt-blue-300/30 bg-bt-blue-600/30 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[11px] uppercase tracking-wide text-bt-blue-100">
                  Test Payload (Optional)
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 border-bt-blue-300/40 bg-bt-blue-500/40 px-2 text-xs text-white hover:bg-bt-blue-500/60"
                  onClick={() =>
                    void onCopy(syncTestPayload, "Test payload copied")
                  }
                >
                  <Copy className="mr-1.5 h-3.5 w-3.5" />
                  Copy JSON
                </Button>
              </div>
              <p className="mt-1 text-xs text-bt-blue-100">
                Optional: use this with Postman/Insomnia against the webhook URL
                if you want to validate ingest before adding triggers.
              </p>
              <Textarea
                value={syncTestPayload}
                readOnly
                className="mt-2 min-h-[120px] border-bt-blue-300/40 bg-bt-blue-700/45 font-mono text-xs text-bt-blue-50"
              />
            </div>
          </div>

          <div className="flex justify-end border-t border-bt-blue-300/35 px-4 py-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
