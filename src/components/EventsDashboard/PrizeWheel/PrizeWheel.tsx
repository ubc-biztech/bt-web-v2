import Image from "next/image";
import { Urbanist } from "next/font/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Disc3,
  Check,
  Maximize2,
  Pencil,
  RefreshCw,
  Sparkles,
  Trash2,
  Trophy,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { randomEntryIndex, WheelEntry } from "./entries";
import styles from "./PrizeWheel.module.css";

const urbanist = Urbanist({ subsets: ["latin"] });
const COLORS = [
  "#75D450",
  "#A2B1D5",
  "#C6F4B4",
  "#7282A8",
  "#ADE198",
  "#BDC8E3",
];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entries: WheelEntry[];
  eventName: string;
  loading?: boolean;
  error?: string | null;
  unnamed?: number;
  onRefresh: () => void;
};

export default function PrizeWheel({
  open,
  onOpenChange,
  entries,
  eventName,
  loading = false,
  error,
  unnamed = 0,
  onRefresh,
}: Props) {
  const [spinning, setSpinning] = useState(false);
  const [spinError, setSpinError] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<WheelEntry | null>(null);
  const [history, setHistory] = useState<WheelEntry[]>([]);
  const [removeWinners, setRemoveWinners] = useState(true);
  const [muted, setMuted] = useState(false);
  const [search, setSearch] = useState("");
  const [entryOverrides, setEntryOverrides] = useState(
    () => new Map<string, { name?: string; removed?: boolean }>(),
  );
  const [editingEntry, setEditingEntry] = useState<WheelEntry | null>(null);
  const [lastRemoved, setLastRemoved] = useState<WheelEntry | null>(null);
  const [spinEntries, setSpinEntries] = useState<WheelEntry[] | null>(null);
  const [fullscreenError, setFullscreenError] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const wheel = useRef<HTMLDivElement>(null);
  const audio = useRef<AudioContext | null>(null);
  const frame = useRef(0);
  const running = useRef(false);
  const mutedRef = useRef(muted);
  mutedRef.current = muted;
  const eligible = useMemo(
    () =>
      entries.flatMap((entry) => {
        const override = entryOverrides.get(entry.id);
        if (
          override?.removed ||
          (removeWinners && history.some((past) => past.id === entry.id))
        )
          return [];
        return [{ ...entry, name: override?.name ?? entry.name }];
      }),
    [entries, entryOverrides, history, removeWinners],
  );
  // Keep the winning slice under the pointer until the next draw.
  const displayed = spinEntries || eligible;
  const filtered = eligible.filter((entry) =>
    entry.name.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(
    () => () => {
      cancelAnimationFrame(frame.current);
      void audio.current?.close();
    },
    [],
  );

  function tone(frequency: number, duration = 0.045, delay = 0) {
    const context = audio.current;
    if (!context || context.state !== "running" || mutedRef.current) return;
    try {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = context.currentTime + delay;
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.1, start + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + duration);
    } catch {
      /* A sound failure must not interrupt the draw. */
    }
  }

  function spin() {
    if (running.current || loading || error || editingEntry || !eligible.length)
      return;
    running.current = true;
    setSpinError(null);
    let currentRotation = rotation;

    function failSpin() {
      running.current = false;
      setSpinning(false);
      cancelAnimationFrame(frame.current);
      setRotation(currentRotation);
      setSpinEntries(null);
      setWinner(null);
      setSpinError("Couldn’t complete the spin. Try again.");
    }

    try {
      try {
        audio.current ||= new AudioContext();
        void audio.current.resume().catch(() => {});
      } catch {
        /* Audio is optional; the draw still works. */
      }
      const pool = [...eligible];
      const index = randomEntryIndex(pool.length);
      const slice = 360 / pool.length;
      const target = (360 - (index + 0.5) * slice) % 360;
      const startRotation = rotation;
      const distance = 360 * 6 + ((target - (startRotation % 360) + 360) % 360);
      const duration = window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches
        ? 150
        : 6500;
      const started = performance.now();
      let lastTick = -1;
      setSpinEntries(pool);
      setWinner(null);
      setSpinning(true);
      const animate = (now: number) => {
        try {
          const progress = Math.min((now - started) / duration, 1);
          const angle =
            startRotation + distance * (1 - Math.pow(1 - progress, 4));
          if (wheel.current)
            wheel.current.style.transform = `rotate(${angle}deg)`;
          currentRotation = angle;
          const tick = Math.floor(angle / Math.max(slice, 8));
          if (tick !== lastTick) {
            tone(650 + progress * 350);
            lastTick = tick;
          }
          if (progress < 1) frame.current = requestAnimationFrame(animate);
          else {
            setRotation(angle);
            setWinner(pool[index]);
            setHistory((previous) => [...previous, pool[index]]);
            setSpinning(false);
            running.current = false;
            [523.25, 659.25, 783.99, 1046.5].forEach((note, i) =>
              tone(note, 0.4, i * 0.12),
            );
          }
        } catch {
          failSpin();
        }
      };
      frame.current = requestAnimationFrame(animate);
    } catch {
      failSpin();
    }
  }

  function updateEntry(
    id: string,
    changes: { name?: string; removed?: boolean },
  ) {
    if (running.current || loading) return;
    setEntryOverrides((previous) => {
      const next = new Map(previous);
      next.set(id, { ...next.get(id), ...changes });
      return next;
    });
    setSpinEntries(null);
    setWinner(null);
  }

  async function fullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await panel.current?.requestFullscreen();
      setFullscreenError(false);
    } catch {
      setFullscreenError(true);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!running.current) {
          if (!value) setEditingEntry(null);
          onOpenChange(value);
        }
      }}
    >
      <DialogContent
        ref={panel}
        className={`${urbanist.className} ${styles.dialog}`}
        onEscapeKeyDown={(e) => {
          if (spinning) e.preventDefault();
          if (editingEntry) {
            e.preventDefault();
            setEditingEntry(null);
          }
        }}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <div className={styles.shell}>
          <header className={styles.header}>
            <div className={styles.brand}>
              <Image
                src="/assets/biztech_logo.svg"
                alt=""
                width={32}
                height={32}
              />
              <span>UBC BizTech</span>
            </div>
            <div className={styles.tools}>
              <Button
                variant="outline"
                size="icon"
                aria-label={muted ? "Turn sound on" : "Mute sound"}
                aria-pressed={muted}
                onClick={() => setMuted(!muted)}
              >
                {muted ? <VolumeX size={19} /> : <Volume2 size={19} />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="Toggle fullscreen"
                onClick={fullscreen}
              >
                <Maximize2 size={19} />
              </Button>
            </div>
          </header>
          <div className={styles.layout}>
            <section className={styles.stage}>
              <div className={styles.eyebrow}>
                {eventName} · Attendee feedback
              </div>
              <DialogTitle className={styles.title}>Spin the wheel</DialogTitle>
              <DialogDescription className={styles.description}>
                Pick a winner from your attendee feedback submissions.
              </DialogDescription>
              <div className={styles.wheelArea}>
                <div className={styles.halo} />
                <div className={styles.pointer} aria-hidden="true" />
                <div className={styles.rim}>
                  <div
                    ref={wheel}
                    className={styles.wheel}
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      background: displayed.length
                        ? `conic-gradient(${displayed.map((_, i) => `${COLORS[i % COLORS.length]} ${(i * 360) / displayed.length}deg ${((i + 1) * 360) / displayed.length}deg`).join(",")})`
                        : "#26324D",
                    }}
                  >
                    {displayed.map((entry, index) => (
                      <div
                        key={entry.id}
                        className={styles.labelArm}
                        style={{
                          transform: `rotate(${((index + 0.5) * 360) / displayed.length - 90}deg)`,
                        }}
                      >
                        <span
                          style={{
                            fontSize:
                              displayed.length > 32
                                ? 8
                                : displayed.length > 18
                                  ? 10
                                  : 13,
                          }}
                        >
                          {displayed.length <= 80 ? entry.name : index + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className={styles.hub} aria-hidden="true">
                    <Image
                      src="/assets/biztech_logo.svg"
                      alt=""
                      width={40}
                      height={40}
                    />
                  </div>
                </div>
                <div className={styles.wheelCaption}>
                  {spinning
                    ? "Picking a winner…"
                    : winner
                      ? "Congratulations!"
                      : "Each entry has an equal chance."}
                </div>
              </div>
            </section>
            <aside className={styles.sidebar}>
              <div className={styles.drawLabel}>
                <Sparkles size={16} /> Prize draw{" "}
                <span>
                  #{String(history.length + (winner ? 0 : 1)).padStart(2, "0")}
                </span>
              </div>
              <div
                className={styles.result}
                aria-live="polite"
                aria-atomic="true"
              >
                <span className={styles.resultKicker}>
                  {spinning
                    ? "Drawing a winner"
                    : winner
                      ? "Congratulations!"
                      : "Ready to draw"}
                </span>
                <h2>
                  {spinning
                    ? "Good luck!"
                    : winner
                      ? winner.name
                      : "Who’s feeling lucky?"}
                </h2>
                <p>
                  {winner
                    ? "Come claim your prize!"
                    : `${eligible.length} eligible entries`}
                </p>
              </div>
              <Button
                variant="green"
                size="lg"
                className={styles.spinButton}
                onClick={spin}
                disabled={
                  spinning ||
                  loading ||
                  !!error ||
                  !!editingEntry ||
                  !eligible.length
                }
              >
                <Disc3
                  size={21}
                  className={spinning ? styles.spinningIcon : ""}
                />
                {spinning
                  ? "Spinning…"
                  : loading
                    ? "Loading attendees…"
                    : eligible.length
                      ? winner
                        ? "Spin again"
                        : "Spin the wheel"
                      : "No eligible entries"}
              </Button>
              <label className={styles.toggle}>
                <Checkbox
                  checked={removeWinners}
                  disabled={spinning || !!editingEntry}
                  onCheckedChange={(checked) => {
                    setRemoveWinners(checked === true);
                    setSpinEntries(null);
                    setWinner(null);
                  }}
                />{" "}
                Remove winners from future spins
              </label>
              {(error || spinError) && (
                <p className={styles.error} role="alert">
                  {error || spinError}
                </p>
              )}
              {fullscreenError && (
                <p className={styles.note}>
                  Fullscreen is unavailable in this browser.
                </p>
              )}
              <section className={styles.entrants}>
                <div className={styles.sectionHead}>
                  <h3>
                    In the running <span>{eligible.length}</span>
                  </h3>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setSpinEntries(null);
                      setWinner(null);
                      onRefresh();
                    }}
                    disabled={spinning || loading || !!editingEntry}
                    aria-label="Refresh attendees"
                  >
                    <RefreshCw size={16} />
                  </Button>
                </div>
                <Input
                  className={styles.search}
                  type="search"
                  aria-label="Find an attendee"
                  placeholder="Find a name…"
                  value={search}
                  disabled={!!editingEntry}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <div className={styles.names}>
                  {filtered.map((entry) => (
                    <div key={entry.id} className={styles.entryRow}>
                      {editingEntry?.id === entry.id ? (
                        <form
                          className={styles.entryEditor}
                          onSubmit={(event) => {
                            event.preventDefault();
                            const name = editingEntry.name.trim();
                            if (!name) return;
                            updateEntry(entry.id, { name });
                            setEditingEntry(null);
                          }}
                        >
                          <Input
                            autoFocus
                            aria-label="Attendee name"
                            value={editingEntry.name}
                            onChange={(event) =>
                              setEditingEntry({
                                ...editingEntry,
                                name: event.target.value,
                              })
                            }
                          />
                          <Button
                            type="submit"
                            variant="green-outline"
                            size="icon"
                            aria-label="Save name"
                            disabled={!editingEntry.name.trim()}
                          >
                            <Check size={16} />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Cancel name edit"
                            onClick={() => setEditingEntry(null)}
                          >
                            <X size={16} />
                          </Button>
                        </form>
                      ) : (
                        <>
                          <span className={styles.nameDot} />
                          <span className={styles.entryName}>{entry.name}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Edit ${entry.name}`}
                            disabled={spinning || loading || !!editingEntry}
                            onClick={() => setEditingEntry(entry)}
                          >
                            <Pencil size={15} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Remove ${entry.name} from wheel`}
                            disabled={spinning || loading || !!editingEntry}
                            onClick={() => {
                              updateEntry(entry.id, { removed: true });
                              setLastRemoved(entry);
                            }}
                          >
                            <Trash2 size={15} />
                          </Button>
                        </>
                      )}
                    </div>
                  ))}
                  {!filtered.length && (
                    <p className={styles.note}>
                      {search
                        ? "No matching names."
                        : loading
                          ? "Loading feedback submissions…"
                          : entries.length
                            ? "No entries remaining."
                            : "No names yet. Refresh after attendees submit feedback."}
                    </p>
                  )}
                </div>
                {lastRemoved && (
                  <div className={styles.removedNotice} role="status">
                    <span>Removed {lastRemoved.name}.</span>
                    <Button
                      variant="green-outline"
                      size="sm"
                      disabled={spinning || loading || !!editingEntry}
                      onClick={() => {
                        updateEntry(lastRemoved.id, { removed: false });
                        setLastRemoved(null);
                      }}
                    >
                      Undo
                    </Button>
                  </div>
                )}
                {(unnamed > 0 || displayed.length > 80) && (
                  <p className={styles.note}>
                    {unnamed > 0 && `${unnamed} unnamed submissions excluded.`}
                    {displayed.length > 80 &&
                      " Wheel numbers follow the entrant order."}
                  </p>
                )}
              </section>
              <section className={styles.history}>
                <div className={styles.sectionHead}>
                  <h3>
                    <Trophy size={15} /> Winner history
                  </h3>
                  {history.length > 0 && (
                    <Button
                      variant="green-outline"
                      size="sm"
                      disabled={spinning || !!editingEntry}
                      onClick={() => {
                        setHistory([]);
                        setWinner(null);
                        setSpinEntries(null);
                      }}
                    >
                      Reset draw
                    </Button>
                  )}
                </div>
                {history.length ? (
                  <ol>
                    {history.map((entry, i) => (
                      <li key={`${entry.id}-${i}`}>
                        <span>{String(i + 1).padStart(2, "0")}</span>
                        {entryOverrides.get(entry.id)?.name ?? entry.name}
                        <Trophy size={13} />
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className={styles.note}>No winners yet.</p>
                )}
              </section>
            </aside>
          </div>
          {winner && (
            <div
              key={history.length}
              className={styles.confetti}
              aria-hidden="true"
            >
              {Array.from({ length: 90 }, (_, i) => (
                <i
                  key={i}
                  style={{
                    left: `${(i * 37) % 100}%`,
                    background: COLORS[i % COLORS.length],
                    animationDelay: `${(i % 15) * 0.07}s`,
                    animationDuration: `${2.6 + (i % 7) * 0.23}s`,
                    transform: `rotate(${i * 47}deg)`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
