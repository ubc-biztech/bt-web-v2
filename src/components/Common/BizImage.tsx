"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";

export default function BizImage(props: ImageProps) {
  const [hasError, setHasError] = useState(false);

  const fallbackSrc = "/assets/images/not-found.png";
  const isFallback = hasError || !props.src;

  return (
    <Image
      {...props}
      alt={props.alt}
      src={isFallback ? fallbackSrc : props.src}
      onError={() => setHasError(true)}
    />
  );
}
