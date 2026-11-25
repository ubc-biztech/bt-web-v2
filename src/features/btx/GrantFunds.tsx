import { useRouter } from "next/router";
import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AngledPanel, StatusBanner } from "./BtxUI";
import { grant, investors, type GrantOutcome, type Investor } from "./adminApi";
import { compactMoney } from "./market";
import s from "./Admin.module.css";

interface GrantRun {
  id: string;
  amountCents: number;
  targets: string[];
  outcomes: GrantOutcome[];
}

const GRANT_BATCH_SIZE = 100;

export function useGrantRun(key: string) {
  const [run, setRun] = useState<GrantRun | null>(() => {
    const saved = sessionStorage.getItem(key);
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);

  function save(value: GrantRun | null) {
    if (value) sessionStorage.setItem(key, JSON.stringify(value));
    else sessionStorage.removeItem(key);
    setRun(value);
  }

  async function send(batch: GrantRun) {
    if (lock.current) return;
    lock.current = true;
    setSending(true);
    setError("");
    const results = new Map(batch.outcomes.map((row) => [row.userId, row]));
    try {
      save(batch);
      // The API accepts up to 100 targets. Retry the original chunk so receipts deduplicate credits.
      for (let i = 0; i < batch.targets.length; i += GRANT_BATCH_SIZE) {
        const targets = batch.targets.slice(i, i + GRANT_BATCH_SIZE);
        if (targets.every((email) => results.get(email)?.status === "APPLIED"))
          continue;
        const outcomes = await grant({
          requestId: `${batch.id}-${i / GRANT_BATCH_SIZE + 1}`,
          targets,
          amountCents: batch.amountCents,
        });
        for (const outcome of outcomes) results.set(outcome.userId, outcome);
        save({ ...batch, outcomes: Array.from(results.values()) });
      }
    } catch (err) {
      setError(
        (err as Error)?.message ||
          "Check the grant results and retry this request.",
      );
    } finally {
      lock.current = false;
      setSending(false);
    }
  }

  return { run, sending, error, send, done: () => save(null) };
}

export function useInvestors(eventId: string, userId: string) {
  return useQuery({
    queryKey: ["btx", eventId, "investors", userId],
    queryFn: investors,
  });
}

type Batch = ReturnType<typeof useGrantRun>;
type GrantResultProps = {
  batch: Batch;
  run: GrantRun;
  paused: boolean;
};

export function GrantFunds({
  roster,
  batch,
  paused,
}: {
  roster: ReturnType<typeof useInvestors>;
  batch: Batch;
  paused: boolean;
}) {
  const [requestId] = useState(() => crypto.randomUUID());
  const { query: route } = useRouter();
  const [amount, setAmount] = useState(
    () => [route.amount].flat()[0] || "100,000",
  );
  const [choose, setChoose] = useState(false);
  const [selection, setSelection] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const people = roster.data ?? [];
  const query = search.trim().toLowerCase();
  const targets = people
    .filter((person) => !choose || selection.includes(person.email))
    .map((person) => person.email);
  const visible = people.filter((person) =>
    `${person.name} ${person.email}`.toLowerCase().includes(query),
  );
  const rawAmount = amount.trim();
  const cents = /^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(rawAmount)
    ? Math.round(Number(rawAmount.replaceAll(",", "")) * 100)
    : 0;
  const validAmount = cents > 0 && Number.isSafeInteger(cents);
  const total = cents * targets.length;
  const disabled =
    paused ||
    batch.sending ||
    roster.isError ||
    !targets.length ||
    !validAmount ||
    !Number.isSafeInteger(total);
  const formatted = compactMoney(validAmount ? cents : 0);
  const recipients = `${targets.length} investor${targets.length === 1 ? "" : "s"}`;

  function submit() {
    if (disabled || batch.run) return;
    void batch.send({
      id: requestId,
      targets,
      amountCents: cents,
      outcomes: [],
    });
  }
  const fields = (
    <>
      <label className={s.field}>
        Event
        <input readOnly value="KickStart 2026" />
      </label>
      <div className={s.field}>
        Recipients
        <div className={s.segment}>
          <button
            className={s.toggle}
            aria-pressed={!choose}
            onClick={() => setChoose(false)}
          >
            All investors
          </button>
          <button
            className={s.toggle}
            aria-pressed={choose}
            onClick={() => setChoose(true)}
          >
            Choose investors
          </button>
        </div>
      </div>
      <label className={s.field}>
        Amount per investor
        <input
          inputMode="decimal"
          value={"$" + amount}
          disabled={paused}
          onChange={(e) => setAmount(e.target.value.replace(/^\$/, ""))}
          aria-invalid={!!amount && !validAmount}
        />
        {amount && !validAmount && (
          <small>
            Enter a positive dollar amount with up to two decimal places.
          </small>
        )}
      </label>
      <div className="rounded-xl border border-[#324e6b] bg-[#142034] p-4">
        <span className={s.muted}>
          {recipients} × {formatted}
        </span>
        <strong>
          {Number.isSafeInteger(total) ? compactMoney(total) : "—"} total
        </strong>
      </div>
      <small className={s.muted}>
        Request ID {requestId.slice(0, 8)}… is reused if you retry.
      </small>
      {roster.isError && (
        <StatusBanner
          tone="error"
          title="Couldn’t load investors"
          onRetry={() => roster.refetch()}
        />
      )}
      <button className={s.primary} disabled={disabled} onClick={submit}>
        {paused
          ? "Paused during IPO"
          : `Grant ${formatted} each to ${recipients}`}
      </button>
    </>
  );
  return (
    <AngledPanel className={s.panel}>
      <header>
        <h2>Grant funds</h2>
        <p>
          Grant an equal amount to each selected investor. Grants increase
          available cash and allocated funds.
        </p>
      </header>

      <div className={s.columns + " " + s.picker}>
        <div className={s.fields}>{fields}</div>
        <div className={s.fields}>
          <input
            type="search"
            aria-label="Search investors by name or email"
            placeholder="Search investors by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className={s.tableBox}>
            <div className={s.tableHeader + " " + s.row}>
              Investor{" "}
              <span>
                {targets.length} of {people.length} selected
              </span>
            </div>
            <div className="max-h-[475px] overflow-auto">
              {visible.map((person) => (
                <label className={s.person} key={person.email}>
                  <input
                    type="checkbox"
                    disabled={!choose || paused}
                    checked={!choose || selection.includes(person.email)}
                    onChange={(e) => {
                      const { checked } = e.target;
                      setSelection((emails) =>
                        checked
                          ? [...emails, person.email]
                          : emails.filter((email) => email !== person.email),
                      );
                    }}
                  />
                  <span>
                    {person.name}
                    <small className={s.muted}>{person.email}</small>
                  </span>
                </label>
              ))}
              {!visible.length && (
                <p className="p-4">
                  {roster.isPending
                    ? "Loading investors…"
                    : "No matching investors."}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AngledPanel>
  );
}

export function GrantResults({
  batch,
  run,
  people,
  paused,
}: GrantResultProps & {
  people: Investor[];
}) {
  const [all, setAll] = useState(false);
  const results = new Map(run.outcomes.map((row) => [row.userId, row]));
  const names = new Map(people.map((person) => [person.email, person.name]));
  const failed = run.outcomes.filter((row) => row.status === "REJECTED").length;
  const applied = run.outcomes.length - failed;
  const unknown = run.targets.length - run.outcomes.length;
  const canRetry = failed > 0 || unknown > 0;
  const amount = compactMoney(run.amountCents);
  const visible = run.targets.filter(
    (email) => all || !failed || results.get(email)?.status === "REJECTED",
  );
  let title = `Granted ${amount} to ${applied} investor${applied === 1 ? "" : "s"}`;
  if (batch.sending) title = "Sending grants…";
  else if (unknown) title = "Some grant outcomes are unconfirmed";
  else if (failed) title = `${failed} grant${failed === 1 ? "" : "s"} failed`;
  return (
    <AngledPanel className={s.panel}>
      <header>
        <h2>Grant funds</h2>
        <p>
          Results for request {run.id.slice(0, 8)}… to {run.targets.length}{" "}
          investors, {amount} each.
        </p>
      </header>
      <StatusBanner
        tone={batch.sending ? "info" : canRetry ? "warning" : "success"}
        title={title}
        description={batch.error || undefined}
      />
      <dl className="grid grid-cols-2 gap-3 md:hidden">
        <div>
          <dt>Succeeded</dt>
          <dd>{applied}</dd>
        </div>
        <div>
          <dt>Failed</dt>
          <dd>{failed}</dd>
        </div>
      </dl>
      {failed > 0 && (
        <div className={s.segment}>
          <button
            className={s.toggle}
            aria-pressed={!all}
            onClick={() => setAll(false)}
          >
            Failed ({failed})
          </button>
          <button
            className={s.toggle}
            aria-pressed={all}
            onClick={() => setAll(true)}
          >
            All ({run.targets.length})
          </button>
        </div>
      )}
      <div className={s.tableBox}>
        <table>
          <thead>
            <tr>
              <th>Investor</th>
              <th>Amount</th>
              <th>Outcome</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((email) => {
              const row = results.get(email);
              return (
                <tr key={email}>
                  <td>
                    {names.get(email) ?? email}
                    <small className={s.muted}>{email}</small>
                  </td>
                  <td>{amount}</td>
                  <td>
                    <span
                      className={s.badge}
                      style={{
                        color:
                          row?.status === "APPLIED"
                            ? "#38d3a2"
                            : row
                              ? "#ff5c7a"
                              : "#a8b5d6",
                      }}
                    >
                      {row?.status === "APPLIED"
                        ? "Granted"
                        : row
                          ? "Failed"
                          : batch.sending
                            ? "Sending"
                            : "Unconfirmed"}
                    </span>{" "}
                    {row?.message}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {failed > 0 && (
          <p className={s.muted + " px-4 pb-2"}>
            {failed} failed · {applied} granted
            {unknown > 0 && ` · ${unknown} unconfirmed`}
          </p>
        )}
      </div>
      <div className={s.actions}>
        {canRetry && (
          <button
            className={s.primary}
            disabled={paused || batch.sending}
            onClick={() => batch.send(run)}
          >
            {unknown ? "Retry request" : `Retry ${failed} failed`}
          </button>
        )}
        <button
          className={s.outline}
          disabled={batch.sending || unknown > 0}
          onClick={batch.done}
        >
          Done
        </button>
        {canRetry && (
          <small className={s.muted}>
            Retry reuses the same request IDs so granted investors aren’t paid
            twice.
          </small>
        )}
      </div>
    </AngledPanel>
  );
}
