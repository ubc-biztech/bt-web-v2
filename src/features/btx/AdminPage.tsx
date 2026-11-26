import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { AngledPanel, StatusBanner } from "./BtxUI";
import type { MarketPageProps } from "./Kickstart2026";
import { launchIpo, resetIpo } from "./adminApi";
import {
  GrantFunds,
  GrantResults,
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
  listingState,
  marketStage,
  money,
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
  const resetting = market.phase === "IPO_RESETTING";
  const pending = !live && (committed || preparing || resetting || !!attempt);
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
    resetting,
    refresh: () => snapshot.refetch(),
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
        ? `${active} accepting seed buys`
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
            ? "Ready for IPO"
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

function ResetControl({
  ipoAt,
  resuming,
  refresh,
  disabled,
}: {
  ipoAt: number;
  resuming: boolean;
  refresh: () => Promise<unknown>;
  disabled: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const key = `btx-reset-to-seed:${ipoAt}`;
  const [queuedAt, setQueuedAt] = useState(() =>
    Number(sessionStorage.getItem(key)),
  );
  const waiting = queuedAt > 0 && Date.now() - queuedAt < IPO_STALL_MS;
  useQuery({
    queryKey: ["btx", "snapshot"],
    queryFn: fetchMarket,
    enabled: waiting,
    refetchInterval: waiting ? 3000 : false,
    retry: false,
  });
  const [target, setTarget] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const sending = useRef(false);

  async function confirm() {
    if (sending.current || target == null || target !== ipoAt) return;
    sending.current = true;
    setBusy(true);
    setError("");
    dialog.current?.close();
    try {
      await resetIpo(target);
      const accepted = Date.now();
      sessionStorage.setItem(key, String(accepted));
      setQueuedAt(accepted);
    } catch (err) {
      setError(
        (err as BtxRequestError).message ||
          "Couldn’t confirm the reset. Check the market phase and retry.",
      );
    } finally {
      await refresh();
      sending.current = false;
      setBusy(false);
    }
  }

  return (
    <>
      {waiting && !resuming && (
        <StatusBanner
          tone="info"
          title="IPO reset queued"
          description="Orders ahead of the reset will be processed first."
        />
      )}
      {error && <StatusBanner tone="error" title={error} />}
      <button
        className={s.outline}
        disabled={disabled || busy || waiting}
        onClick={() => {
          setTarget(ipoAt);
          dialog.current?.showModal();
        }}
      >
        {busy
          ? "Submitting reset…"
          : waiting
            ? "Waiting for reset…"
            : resuming
              ? "Resume IPO reset"
              : "Reset IPO"}
      </button>
      <dialog className={s.dialog} ref={dialog} aria-labelledby="reset-title">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void confirm();
          }}
        >
          <h2 id="reset-title">Return the market to seed?</h2>
          <p>
            This restores $100 seed pricing and resets the live price chart.
            Listed companies can raise seed funding again. Investors keep their
            shares, cash balances, and trade history. Shares held count toward
            the next IPO.
          </p>
          <div className={s.actions}>
            <button
              type="button"
              className={s.outline}
              onClick={() => dialog.current?.close()}
            >
              Cancel
            </button>
            <button
              className={s.warm}
              disabled={disabled || busy || target !== ipoAt}
            >
              Confirm reset
            </button>
          </div>
        </form>
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
  const stage = marketStage(market, now);
  const ended = projects.filter(
    (project) => listingState(project, stage) === "ENDED",
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
        <h2>
          {ipo.resetting
            ? "IPO reset in progress"
            : ipo.live
              ? "IPO launched"
              : "Launch IPO"}
        </h2>
        <p>
          {ipo.resetting
            ? "Trading is paused while seed prices are restored."
            : ipo.live
              ? "Net seed shares were snapshotted and opening prices set. The market is live: buys and sells now move prices."
              : "Takes a snapshot of net seed shares per company. The snapshot sets each opening price. The seed round closes and live trading starts."}
        </p>
      </header>
      {!ipo.live && !ipo.pending && active > 0 && (
        <>
          <div className={s.tableBox}>
            <div className={s.tableHeader + " " + s.row}>
              Seed funding
              <span>
                {active} open · {ended} closed
              </span>
            </div>
            <table>
              <tbody>
                {projects.map((p) => {
                  const state = listingState(p, stage);
                  return (
                    <tr key={p.projectId}>
                      <td>{companyName(p)}</td>
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
                            ? "Open"
                            : state === "ENDED"
                              ? "Closed"
                              : "Paused"}
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
            title="IPO closes seed funding for all companies"
            description="Review the active companies before launching."
          />
        </>
      )}
      {ipo.resetting ? null : ipo.pending ? (
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
      {market.phase === "SEED" && market.lastReset?.status === "SUCCEEDED" && (
        <StatusBanner
          tone="success"
          title="IPO reset completed"
          description="The market is back in seed."
        />
      )}
      {market.lastReset?.status === "DECLINED" &&
      market.lastReset.ipoAt === market.ipoAt ? (
        <StatusBanner
          tone="warning"
          title={market.lastReset.message || "IPO reset declined"}
        />
      ) : (
        (ipo.live || ipo.resetting) &&
        market.ipoAt != null && (
          <ResetControl
            key={market.ipoAt}
            ipoAt={market.ipoAt}
            resuming={ipo.resetting}
            refresh={ipo.refresh}
            disabled={grantBusy}
          />
        )
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
          <h2 id="ipo-title">Launch the IPO for KickStart 2026?</h2>
          <p>
            This snapshots net seed shares for {projects.length} companies, sets
            opening prices, and ends the seed round for everyone. Trading goes
            live once every company is ready.
          </p>
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
              Launch IPO
            </button>
          </div>
        </form>
      </dialog>
    </AngledPanel>
  );
}

export function AdminOverview({
  market,
  userId,
  now,
  initials,
}: MarketPageProps) {
  const ipo = useIpo(market, userId);
  const fundingStage = marketStage(market, now);
  const active = market.projects.filter(
    (project) => listingState(project, fundingStage) === "ACTIVE",
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
  return (
    <div className={s.page}>
      <Link className={s.exit} href={exchangePath}>
        ← Exit admin
      </Link>
      <header className={s.heading}>
        <div>
          <h1>BTX Admin</h1>
          <small>KickStart 2026</small>
        </div>
        <span>{initials}</span>
      </header>
      <small className={s.adminBadge}>Admin</small>
      {!ipo.resetting && <Timeline stage={stage} active={active} />}
      <div className={s.fields}>
        <IpoPanel
          market={market}
          now={now}
          ipo={ipo}
          active={active}
          grantBusy={batch.sending}
        />
        {run ? (
          <GrantResults
            batch={batch}
            run={run}
            people={roster.data ?? []}
            paused={ipo.pending}
          />
        ) : (
          <GrantFunds roster={roster} batch={batch} paused={ipo.pending} />
        )}
      </div>
    </div>
  );
}
