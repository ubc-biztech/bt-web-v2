import { useRouter } from "next/router";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { AngledPanel, StatusBanner } from "./BtxUI";
import type { MarketPageProps } from "./Kickstart2026";
import { launchIpo } from "./adminApi";
import {
  GrantFunds,
  GrantResults,
  GrantSummary,
  useGrantRun,
  useInvestors,
} from "./GrantFunds";
import {
  market as fetchMarket,
  type BtxRequestError,
  type Market,
} from "./seedApi";
import {
  companyName,
  exchangePath,
  money,
  timeLeft,
  windowState,
} from "./market";
import s from "./Admin.module.css";

type IpoStage = "seed" | "ready" | "launching" | "unknown" | "live";
// Five receives at the configured 120-second queue visibility timeout.
const IPO_STALL_MS = 5 * 120_000;
const preparedCompanies = (market: Market) =>
  market.projects.filter((project) => project.seedSharesAtIpo != null).length;

function useIpo(market: Market, userId: string) {
  const key = `btx-ipo:${market.eventId}:${userId}`;
  const [attempt, setAttempt] = useState(() => sessionStorage.getItem(key));
  const [stalledAt, setStalledAt] = useState<number | null>(null);
  const [resumeAttempt, setResumeAttempt] = useState(0);
  const [failure, setFailure] = useState("");
  const [checking, setChecking] = useState(false);
  const [checked, setChecked] = useState("");
  const posting = useRef(false);
  const committed = market.phase === "LIVE";
  const preparing = market.phase === "IPO_PREPARING";
  const live =
    committed &&
    market.projects.every((project) => project.seedSharesAtIpo != null);
  const pending = !live && (committed || preparing || !!attempt);
  const snapshot = useQuery({
    queryKey: ["btx", "snapshot"],
    queryFn: fetchMarket,
    enabled: pending,
    refetchInterval: pending ? 3000 : false,
    retry: false,
  });
  const prepared = preparedCompanies(market);
  useEffect(() => {
    if (market.phase !== "SEED" && attempt) {
      sessionStorage.removeItem(key);
      setAttempt(null);
    }
  }, [market.phase, key, attempt]);

  useEffect(() => {
    setStalledAt(null);
    if (!preparing || snapshot.isError) return;
    const timer = window.setTimeout(() => setStalledAt(prepared), IPO_STALL_MS);
    return () => window.clearTimeout(timer);
  }, [preparing, prepared, resumeAttempt, snapshot.isError]);

  const canResume = preparing && !snapshot.isError && stalledAt === prepared;
  const unknown =
    pending &&
    (snapshot.isError ||
      (market.phase === "SEED" && attempt === "unknown" && !posting.current));

  async function resume() {
    if (!canResume || posting.current) return;
    posting.current = true;
    setChecking(true);
    setFailure("");
    try {
      const { data } = await snapshot.refetch({
        cancelRefetch: false,
        throwOnError: true,
      });
      if (
        data?.eventId !== market.eventId ||
        data.phase !== "IPO_PREPARING" ||
        preparedCompanies(data) !== prepared
      )
        return;
      setStalledAt(null);
      setResumeAttempt((previous) => previous + 1);
      await launchIpo();
    } catch {
      setFailure("Couldn’t confirm the resume request. Check IPO status.");
    } finally {
      posting.current = false;
      setChecking(false);
    }
  }

  async function check() {
    setChecking(true);
    setFailure("");
    setChecked("");
    try {
      const { data } = await snapshot.refetch({
        cancelRefetch: false,
        throwOnError: true,
      });
      if (data?.eventId !== market.eventId) throw new Error();
      if (data.phase !== "SEED") return;
      setChecked(
        attempt === "queued"
          ? "The server accepted the launch request. Waiting for preparation to start."
          : "The launch request may still be queued. Check again for confirmation.",
      );
    } catch {
      setFailure("Couldn’t refresh IPO status. Try checking again.");
    } finally {
      setChecking(false);
    }
  }

  async function launch() {
    if (live || pending || posting.current) return;
    posting.current = true;
    setFailure("");
    setChecked("");
    sessionStorage.setItem(key, "unknown");
    setAttempt("unknown");
    try {
      await launchIpo();
      if (sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "queued");
        setAttempt("queued");
      }
    } catch (error) {
      const reason = error as BtxRequestError;
      if (reason.status && reason.status < 500 && reason.status !== 408) {
        sessionStorage.removeItem(key);
        setAttempt(null);
        setFailure(reason.message || "Launch request declined");
      } else {
        setChecked("Couldn’t confirm the launch request. Check IPO status.");
      }
    } finally {
      posting.current = false;
    }
  }
  return {
    live,
    committed,
    preparing,
    pending,
    unknown,
    launch,
    resume,
    canResume,
    failure,
    check,
    checked:
      checked ||
      (attempt === "queued"
        ? "The server accepted the launch request. Waiting for preparation to start."
        : ""),
    checking,
  };
}

