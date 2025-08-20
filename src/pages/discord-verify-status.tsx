import Link from "next/link";
import { CheckCircle, XCircle } from "lucide-react";

interface DiscordVerifyStatusProps {
  status: boolean;
}

const DiscordVerifyStatus: React.FC<DiscordVerifyStatusProps> = ({
  status,
}) => {
  return status ? (
    <div className="bg-dark-slate px-6 py-12 shadow sm:rounded-lg sm:px-12 text-white">
      <div className="px-6 py-12 rounded-2xl text-center max-w-md w-full">
        <div className="flex justify-center mb-8 text-green-600">
          <CheckCircle className="h-24 w-24 text-secondary-color" />
        </div>
        <h2 className="mt-6 text-center text-2xl font-[600] leading-9 tracking-tight text-white-blue mb-6">
          Successfully linked accounts
        </h2>
        <p className="mt-2 text-white">
          Your Discord account was successfully linked to your membership.
        </p>

        <div className="mt-6">
          <Link
            href="/"
            className="flex w-full justify-center rounded-md bg-biztech-green px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-dark-green focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  ) : (
    <div className="px-6 py-12 rounded-2xl text-center max-w-md w-full">
      <div className="flex justify-center mb-8 text-red-600">
        <XCircle className="h-24 w-24 text-[#FF4262]" />
      </div>
      <h2 className="mt-6 text-center text-2xl font-[600] leading-9 tracking-tight text-white-blue mb-6">
        Failed to link accounts
      </h2>
      <p className="mt-2 text-white">
        We couldn&apos;t link your Discord account to your membership. Please
        try again later or contact server admins.
      </p>

      <div className="mt-6">
        <Link
          href="/"
          className="flex w-full justify-center rounded-md bg-[#FF4262] px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-[#df3a55] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default DiscordVerifyStatus;
