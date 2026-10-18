import type { ComponentType, SVGProps } from "react";
import IridescentBlobAsset from "@/assets/2026/product+/arena-iridescent-render.svg";
import PastelRightAsset from "@/assets/2026/product+/arena-pastel-blob-right.svg";
import PastelTopAsset from "@/assets/2026/product+/arena-pastel-blob-top.svg";
import PastelLeftAsset from "@/assets/2026/product+/arena-pastel-blob-left.svg";
import RingLeftAsset from "@/assets/2026/product+/arena-ring-left-render.svg";
import RingRightAsset from "@/assets/2026/product+/arena-ring-right-render.svg";
import DiamondAsset from "@/assets/2026/product+/arena-diamond.svg";

type Svg = ComponentType<SVGProps<SVGSVGElement>>;
const IridescentBlob = IridescentBlobAsset as unknown as Svg;
const PastelRight = PastelRightAsset as unknown as Svg;
const PastelTop = PastelTopAsset as unknown as Svg;
const PastelLeft = PastelLeftAsset as unknown as Svg;
const RingLeft = RingLeftAsset as unknown as Svg;
const RingRight = RingRightAsset as unknown as Svg;
const Diamond = DiamondAsset as unknown as Svg;

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

export default function ArenaBackdrop() {
  return (
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
  );
}
