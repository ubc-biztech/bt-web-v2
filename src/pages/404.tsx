import { IconButton } from "@/components/Common/IconButton";
import { Undo2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-[80vh] text-center">
      <Image
        alt="404 Image"
        src={"/assets/images/404-not-found.png"}
        width={324}
        height={324}
      />
      <h2 className="text-bt-blue-0 mb-1">404 - Page Not Found </h2>
      <p> Sorry, the page you're looking for does not exist. </p>
      <Link href="/">
        <IconButton
          variant="outline"
          icon={Undo2}
          label={"Return to Home"}
          className="mt-8"
        />
      </Link>
    </div>
  );
}
