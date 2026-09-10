import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const ConfirmDetailsInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    {...props}
    ref={ref}
    className={cn(
      "min-h-[42px] w-full rounded-[12px] border-[1.5px] border-[#e1e0db] bg-[#f7f6f1] px-4 py-3 text-[15px] font-500 leading-none text-[#181818] outline-none transition focus:border-[#9dcdfd] focus:ring-2 focus:ring-[#1094f7]/20",
      className,
    )}
  />
));

ConfirmDetailsInput.displayName = "ConfirmDetailsInput";
