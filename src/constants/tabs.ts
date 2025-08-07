import {
  CalendarCog,
  CalendarFoldIcon,
  HomeIcon,
  LineChartIcon,
  LogIn,
  LogOut,
  PlusSquareIcon,
  ScanBarcode,
  UserCircle2,
} from "lucide-react";

export const admin = [
  {
    title: "Manage Events",
    link: "/admin/home",
    icon: CalendarCog,
  },
  {
    title: "New Event",
    link: "/admin/event/new",
    icon: PlusSquareIcon,
  },
  {
    title: "Statistics",
    link: "",
    icon: LineChartIcon,
  },
  {
    title: "Edit Companion",
    link: "/admin/edit-companion",
    icon: ScanBarcode,
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
      icon: CalendarFoldIcon,
    },
  ];

  if (isSignedIn) {
    links.push({
      title: `${isAdmin ? "Admin" : "User"} Profile`,
      link: "/profile",
      icon: UserCircle2,
    });
  }

  return links;
};

export const logout = {
  title: "Logout",
  link: "",
  icon: LogOut,
};

export const signin = {
  title: "Login",
  link: "/login",
  icon: LogIn,
};
