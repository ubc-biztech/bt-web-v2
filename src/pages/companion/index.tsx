import type { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: "/companion/product+/2026",
    permanent: false,
  },
});

export default function Companion() {
  return null;
}
