import Image from "next/image";
import EditIcon from "../../../public/assets/icons/settings_icon.svg";
import Link from "next/link";

const NavbarTab = () => {
  const isSelected = false;
  return (
    <Link
      href=""
      className="h-9 flex w-full mb-4 mt-4 hover:opacity-60 cursor-pointer"
    >
      <div className={`w-0.5 ${isSelected && "bg-biztech-green"}`} />
      <div
        className={`flex items-center p-2 gap-2 grow ${
          isSelected && "bg-events-active-tab-bg"
        }`}
      >
        <Image
          src={EditIcon}
          alt="BizTech Logo"
          width={20}
          height={20}
          className="m-2"
        />
        <h6 className="text-white">Edit Events</h6>
      </div>
    </Link>
  );
};

export default NavbarTab;
