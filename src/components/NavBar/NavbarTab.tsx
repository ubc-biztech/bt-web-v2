import Image from "next/image";
import EditIcon from "../../../public/assets/icons/settings_icon.svg";

const NavbarTab = () => {
  return (
    <div
      style={{
        height: "36px",
        display: "flex",
        width: "100%",
        marginTop: "18px",
        marginBottom: "18px",
      }}
    >
      <div style={{ width: "2px", backgroundColor: "#7AD040" }}></div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          backgroundColor: "#1C253D",
          padding: "8px",
          flexGrow: 1,
        }}
      >
          <Image src={EditIcon} alt="BizTech Logo" width={20} height={20} style={{marginLeft: "8px"}}/>
          <h6 style={{ color: "white" }}>Edit Events</h6>
      </div>
    </div>
  );
};

export default NavbarTab;
