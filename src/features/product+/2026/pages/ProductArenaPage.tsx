import type { ComponentType, SVGProps } from "react";
import Link from "next/link";
import IridescentBlobAsset from "@/assets/2026/product+/arena-iridescent-render.svg";
import PastelRightAsset from "@/assets/2026/product+/arena-pastel-blob-right.svg";
import PastelTopAsset from "@/assets/2026/product+/arena-pastel-blob-top.svg";
import PastelLeftAsset from "@/assets/2026/product+/arena-pastel-blob-left.svg";
import RingLeftAsset from "@/assets/2026/product+/arena-ring-left-render.svg";
import RingRightAsset from "@/assets/2026/product+/arena-ring-right-render.svg";
import DiamondAsset from "@/assets/2026/product+/arena-diamond.svg";
import ArenaLogoAsset from "@/assets/2026/product+/product-arena-logo.svg";
import CalendarAsset from "@/assets/2026/product+/arena-calendar.svg";
import LockAsset from "@/assets/2026/product+/registration-lock.svg";
import { GlassCard, ProductButton } from "../components/ProductPlusUI";

type Svg = ComponentType<SVGProps<SVGSVGElement>>;
const IridescentBlob = IridescentBlobAsset as unknown as Svg;
const PastelRight = PastelRightAsset as unknown as Svg;
const PastelTop = PastelTopAsset as unknown as Svg;
const PastelLeft = PastelLeftAsset as unknown as Svg;
const RingLeft = RingLeftAsset as unknown as Svg;
const RingRight = RingRightAsset as unknown as Svg;
const Diamond = DiamondAsset as unknown as Svg;
const ArenaLogo = ArenaLogoAsset as unknown as Svg;
const Calendar = CalendarAsset as unknown as Svg;
const Lock = LockAsset as unknown as Svg;

function DiamondDecoration({ className }: { className: string }) {
  return (
    <div className={className}>
      <div className="absolute left-[13px] top-[14px] h-[22.795px] w-[22.795px] -rotate-45">
        <div className="h-[1254px] w-[1254px] origin-top-left scale-[0.01817783]">
          <Diamond />
        </div>
      </div>
      <div className="absolute left-[16px] top-[8px] h-[19.946px] w-[19.946px] -rotate-45">
        <div className="h-[1254px] w-[1254px] origin-top-left scale-[0.015905901]">
          <Diamond />
        </div>
      </div>
      <div className="absolute left-[7px] top-[23px] h-[19.946px] w-[19.946px] -rotate-45">
        <div className="h-[1254px] w-[1254px] origin-top-left scale-[0.015905901]">
          <Diamond />
        </div>
      </div>
      <span className="absolute inset-[8px] -rotate-45 rounded-[3.56px] border-[0.285px] border-white shadow-[1.425px_1.425px_3.562px_rgb(0_0_0_/_10%)]" />
    </div>
  );
}