function Timeline({ stage, active }: { stage: IpoStage; active: number }) {
  const step = stage === "live" ? 2 : stage === "seed" ? 0 : 1;
  const stages = [
    [
      stage === "seed" ? "Seed round (now)" : "Seed round",
      stage === "seed"
        ? `${active} team windows still active`
        : stage === "unknown" || stage === "launching"
          ? "Closed on launch"
          : "Buy only, fixed price",
    ],
    [
      stage === "unknown"
        ? "IPO (status unknown)"
        : stage === "launching"
          ? "IPO (launching)"
          : stage === "ready"
            ? "IPO (now)"
            : "IPO",
      stage === "seed"
        ? "Not launched"
        : stage === "unknown"
          ? "Awaiting confirmation"
          : stage === "launching"
            ? "Preparing opening prices"
            : "Snapshot sets opening prices",
    ],
    [
      stage === "live" ? "Live trading (NOW)" : "Live trading",
      stage === "unknown"
        ? "Not confirmed yet"
        : stage === "launching"
          ? "Starts when every company is ready"
          : "Buys and sells move prices",
    ],
  ];
  return (
    <ol className={s.timeline} aria-label="Market stages">
      {stages.map(([title, detail], i) => (
        <li
          className={s.step}
          key={i}
          data-done={i < step}
          aria-current={step === i ? "step" : undefined}
        >
          <b aria-hidden>
            {i < step ? "✓" : stage === "unknown" && i === 1 ? "?" : i + 1}
          </b>
          <div>
            <strong>{title}</strong>
            <small>{detail}</small>
          </div>
        </li>
      ))}
    </ol>
  );
}

const clockTime = (ts: number) =>
  new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

// The server's seed price is $100, with a 10× opening valuation at 5,000 shares.
const openingPrice = (shares: number) =>
  Math.round(10000 * (1 + 9 * Math.min(shares / 5000, 1)));

function ResponsiveSheet({
  children,
  title,
  onClose,
}: {
  children: React.ReactNode;
  title: string;
  onClose?: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const sync = () => setMobile(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    if (mobile) ref.current?.showModal();
  }, [mobile]);
  if (!mobile) return <>{children}</>;
  return (
    <>
      {!onClose && (
        <button className={s.reopen} onClick={() => ref.current?.showModal()}>
          {title}
        </button>
      )}
      <dialog
        ref={ref}
        className={s.responsiveSheet}
        aria-label={title}
        onClose={() => {
          if (window.matchMedia("(max-width: 767px)").matches) onClose?.();
        }}
      >
        <div className={s.sheetHeader}>
          <h2>{title}</h2>
          <button aria-label="Close" onClick={() => ref.current?.close()}>
            ×
          </button>
        </div>
        {children}
      </dialog>
    </>
  );
}

