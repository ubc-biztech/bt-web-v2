import { IconButton } from "@/components/Common/IconButton";
import { ArrowUpRight } from "lucide-react";
import { redirect, useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  return (
    <div className="w-full h-screen flex flex-col text-center items-center justify-center text-white">
      <h2>Join the BizTech community</h2>
      <p className="mb-4">
        {" "}
        {
          "Membership gives you access to UBC's best tech events and our exclusive partnership network"
        }
      </p>
      <IconButton
        icon={ArrowUpRight}
        iconDirection="right"
        label="Become a member"
        variant="green"
        onClick={() => router.push("/login")}
      />
    </div>
  );
}
