import EditIcon from "../../public/assets/icons/settings_icon.svg"
import NewIcon from "../../public/assets/icons/folder_icon.svg"
import StatsIcon from "../../public/assets/icons/chart_icon.svg"
import HomeIcon from "../../public/assets/icons/home_icon.svg"
import DashboardIcon from "../../public/assets/icons/event_icon.svg"
import ProfileIcon from "../../public/assets/icons/profile_icon.svg"
import ExitIcon from "../../public/assets/icons/exit_icon.svg"

export const admin = [
    {
        title: "Edit Events",
        link: "",
        icon: EditIcon
    },
    {
        title: "New Event",
        link: "",
        icon: NewIcon
    },
    {
        title: "Statistics",
        link: "",
        icon: StatsIcon
    },
]

export const defaultUser = (isAdmin: boolean) => {
    return [
      {
        title: "Home",
        link: "/",
        icon: HomeIcon
      },
      {
        title: "Event Dashboard",
        link: "",
        icon: DashboardIcon
      },
      {
        title: `${isAdmin ? "Admin" : "User"} Profile`,
        link: "",
        icon: ProfileIcon
      },
    ];
  };

export const logout = {
    title: "Logout",
    link: "",
    icon: ExitIcon
}

