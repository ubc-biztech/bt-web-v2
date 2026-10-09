import Link from "next/link";
import { useRouter } from "next/router";
import {
  useEffect,
  type ComponentType,
  type ReactNode,
  type SVGProps,
} from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUserAttributes } from "@/queries/user";
import { useUserRegistrations } from "@/queries/registrations";
import RegistrationLockAsset from "@/assets/2026/product+/registration-lock.svg";
import {
  hasProductPlusRegistration,
  isProductPlusAdmin,
  PRODUCT_PLUS_COMPANION_PATH,
  PRODUCT_PLUS_EVENT_PATH,
  productPlusLoginPath,
  requiresProductPlusRegistration,
  type ProductPlusPage,
} from "./access";
import { ProductButton } from "./components/ProductPlusUI";
import { productHeadingFont } from "./font";
import { cn } from "@/lib/utils";

const RegistrationLock = RegistrationLockAsset as unknown as ComponentType<
  SVGProps<SVGSVGElement>
>;

interface ProductPlusAccessProps {
  page: ProductPlusPage;
  children: ReactNode;
}

function AccessState({
  title,
  message,
  retry,
}: {
  title: string;
  message?: string;
  retry?: () => void;
}) {
  return (
    <section
      className="flex min-h-[360px] flex-col items-center justify-center gap-5 text-center"
      aria-live="polite"
    >
      <h1>{title}</h1>
      {message ? (
        <p className="max-w-[460px] text-[14px] leading-5 text-product-muted">
          {message}
        </p>
      ) : null}
      {retry ? (
        <ProductButton onClick={retry} type="button">
          Try again
        </ProductButton>
      ) : null}
    </section>
  );
}

function RegistrationRequired() {
  const router = useRouter();

  return (
    <>
      <AccessState title="Registration required" />
      <Dialog
        open
        onOpenChange={(open) => {
          if (!open) void router.replace(PRODUCT_PLUS_COMPANION_PATH);
        }}
      >
        <DialogContent
          className={cn(
            productHeadingFont.variable,
            "flex w-[calc(100vw-32px)] max-w-[640px] flex-col items-center gap-5 rounded-[32px] border-white/70 bg-white/[0.92] px-6 py-10 text-center font-product-body text-[14px] leading-5 text-product-ink shadow-[0_4px_20px_rgba(97,80,184,0.08)] backdrop-blur-[14.5px] [color-scheme:light] sm:rounded-[32px] min-[641px]:rounded-[40px] min-[641px]:px-14 min-[641px]:py-12 [&>button_svg]:text-product-ink motion-reduce:animate-none motion-reduce:[&_*]:transition-none",
          )}
        >
          <RegistrationLock aria-hidden="true" />
          <p className="text-[14px] leading-5 text-product-primary">
            PRODUCT+ 2026
          </p>
          <DialogTitle className="font-product-heading text-[28px] font-normal leading-9 tracking-[-0.5px] text-product-ink min-[641px]:text-[36px] min-[641px]:leading-[44px]">
            Please register for Product+
          </DialogTitle>
          <DialogDescription className="max-w-[460px] text-[14px] leading-5 text-product-muted">
            You need a confirmed Product+ 2026 registration to access My Team
            and Submission. Please register for Product+ and complete your
            registration to continue.
          </DialogDescription>
          <div className="flex flex-col items-center gap-3">
            <ProductButton asChild>
              <Link href={PRODUCT_PLUS_EVENT_PATH}>Register for Product+</Link>
            </ProductButton>
            <ProductButton asChild variant="secondary">
              <Link href={PRODUCT_PLUS_COMPANION_PATH}>Back to Portal</Link>
            </ProductButton>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function AuthenticatedAccess({ page, children }: ProductPlusAccessProps) {
  const router = useRouter();
  const user = useUserAttributes();
  const needsRegistration = requiresProductPlusRegistration(page);
  const registrations = useUserRegistrations(
    needsRegistration && user.isSuccess ? user.data?.email : undefined,
  );
  const unauthenticated = user.isSuccess && user.data === null;

  useEffect(() => {
    if (router.isReady && unauthenticated) {
      void router.replace(productPlusLoginPath(router.asPath));
    }
  }, [router, unauthenticated]);

  if (user.isPending) return <AccessState title="Checking your account…" />;

  if (user.isError) {
    return (
      <AccessState
        title="We couldn’t check your account"
        message="Please try again to continue."
        retry={() => void user.refetch()}
      />
    );
  }

  if (unauthenticated) return <AccessState title="Redirecting to login…" />;

  if (page === "admin" && !isProductPlusAdmin(user.data)) {
    return (
      <section className="flex min-h-[360px] flex-col items-center justify-center gap-5 text-center">
        <h1>Admin access required</h1>
        <p className="max-w-[460px] text-[14px] leading-5 text-product-muted">
          Sign in with a verified @ubcbiztech.com email to access this page.
        </p>
        <ProductButton asChild variant="secondary">
          <Link href={PRODUCT_PLUS_COMPANION_PATH}>Back to Portal</Link>
        </ProductButton>
      </section>
    );
  }

  if (needsRegistration) {
    if (!user.data?.email) {
      return (
        <AccessState
          title="Verify your email"
          message="A verified email is required to check your Product+ registration."
          retry={() => void user.refetch()}
        />
      );
    }

    if (registrations.isPending) {
      return <AccessState title="Checking your Product+ registration…" />;
    }

    if (registrations.isError) {
      return (
        <AccessState
          title="We couldn’t check your registration"
          message="Please try again to continue."
          retry={() => void registrations.refetch()}
        />
      );
    }

    if (!hasProductPlusRegistration(registrations.data)) {
      return <RegistrationRequired />;
    }
  }

  return <>{children}</>;
}

export default function ProductPlusAccess(props: ProductPlusAccessProps) {
  if (props.page === "portal") return <>{props.children}</>;

  return <AuthenticatedAccess {...props} />;
}
