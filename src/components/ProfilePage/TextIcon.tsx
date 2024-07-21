import Image, { StaticImageData } from "next/image";

interface TextIconProps {
  text: any;
  icon: string;
  iconSize: number;
  iconAtEnd?: boolean;
  className?: string;
}

const TextIcon: React.FC<TextIconProps> = ({
  text,
  icon,
  iconSize,
  iconAtEnd = false,
  className,
}) => {
  return (
    <div
      className={`${className}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        flexDirection: iconAtEnd ? "row" : "row-reverse",
        justifyContent: "start",
      }}
    >
      {text}
      <Image src={icon} alt="Icon" width={iconSize} height={iconSize} />
    </div>
  );
};

export default TextIcon;
