import CompaniesList from "@/components/companion/CompaniesList";

interface Company {
    id: number;
    name: string;
    logo: string;
    description: string;
    tags: string[];
    profile_url: string;
}

const companiesExample: Company[] = [
    {
        id: 1,
        name: "Tesla Motors",
        logo: "https://upload.wikimedia.org/wikipedia/commons/e/e8/Tesla_logo.png",
        description: "3 delegates in attendance",
        tags: ["AUTOMOTIVE", "R&D", "MECH ENGINEERING"],
        profile_url: "/tesla"
    },
    {
        id: 2,
        name: "Electronic Arts",
        logo: "https://upload.wikimedia.org/wikipedia/commons/e/e5/Electronic_Arts_Logo_2020.png",
        description: "2 delegates in attendance",
        tags: ["SOFTWARE", "DEV", "TECH", "GAMING"],
        profile_url: "/ea"
    },
    {
        id: 3,
        name: "Kardium",
        logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBQoD0xmpn1yjSxTiafwVL1wwP1uJn7a3rQg&s",
        description: "5 delegates in attendance",
        tags: ["HEALTH TECH", "SOFTWARE", "R&D"],
        profile_url: "/kardium"
    },
    {
        id: 4,
        name: "Company Name",
        logo: "https://upload.wikimedia.org/wikipedia/en/c/ce/User-info.svg",
        description: "X delegates in attendance",
        tags: ["TAG", "TAG", "TAG"],
        profile_url: "/company1"
    },
    {
        id: 5,
        name: "Company Name",
        logo: "https://upload.wikimedia.org/wikipedia/en/c/ce/User-info.svg",
        description: "X delegates in attendance",
        tags: ["TAG", "TAG", "TAG"],
        profile_url: "/company"
    },
];

export default function index() {
    return <CompaniesList companies={companiesExample} />;
}
