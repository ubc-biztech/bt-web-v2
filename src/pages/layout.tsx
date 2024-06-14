import Navbar from "@/components/NavBar/Navbar";

export default function Layout({ children }: any) {
  return (
    <>
      <Navbar/>
      <main style={{marginLeft: "250px"}}>{children}</main>
    </>
  );
}
