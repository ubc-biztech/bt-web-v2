import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchUserAttributes } from "@aws-amplify/auth";
import { Bell } from "lucide-react";
import { checkMembership } from "@/lib/membership";

export default function MembershipPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadMembership() {
      try {
        const attributes = await fetchUserAttributes();
        const email = attributes.email;
        if (!email) return;
        const hasMembership = await checkMembership(email);
        if (active) setShow(!hasMembership);
      } catch {
        if (active) setShow(false);
      }
    }

    loadMembership();
    return () => {
      active = false;
    };
  }, []);

  if (!show) return null;

  return (
    <div className="fixed left-1/2 top-4 z-[100] w-fit max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-lg border border-bt-green-300/40 bg-bt-blue-500 px-4 py-3 text-white shadow-xl">
      <div className="flex items-center gap-2">
        <Bell
          aria-hidden="true"
          className="h-4 w-4 shrink-0 text-bt-green-300"
        />
        <p className="text-xs text-bt-blue-0">
          Looks like you aren&apos;t a member yet!{" "}
          <Link
            href="/membership"
            className="font-semibold text-bt-green-300 underline underline-offset-2 hover:text-bt-green-500"
          >
            Buy a membership
          </Link>{" "}
          now to gain access to exclusive features.
        </p>
      </div>
    </div>
  );
}