function IpoPanel({
  market,
  now,
  ipo,
  active,
  grantBusy,
}: Pick<MarketPageProps, "market" | "now"> & {
  ipo: ReturnType<typeof useIpo>;
  active: number;
  grantBusy: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [confirmation, setConfirmation] = useState("");
  const { projects } = market;
  const ended = projects.filter(
    (project) => windowState(project, now) === "ENDED",
  ).length;
  const canLaunch =
    !ipo.live &&
    !ipo.pending &&
    projects.length > 0 &&
    !grantBusy &&
    now < market.eventEndsAt;
  const canConfirm =
    canLaunch && confirmation.trim().toLowerCase() === "launch";
  const description = ipo.committed
    ? "The IPO committed. Waiting for the market snapshot to show every company’s seed shares."
    : ipo.preparing && !ipo.unknown
      ? "Trading is paused while the worker sets opening prices."
      : ipo.checked ||
        (ipo.unknown
          ? "We couldn’t confirm whether the IPO launched. Refresh status before trying again."
          : "Prices and trading are going live. You can leave this page — it will keep going.");
  useEffect(() => {
    if (ipo.live || ipo.pending) dialog.current?.close();
  }, [ipo.live, ipo.pending]);
  return (
    <AngledPanel id="launch-ipo" className={s.panel}>
      <header>
        <small className="text-xs text-[#ffddad]">Action 2</small>
        <h2>{ipo.live ? "IPO launched" : "Launch IPO"}</h2>
        <p>
          {ipo.live
            ? "Net seed shares were snapshotted and opening prices set. The market is live: buys and sells now move prices."
            : "Takes a snapshot of net seed shares per company. The snapshot sets each opening price. The seed round closes and live trading starts."}
        </p>
      </header>
      {!ipo.live && !ipo.pending && active > 0 && (
        <>
          <div className={s.tableBox}>
            <div className={s.tableHeader + " " + s.row}>
              Seed windows
              <span>
                {active} active · {ended} ended ·{" "}
                {projects.length - active - ended} not started
              </span>
            </div>
            <table>
              <tbody>
                {projects.map((p) => {
                  const state = windowState(p, now);
                  return (
                    <tr key={p.projectId}>
                      <td>{companyName(p)}</td>
                      <td className="text-right text-xs text-[#a8b5d6]">
                        {state === "ACTIVE"
                          ? timeLeft(p, now) + " left"
                          : state === "ENDED" && p.seedEndsAt
                            ? "Closed " + clockTime(p.seedEndsAt)
                            : ""}
                      </td>
                      <td className="text-right">
                        <span
                          className={s.badge}
                          style={{
                            color:
                              state === "ACTIVE"
                                ? "#38d3a2"
                                : state === "ENDED"
                                  ? "#ffddad"
                                  : "#a8b5d6",
                          }}
                        >
                          {state === "ACTIVE"
                            ? "Active"
                            : state === "ENDED"
                              ? "Ended"
                              : "Not started"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <StatusBanner
            tone="warning"
            title="Some seed windows are still active"
            description="Launching now will close open seed windows early. Review before you continue."
          />
        </>
      )}
      {ipo.pending ? (
        <ResponsiveSheet
          title={ipo.unknown ? "IPO status unknown" : "Launching IPO…"}
        >
          <StatusBanner
            tone={ipo.unknown ? "warning" : "info"}
            title={ipo.unknown ? "IPO status unknown" : "IPO is launching"}
            description={description}
          />
          <div className={s.tableBox}>
            <div className={s.tableHeader + " " + s.row}>
              {ipo.unknown ? "Last known progress" : "Snapshot progress"}
              <span>as of {clockTime(market.serverTime)}</span>
            </div>
            <table>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.projectId}>
                    <td>{companyName(p)}</td>
                    <td className="text-right">
                      <span className={s.badge}>
                        {p.seedSharesAtIpo != null ? "Done" : "Waiting"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {ipo.failure && <StatusBanner tone="error" title={ipo.failure} />}
          {ipo.canResume && (
            <button
              className={s.warm}
              disabled={ipo.checking}
              onClick={ipo.resume}
            >
              Resume IPO
            </button>
          )}
          <button
            className={s.warm}
            disabled={ipo.checking}
            onClick={ipo.check}
          >
            {ipo.checking ? "Checking IPO status…" : "Check IPO status"}
          </button>
        </ResponsiveSheet>
      ) : (
        <>
          <div className={s.tableBox}>
            <table>
              <thead>
                <tr>
                  <th>
                    Company<span className="md:hidden"> · net seed shares</span>
                  </th>
                  <th className="hidden md:table-cell">Net seed shares</th>
                  <th>
                    {ipo.live ? "Opening price" : "Opening price (sample)"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => {
                  const shares = ipo.live
                    ? p.seedSharesAtIpo
                    : (p.netShares ?? 0);
                  return (
                    <tr key={p.projectId}>
                      <td>
                        {companyName(p)}
                        <span className="md:hidden">
                          {" "}
                          · {shares?.toLocaleString() ?? "—"}
                        </span>
                      </td>
                      <td className="hidden md:table-cell">
                        {shares?.toLocaleString() ?? "—"}
                      </td>
                      <td className="text-[#1fbef9]">
                        {shares != null ? money(openingPrice(shares)) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {projects.length === 0 && <p className="p-4">No companies yet.</p>}
          </div>
          {ipo.live ? (
            <>
              <span className={s.badge + " w-fit text-[#38d3a2]"}>
                ● Live
                {market.ipoAt != null &&
                  ", launched " + clockTime(market.ipoAt)}
              </span>
              <Link href={exchangePath} className={s.outline}>
                View exchange →
              </Link>
            </>
          ) : (
            <button
              className={s.warm}
              disabled={!canLaunch}
              onClick={() => {
                setConfirmation("");
                dialog.current?.showModal();
              }}
            >
              Launch IPO…
            </button>
          )}
        </>
      )}
      {!ipo.pending && !ipo.live && ipo.checked && (
        <StatusBanner tone="info" title={ipo.checked} />
      )}
      {!ipo.live && !ipo.pending && ipo.failure && (
        <StatusBanner tone="error" title={ipo.failure} />
      )}
      <dialog className={s.dialog} ref={dialog} aria-labelledby="ipo-title">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!canConfirm) return;
            dialog.current?.close();
            void ipo.launch();
          }}
        >
          <span className={s.badge + " w-fit text-[#ffddad]"}>
            Can’t be undone
          </span>
          <h2 id="ipo-title">Launch the IPO for KickStart 2026?</h2>
          <p>
            This snapshots net seed shares for {projects.length} companies, sets
            opening prices, and ends the seed round for everyone.{" "}
            {active > 0 &&
              `${active} team seed windows are still active and will close early. `}
            Trading goes live once every company is ready.
          </p>
          {active > 0 && (
            <div className="md:hidden">
              <StatusBanner
                tone="warning"
                title="Some seed windows are still active"
                description="Launching now will close open seed windows early."
              />
            </div>
          )}
          <label className={s.field}>
            Type “launch” to confirm
            <input
              autoComplete="off"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
            />
          </label>
          <div className={s.actions + " justify-end"}>
            <button
              type="button"
              className={s.outline}
              onClick={() => dialog.current?.close()}
            >
              Cancel
            </button>
            <button className={s.warm} disabled={!canConfirm}>
              {active > 0 ? "Launch anyway" : "Launch IPO"}
            </button>
          </div>
        </form>
      </dialog>
    </AngledPanel>
  );
}

function EventControl({
  market,
  userId,
  now,
  initials,
  grantsOnly = false,
}: MarketPageProps & { grantsOnly?: boolean }) {
  const router = useRouter();
  const ipo = useIpo(market, userId);
  const active = market.projects.filter(
    (project) => windowState(project, now) === "ACTIVE",
  ).length;
  const roster = useInvestors(market.eventId, userId);
  const batch = useGrantRun("btx-grant:" + market.eventId + ":" + userId);
  const stage = ipo.live
    ? "live"
    : ipo.unknown
      ? "unknown"
      : ipo.pending
        ? "launching"
        : active
          ? "seed"
          : "ready";
  const { run } = batch;
  const grantPanel = run ? (
    grantsOnly ? (
      <GrantResults
        batch={batch}
        run={run}
        people={roster.data ?? []}
        paused={ipo.pending}
      />
    ) : (
      <GrantSummary batch={batch} run={run} paused={ipo.pending} />
    )
  ) : (
    <GrantFunds
      compact={!grantsOnly}
      roster={roster}
      batch={batch}
      paused={ipo.pending}
    />
  );

  return (
    <div className={s.page}>
      <Link className={s.exit} href={exchangePath}>
        ← Exit admin
      </Link>
      <header className={s.heading}>
        <div>
          <h1>Event control</h1>
          <small>KickStart 2026</small>
        </div>
        <span>{initials}</span>
      </header>
      <small className={s.adminBadge}>Admin</small>
      <Timeline stage={stage} active={active} />
      {grantsOnly && (
        <ResponsiveSheet
          title={run ? "Grant results" : "Choose recipients"}
          onClose={() => void router.push(exchangePath + "/admin")}
        >
          {grantPanel}
        </ResponsiveSheet>
      )}
      <div className={s.columns + (grantsOnly ? " " + s.grantBackdrop : "")}>
        {grantsOnly ? (
          <GrantFunds
            compact
            roster={roster}
            batch={batch}
            paused={ipo.pending}
          />
        ) : (
          grantPanel
        )}
        {(!grantsOnly || !ipo.pending) && (
          <IpoPanel
            market={market}
            now={now}
            ipo={ipo}
            active={active}
            grantBusy={batch.sending}
          />
        )}
      </div>
    </div>
  );
}

export const AdminOverview = EventControl;
export function AdminGrants(props: MarketPageProps) {
  return <EventControl {...props} grantsOnly />;
}
