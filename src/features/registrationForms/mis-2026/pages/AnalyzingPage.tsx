import AnalyzeLoading from "@/assets/2026/mis-night/analyze_loading.png";
import Image from "next/image";

export function AnalyzingPage() {
  return (
    <section
      data-step="analyzing"
      aria-live="polite"
      aria-busy="true"
      className="flex min-h-[100dvh] w-full items-center justify-center px-6 pt-[92px] md:pt-0"
    >
      <div role="status" className="flex flex-col items-center text-center">
        <div className="animate-[spin_4.0s_linear_infinite] motion-reduce:animate-none">
          <Image
            src={AnalyzeLoading}
            alt=""
            priority
            aria-hidden="true"
            className="h-auto w-[168px] select-none md:w-[184px]"
          />
        </div>

        <h1 className="mt-12 text-[21px] font-bold leading-tight text-[#A7F2FC] md:mt-14 md:text-[25px]">
          Assembling your block...
        </h1>
      </div>
    </section>
  );
}
