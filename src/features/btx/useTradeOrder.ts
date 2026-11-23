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
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);

  const [order, setOrder] = useState<api.TradeOrder | null>(null);
  const [quantity, setQuantity] = useState("10");
  const [side, setSide] = useState<api.Trade["side"]>("BUY");
  const company = market.projects.find((p) => p.projectId === selected);
  const shares = Number(quantity);
  const seedOpen =
    market.phase === "SEED" &&
    company?.seedStatus === "ACTIVE" &&
    now < (company.seedEndsAt ?? 0) &&
    now < market.eventEndsAt;
  const canRequestQuote =
    ((seedOpen && side === "BUY") ||
      (market.phase === "LIVE" && !!company && now < market.eventEndsAt)) &&
    !ownCompany &&
    Number.isSafeInteger(shares) &&
    shares > 0;
  const quote = useQuery<api.Quote, api.TradeRequestError>({
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
    enabled: !!userId && canRequestQuote && !order,
    retry: false,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
  });
  const preview = quote.data;
  const quoteIsCurrent =
    canRequestQuote &&
    preview?.projectId === selected &&
    preview.shares === shares &&
    preview.side === side &&
    preview.phase === market.phase &&
    now < preview.expiresAt;

  const status = useQuery({
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
    if (!order || !confirmed || confirmed.status === "PENDING") return;

    setNotice(
      confirmed.status === "FILLED"
        ? { tone: "success", title: "Order filled" }
        : stockError(confirmed.rejection?.code ?? "TRADE_REJECTED"),
    );
    setOrder(null);

    void queryClient.invalidateQueries({
      queryKey: ["btx-seed", market.eventId, userId, "portfolio"],
    });
  }, [confirmed, order, queryClient, market.eventId, userId]);

  const orderNotFound =
    status.error && "status" in status.error && status.error.status === 404;
  const retryingOrder =
    !!order &&
    orderNotFound &&
    order.projectId === selected &&
    order.shares === shares &&
    (order.side ?? "BUY") === side;

  const canConfirm =
    quoteIsCurrent &&
    !busy &&
    !quote.isFetching &&
    !quote.isError &&
    (!order ||
      (retryingOrder && order.limitPriceCents === preview?.priceCents));

  async function confirmPurchase() {
    if (!preview || !canConfirm || lock.current) return;
    const next = order ?? {
      projectId: selected,
      shares,
      tradeId: api.tradeId(),
      side,
      limitPriceCents: preview.priceCents,
    };

    lock.current = true;
    setBusy(true);
    setOrder(next);
    setNotice(null);

    try {
      await api.placeOrder(next);
    } catch (error) {
      const reason = error as api.TradeRequestError | undefined;
      const status = reason?.status ?? 0;
      const code = reason?.data?.code;
      const declined =
        status >= 400 &&
        status < 500 &&
        status !== 408 &&
        reason?.message !== "tradeId already used";

      if (declined) setOrder(null);
      if (code) setNotice(stockError(code));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  return {
    company,
    side,
    changeSide(value: api.Trade["side"]) {
      setNotice(null);
      setSide(value);
    },
    busy,
    fetchingQuote: quote.isFetching,
    quoteError: quote.error?.data?.code,
    ownCompany,
    quantity,
    changeQuantity(value: string) {
      setNotice(null);
      setQuantity(value);
    },
    preview:
      preview?.projectId === selected && preview.side === side
        ? preview
        : undefined,
    notice,
    order,
    orderNotFound,
    seedOpen,
    quantityLocked: busy || !!order,
    canQuote: canRequestQuote && !busy && (!order || retryingOrder),
    canConfirm,
    requestQuote: () => quote.refetch(),
    confirmPurchase,
  };
}
