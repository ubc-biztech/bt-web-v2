import styles from "./btx.module.css";

export function ConnectionNotice({
  connection,
  lastUpdate,
  retry,
}: {
  connection: "offline" | "reconnecting";
  lastUpdate: number;
  retry: () => void;
}) {
  const offline = connection === "offline";
  const time = new Date(lastUpdate).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
  return (
    <div
      role="status"
      className={styles.connectionNotice}
      data-offline={offline}
    >
      <span aria-hidden="true" className={styles.connectionIcon}>
        <span className="md:hidden">!</span>
        <span className="hidden md:inline">{offline ? "!" : "i"}</span>
      </span>
      <div className="flex-1">
        <strong className="block text-[13px]">
          {offline ? "You’re offline" : "Reconnecting…"}
        </strong>
        <p className="text-[12px] text-[#b5c1da]">
          <span className="md:hidden">
            {offline
              ? "Showing the last prices we had. Trading is unavailable until you reconnect."
              : "Prices may be out of date. Trading is paused until we’re back."}
          </span>
          <span className="hidden md:inline">
            {offline
              ? `Showing prices from ${time}. Trading is paused until you’re back online. Your cash and holdings are safe.`
              : "Live prices may be out of date while we catch up. We refresh the quote before you confirm any trade."}
          </span>
        </p>
      </div>
      {offline && (
        <button
          type="button"
          onClick={retry}
          className="hidden shrink-0 rounded-full border border-current px-4 py-1 text-xs font-medium md:block"
        >
          Retry now
        </button>
      )}
    </div>
  );
}

export function BackOnlineToast() {
  return (
    <div role="status" className={styles.connectionToast}>
      <span aria-hidden="true" className="text-[#38d3a2]">
        ✓
      </span>
      <div className="flex flex-col md:flex-row md:items-center md:gap-3">
        <strong className="text-[14px] md:text-[13px]">Back online</strong>
        <span className="text-[12px] text-[#b5c1da]">
          Prices updated just now
        </span>
      </div>
    </div>
  );
}
