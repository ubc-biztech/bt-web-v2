import BiztechLogo from "../../../public/assets/biztech_logo.svg";
import Image from "next/image";
import NavbarTab from "./NavbarTab";

export default function Navbar() {
  return (
    <div
      style={{
        paddingTop: "36px",
        height: "100%",
        width: "250px",
        backgroundColor: "#11192E",
        position: "fixed",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Image src={BiztechLogo} alt="BizTech Logo" width={40} height={40} />
          <h5 style={{ color: "white", fontWeight: "600" }}>UBC BizTech</h5>
        </div>
        <div
          style={{
            width: "100%",
            height: "1px",
            backgroundColor: "#324269",
            marginBottom: "18px",
            marginTop: "18px",
          }}
        ></div>
        <NavbarTab />
        <NavbarTab />
        <NavbarTab />
        <div
          style={{
            width: "100%",
            height: "1px",
            backgroundColor: "#324269",
            marginBottom: "18px",
            marginTop: "18px",
          }}
        ></div>
        <NavbarTab />
        <NavbarTab />
        <NavbarTab />
      </div>
      <NavbarTab />
    </div>
  );
}
