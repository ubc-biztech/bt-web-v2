import EditIcon from "../../public/assets/icons/settings_icon.svg";
import NewIcon from "../../public/assets/icons/folder_icon.svg";
import StatsIcon from "../../public/assets/icons/chart_icon.svg";
import HomeIcon from "../../public/assets/icons/home_icon.svg";
import DashboardIcon from "../../public/assets/icons/event_icon.svg";
import ProfileIcon from "../../public/assets/icons/profile_icon.svg";
import ExitIcon from "../../public/assets/icons/exit_icon.svg";
import QrCodeIcon from "../../public/assets/icons/qr_icon.svg";
import LoginIcon from "../../public/assets/icons/login_icon.svg"

export const admin = [
  {
    title: "Manage Events",
    link: "/admin/home",
    icon: EditIcon,
  },
  {
    title: "New Event",
    link: "/admin/event/new",
    icon: NewIcon,
  },
  {
    title: "Statistics",
    link: "",
    icon: StatsIcon,
  },
  {
    title: "Edit Companion",
    link: "/admin/edit-companion",
    icon: QrCodeIcon,
  },
];

export const defaultUser = (isAdmin: boolean, isSignedIn: boolean) => {
  const links = [
    {
      title: "Home",
      link: "/",
      icon: HomeIcon,
    },
    {
      title: "Event Dashboard",
      link: "/events",
      icon: DashboardIcon,
    },
  ];

  if (isSignedIn) {
    links.push({
      title: `${isAdmin ? "Admin" : "User"} Profile`,
      link: "/profile",
      icon: ProfileIcon,
    });
  }

  return links;
};

export const logout = {
  title: "Logout",
  link: "",
  icon: ExitIcon,
};

export const signin = {
  title: "Login",
  link: "/login",
  icon: LoginIcon
}