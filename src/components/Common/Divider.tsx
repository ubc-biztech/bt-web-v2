import { cn } from "@/lib/utils"


export default function Divider({className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('bg-dark-slate h-[1px] my-4 w-full', className)}/>
  )
}