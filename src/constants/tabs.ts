import {
  BadgeCheck,
  CalendarCog,
  CalendarFoldIcon,
  HomeIcon,
  LineChartIcon,
  LogIn,
  LogOut,
  PlusSquareIcon,
  ScanBarcode,
  UserCircle2,
  Users,
  ScanFace,
  BadgeCheckIcon,
  Sparkles,
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
    title: "Manage Members",
    link: "/admin/manage-members",
    icon: Users,
  },
  {
    title: "Statistics",
    link: "/admin/statistics",
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
    isSignedIn
      ? {
          title: "Home",
          link: "/",
          icon: HomeIcon,
        }
      : {
          title: "Membership",
          link: "/become-a-member",
          icon: BadgeCheck,
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

  if (isSignedIn) {
    links.push({
      title: "Connections",
      link: "/connections",
      icon: ScanFace,
    });
  }

  links.push({
    title: "Companion",
    link: "/companion",
    icon: Sparkles,
  });

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
