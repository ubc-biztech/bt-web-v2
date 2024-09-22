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
      className={`flex items-center gap-3 ${className}`}
      style={{
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
