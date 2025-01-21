import { StaticImageData } from "next/image";
import BigLeagueScoutIcon from "@/assets/2025/blueprint/badgeIcons/big-league-scout.svg";
import DirectorsCircleIcon from "@/assets/2025/blueprint/badgeIcons/directors-circle.svg";
import FirstImpressionistIcon from "@/assets/2025/blueprint/badgeIcons/first-impressionist.svg";
import LoyalistLegacyIcon from "@/assets/2025/blueprint/badgeIcons/loyalist-legacy.svg";
import MemoryMakerIcon from "@/assets/2025/blueprint/badgeIcons/memory-maker.svg";
import NetworkingGuruIcon from "@/assets/2025/blueprint/badgeIcons/networking-guru.svg";
import NetworkingProIcon from "@/assets/2025/blueprint/badgeIcons/networking-pro.svg";
import SnackSeekerIcon from "@/assets/2025/blueprint/badgeIcons/snack-seeker.svg";
import StartupExplorerIcon from "@/assets/2025/blueprint/badgeIcons/startup-explorer.svg";
import WorkshopIcon from "@/assets/2025/blueprint/badgeIcons/workshop-wonder-1.svg";

export const badgeIcons: { [key: string]: StaticImageData } = {
    QUEST_BIGTECH: BigLeagueScoutIcon,
    QUEST_BT_BOOTH_H: LoyalistLegacyIcon,
    QUEST_CONNECT_EXEC_H: DirectorsCircleIcon,
    QUEST_CONNECT_FOUR: NetworkingProIcon,
    QUEST_CONNECT_ONE: FirstImpressionistIcon,
    QUEST_CONNECT_TEN_H: NetworkingGuruIcon,
    QUEST_PHOTOBOOTH: MemoryMakerIcon,
    QUEST_SNACK: SnackSeekerIcon,
    QUEST_STARTUP: StartupExplorerIcon,
    QUEST_WORKSHOP: WorkshopIcon,
  };
  