export default function ProductArenaPage() {
  return (
    <section
      className="relative isolate min-h-[1008px] overflow-hidden rounded-[32px] bg-product-lavender text-product-ink max-[850px]:min-h-[850px] max-[640px]:min-h-[max(720px,100dvh)] max-[640px]:rounded-none max-[640px]:pb-[calc(108px+env(safe-area-inset-bottom))]"
      aria-labelledby="arena-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 [&_svg]:block"
        aria-hidden="true"
      >
        <div className="absolute left-[calc(50%-720px)] top-0 h-[1024px] w-[1440px] max-[640px]:inset-0 max-[640px]:h-full max-[640px]:min-h-[1024px] max-[640px]:w-full">
          {/* Scale the canvas to cover tall screens while retaining the asset's intrinsic dimensions. */}
          <svg
            className="h-full w-full"
            viewBox="0 0 1440 1024"
            preserveAspectRatio="xMidYMin slice"
          >
            <IridescentBlob />
          </svg>
        </div>
        <div className="absolute left-[62.5%] top-[-121.71px] flex h-[747.074px] w-[999.049px] items-center justify-center">
          <div className="relative h-[588.186px] w-[734.259px] [transform:rotate(19.52deg)_skewX(-11.94deg)_scaleY(-0.98)] [&>svg]:absolute [&>svg]:left-[-36.69%] [&>svg]:top-[-45.8%]">
            <PastelRight />
          </div>
        </div>
        <div className="absolute left-[-4.17%] top-[-729.22px] flex h-[907.161px] w-[1213.131px] items-center justify-center">
          <div className="relative h-[714.226px] w-[891.6px] [transform:rotate(19.52deg)_skewX(-11.94deg)_scaleY(-0.98)] [&>svg]:absolute [&>svg]:left-[-36.69%] [&>svg]:top-[-45.8%]">
            <PastelTop />
          </div>
        </div>
        <div className="absolute left-[-40.87%] top-[-1099.26px] flex h-[1429.255px] w-[1650.754px] items-center justify-center">
          <div className="relative h-[1064.734px] w-[1199.835px] [transform:rotate(-55.35deg)_skewX(10.11deg)_scaleY(-0.98)] [&>svg]:absolute [&>svg]:left-[-38.74%] [&>svg]:top-[-43.65%]">
            <PastelLeft />
          </div>
        </div>
        {/* The annular masks remove the canvas backdrop from Figma's ring renders. */}
        <div className="absolute left-0 top-[630.73px] h-[394px] w-[271px] [mask-image:radial-gradient(circle_at_44.4px_223.65px,transparent_212px,#000_213px,#000_215px,transparent_216px)]">
          <RingLeft />
        </div>
        <div className="absolute right-0 top-[50.73px] h-[348px] w-[272px] [mask-image:radial-gradient(circle_at_173.9px_173.9px,transparent_160px,#000_161px,#000_163px,transparent_164px)]">
          <RingRight />
        </div>
        <DiamondDecoration className="absolute left-[7.6%] top-[633.81px] h-[50.12px] w-[50.12px]" />
        <DiamondDecoration className="absolute right-[16.68%] top-[185.74px] h-[50.12px] w-[50.12px] scale-[0.85]" />
        <div className="absolute left-[6.39%] top-[170px] [&>span]:absolute [&>span]:h-[34.352px] [&>span]:w-[34.352px] [&>span]:bg-white [&>span:nth-child(2)]:left-[34.352px] [&>span:nth-child(2)]:top-[34.352px]">
          <span />
          <span />
        </div>
        <div className="absolute right-[11.8%] top-[330px] [&>span]:absolute [&>span]:h-[40.078px] [&>span]:w-[40.078px] [&>span]:bg-white [&>span:nth-child(2)]:left-[102px] [&>span:nth-child(2)]:top-[60px]">
          <span />
          <span />
        </div>
        <div className="absolute left-[4.77%] top-[720px] [&>span]:absolute [&>span]:h-[28.627px] [&>span]:w-[28.627px] [&>span]:bg-white [&>span:nth-child(2)]:left-[28.627px] [&>span:nth-child(2)]:top-[28.627px] [&>span:nth-child(3)]:left-[-28.627px] [&>span:nth-child(3)]:top-[calc(28.627px*3.45)]">
          <span />
          <span />
          <span />
        </div>
        <div className="absolute right-[8.23%] top-[760px] [&>span]:absolute [&>span]:h-[31.49px] [&>span]:w-[31.49px] [&>span]:bg-white [&>span:nth-child(2)]:left-[31.49px] [&>span:nth-child(2)]:top-[31.49px] [&>span:nth-child(3)]:left-[-31.49px] [&>span:nth-child(3)]:top-[calc(31.49px*3.45)]">
          <span />
          <span />
          <span />
        </div>
      </div>
      <header className="relative z-[1] m-6 flex min-h-[64px] items-center justify-between gap-6 rounded-[32px] border border-white/70 bg-white/60 px-6 py-2 shadow-[0_4px_20px_rgb(97_80_184_/_8%),inset_0_1px_2px_rgb(255_255_255_/_65%)] backdrop-blur-[14.5px] max-[850px]:m-4 max-[850px]:gap-4 max-[850px]:px-5 max-[850px]:py-3 max-[480px]:flex-col max-[480px]:items-start max-[480px]:gap-3 max-[480px]:rounded-[24px]">
        <div className="h-[45.192px] w-[163.33px] shrink-0 [&>svg]:block">
          <ArenaLogo role="img" aria-label="Product+ Arena" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-[46.028px] w-[38.83px] shrink-0 max-[480px]:h-[33.192px] max-[480px]:w-[28px] [&_svg]:block">
            <div className="max-[480px]:origin-top-left max-[480px]:scale-[0.721096684]">
              <Calendar aria-hidden="true" />
            </div>
          </div>
          <div className="flex flex-col gap-[2px]">
            <span className="text-[13px] leading-[18px] text-product-muted">
              Voting closes
            </span>
            <time
              className="text-[14px] font-semibold leading-5 max-[850px]:max-w-[180px] max-[480px]:max-w-none"
              dateTime="2026-10-29T23:59:00-07:00"
            >
              October 29, 2026, 11:59 PM PT
            </time>
          </div>
        </div>
      </header>
      <div className="relative z-[1] grid min-h-[888px] place-items-center px-8 pb-[136px] pt-12 max-[850px]:min-h-[720px] max-[850px]:px-6 max-[850px]:pb-24 max-[480px]:min-h-[520px] max-[480px]:px-4 max-[480px]:pb-[72px] max-[480px]:pt-8">
        <GlassCard className="flex w-full max-w-[640px] flex-col items-center gap-5 rounded-[40px] px-[56px] py-12 text-center max-[850px]:px-8 max-[850px]:py-10 max-[480px]:gap-4 max-[480px]:rounded-[28px] max-[480px]:px-6 max-[480px]:py-8">
          <div className="h-10 w-10 shrink-0 [&>svg]:block">
            <Lock aria-hidden="true" />
          </div>
          <h1
            id="arena-heading"
            className="m-0 font-product-heading text-[40px] font-normal leading-[1.2] tracking-normal max-[850px]:text-[34px] max-[480px]:text-[30px]"
          >
            Voting opens soon
          </h1>
          <p className="m-0 text-[16px] leading-5 text-product-muted max-[480px]:text-[14px]">
            Voting opens when submissions close on October 22, 11:59 PM PT. Come
            back then to watch the pitches and cast your vote.
          </p>
          <div className="pt-2">
            <ProductButton
              variant="secondary"
              asChild
              className="min-w-[200px] max-[480px]:min-w-[180px]"
            >
              <Link href="/companion/product+/2026/portal">Back to portal</Link>
            </ProductButton>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
