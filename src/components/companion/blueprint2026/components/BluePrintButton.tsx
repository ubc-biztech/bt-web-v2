import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BluePrintButtonProps =
  React.ComponentPropsWithoutRef<typeof Button>;

const BluePrintButton = React.forwardRef<
  React.ElementRef<typeof Button>,
  BluePrintButtonProps
>(({ className, children, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      className={cn(
        "font-mono inline-flex items-center gap-2 bg-white/10 border-[0.5px] border-white text-white rounded-full font-light shadow-[inset_-2px_0_16px_rgba(255,255,255,0.25)]",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
});

BluePrintButton.displayName = "BluePrintButton";

export default BluePrintButton;