import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import * as api from "./seedApi";
import { stockError } from "./stockError";
import type { Notice } from "./BtxUI";

export function useTradeOrder(
  userId: string,
  market: api.Market,
  selected: string,
  now: number,
  ownCompany: boolean,
) {
  const [notice, setNotice] = useState<Notice | null>(null);
  const [receipt, setReceipt] = useState<api.Trade | null>(null);
  const [busy, setBusy] = useState(false);
  const inFlight = useRef<api.TradeOrder | null>(null);
  const storageKey = JSON.stringify([
    "btx-pending-order",
    market.eventId,
    userId,
  ]);
  // undefined until restored, null when a new order can be placed.
  const [order, setOrder] = useState<api.TradeOrder | null>();
  useEffect(() => {
    try {
      const saved: api.TradeOrder | null = JSON.parse(
        sessionStorage.getItem(storageKey) ?? "null",
      );
      setOrder(saved);
      if (saved) {
        setSide(saved.side ?? "BUY");
        setQuantity(String(saved.shares));
      }
    } catch {
      setNotice({
        tone: "error",
        title: "Order recovery unavailable",
        description: "Check browser storage before placing a trade.",
      });
    }
    return () => {
      inFlight.current = null;
    };
  }, [storageKey]);
  const [quantity, setQuantity] = useState("10");
  const [side, setSide] = useState<api.Trade["side"]>("BUY");
  const company = market.projects.find((p) => p.projectId === selected);
  const shares = Number(quantity);
  const seedOpen =
    market.phase === "SEED" &&
    company?.seedStatus === "ACTIVE" &&
    now < (company.seedEndsAt ?? 0) &&
    now < market.eventEndsAt;
  const canQuote =
    !!userId &&
    order === null &&
    !busy &&
    ((seedOpen && side === "BUY") ||
      (market.phase === "LIVE" && !!company && now < market.eventEndsAt)) &&
    !ownCompany &&
    Number.isSafeInteger(shares) &&
    shares > 0;
  const quote = useQuery<api.Quote, api.BtxRequestError>({
    queryKey: [
      "btx",
      "quote",
      userId,
      selected,
      shares,
      side,
      market.phase,
      order?.tradeId,
    ],
    queryFn: () => api.quote(selected, shares, side),
    enabled: canQuote,
    retry: false,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
  });
  const preview = quote.data;
  const status = useQuery<api.Trade, api.TradeRequestError>({
    queryKey: ["btx-seed", market.eventId, userId, "order", order?.tradeId],
    queryFn: () => api.tradeStatus(order!),
    enabled: !!order && !busy,
    retry: false,
    refetchInterval: (query) =>
      query.state.data && query.state.data.status !== "PENDING" ? false : 2000,
  });

  const confirmed = status.data;
  const queryClient = useQueryClient();

  useEffect(() => {
    if (busy || !order || !confirmed || confirmed.status === "PENDING") return;

    const filled = confirmed.status === "FILLED";
    if (order.projectId === selected) {
      setReceipt(filled ? confirmed : null);
      setNotice(
        filled
          ? { tone: "success", title: "Order filled" }
          : stockError(confirmed.rejection?.code ?? "TRADE_REJECTED"),
      );
    } else {
      setQuantity("10");
      setSide("BUY");
      setNotice({
        tone: filled ? "success" : "warning",
        title: filled ? "Previous order filled" : "Previous order rejected",
      });
    }
    sessionStorage.removeItem(storageKey);
    setOrder(null);
    void queryClient.invalidateQueries({
      queryKey: ["btx-seed", market.eventId, userId, "portfolio"],
    });
  }, [
    busy,
    confirmed,
    order,
    storageKey,
    selected,
    queryClient,
    market.eventId,
    userId,
  ]);

  const orderNotFound = !!order && status.error?.status === 404;
  const canConfirm =
    canQuote &&
    preview?.phase === market.phase &&
    now < preview.expiresAt &&
    !quote.isFetching &&
    !quote.isError;

  function dismissReceipt() {
    setReceipt(null);
    setNotice(null);
  }

  async function submitOrder() {
    if (inFlight.current) return;
    let next = order;
    if (next) {
      if (!orderNotFound) return;
    } else {
      if (!canConfirm || !preview) return;
      next = {
        projectId: selected,
        shares,
        side,
        tradeId: api.tradeId(),
        limitPriceCents: preview.priceCents,
      };
      try {
        if (sessionStorage.getItem(storageKey) !== null) return;
        sessionStorage.setItem(storageKey, JSON.stringify(next));
        setOrder(next);
      } catch {
        setNotice({
          tone: "error",
          title: "Couldn’t save the order",
          description: "Enable browser storage and try again.",
        });
        return;
      }
    }
    inFlight.current = next;
    dismissReceipt();
    setBusy(true);

    try {
      await api.placeOrder(next);
    } catch (error) {
      const reason = error as api.BtxRequestError | undefined;
      const status = reason?.status ?? 0;
      const code = reason?.data?.code;
      const declined =
        status >= 400 &&
        status < 500 &&
        status !== 408 &&
        reason?.message !== "tradeId already used";

      // A rejection of a retry cannot settle an earlier POST still in flight.
      if (inFlight.current !== next) return;
      if (declined && !order) {
        sessionStorage.removeItem(storageKey);
        setOrder(null);
        if (code === "LIMIT_PRICE_EXCEEDED" || code === "STALE_QUOTE")
          void quote.refetch();
      }
      if (code) setNotice(stockError(code));
      else if (declined)
        setNotice({
          tone: "error",
          title: order ? "Retry declined" : "Order declined",
          description: reason?.message,
        });
    } finally {
      inFlight.current = null;
      setBusy(false);
    }
  }

  return {
    company,
    receipt,
    dismissReceipt,
    side,
    changeSide(value: api.Trade["side"]) {
      dismissReceipt();
      setSide(value);
    },
    busy,
    fetchingQuote: quote.isFetching,
    quoteError: quote.error,
    ownCompany,
    quantity,
    changeQuantity(value: string) {
      dismissReceipt();
      setQuantity(value);
    },
    preview,
    notice,
    priceChanged: notice === stockError("STALE_QUOTE"),
    order,
    orderNotFound,
    statusUnknown: !!order && status.isError,
    seedOpen,
    quantityLocked: busy || order !== null,
    canQuote,
    canConfirm,
    requestQuote: () => quote.refetch(),
    submitOrder,
  };
}
