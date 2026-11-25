import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/router";
import { companyName } from "./market";
import type { Company } from "./seedApi";
import styles from "./btx.module.css";

export function MobileTradeSheet({
  children,
  company,
  live,
  action,
  disabled,
}: {
  children: (close?: () => void) => ReactNode;
  company: Company;
  live: boolean;
  action: string;
  disabled: boolean;
}) {
  const router = useRouter();
  const openedFromPreview = useRef(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)");
    const update = () => {
      if (desktop.matches) dialog.current?.close();
      setMobile(!desktop.matches);
    };
    update();
    desktop.addEventListener("change", update);
    return () => desktop.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (
      mobile &&
      router.query.trade === "1" &&
      !openedFromPreview.current &&
      !disabled
    ) {
      openedFromPreview.current = true;
      dialog.current?.showModal();
    }
  }, [mobile, router.query.trade, disabled]);

  if (!mobile) return <div className="hidden md:block">{children()}</div>;
  return (
    <>
      <div className="fixed inset-x-0 bottom-[calc(57px+env(safe-area-inset-bottom))] z-20 border-t border-[#324a68] bg-[#0a1429] px-6 py-3">
        <button
          type="button"
          aria-haspopup="dialog"
          disabled={disabled}
          onClick={() => dialog.current?.showModal()}
          className="h-[52px] w-full rounded-full bg-[#1fbef9] text-[15px] font-medium text-[#0b1120] disabled:bg-[#1e2a40] disabled:text-[#a8b5d6]"
        >
          {action}
        </button>
      </div>
      <dialog
        ref={dialog}
        aria-labelledby="btx-sheet-title"
        onClick={(event) => {
          if (event.target === dialog.current) dialog.current.close();
        }}
        className="fixed inset-x-0 bottom-0 top-auto m-0 max-h-[90dvh] w-full max-w-none overscroll-contain rounded-t-[26px] border border-[#324a68] bg-[#101a30] p-0 text-[#e6ebf6] backdrop:bg-[#050b18]/75"
      >
        <div className="space-y-4 px-6 pb-[max(24px,env(safe-area-inset-bottom))] pt-3">
          <div
            aria-hidden="true"
            className="mx-auto h-1 w-10 rounded-full bg-[#52617d]"
          />
          <header className="flex items-center justify-between">
            <div>
              <h2
                id="btx-sheet-title"
                className={`${styles.display} text-[22px] font-medium`}
              >
                {live ? "Trade" : "Invest"}
              </h2>
              <p className="text-[13px] text-[#9eabcb]">
                {companyName(company)}
                {company.ticker && " · $" + company.ticker}
              </p>
            </div>
            <button
              type="button"
              aria-label="Close trade ticket"
              onClick={() => dialog.current?.close()}
              className="size-11 rounded-full bg-[#192840]"
            >
              ×
            </button>
          </header>
          {children(() => dialog.current?.close())}
        </div>
      </dialog>
    </>
  );
}
