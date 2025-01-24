import type React from "react";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import NavBarContainer from "@/components/companion/navigation/NavBarContainer";

interface FAQItem {
    question: string;
    answer: string;
}

const faqData: FAQItem[] = [
    {
        question: "My NFC card isn't working, what should I do?",
        answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
    },
    {
        question: "Sample Question",
        answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
    },
    {
        question: "Sample Question",
        answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
    },
];

const FAQItem: React.FC<{
    item: FAQItem;
    isOpen: boolean;
    toggleOpen: () => void;
}> = ({ item, isOpen, toggleOpen }) => {
    return (
        <div className="">
            <button
                className="flex justify-start items-center w-full text-white text-[12px] font-medium"
                onClick={toggleOpen}
            >
                <ChevronUp
                    className={`h-5 w-5 transition-transform duration-300 ${
                        isOpen ? "rotate-180" : "rotate-90"
                    }`}
                />
                <span className="ml-1">{item.question}</span>
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
            >
                <div className="pb-4 text-gray-300 ml-6 text-[12px]">
                    {item.answer}
                </div>
            </div>
        </div>
    );
};

const Index: React.FC = () => {
    const [openIndices, setOpenIndices] = useState<number[]>(
        faqData.map((_, index) => index)
    );

    const toggleOpen = (index: number) => {
        setOpenIndices((prevIndices) =>
            prevIndices.includes(index)
                ? prevIndices.filter((i) => i !== index)
                : [...prevIndices, index]
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#040C12] to-[#030608] font-satoshi">
            <NavBarContainer>
                <div className="container mx-auto px-4">
                    <span className="text-lg font-bold text-white">FAQ</span>

                    <div className="mt-2 border-t-[1px] pt-2 border-[#1D262F]">
                        {faqData.map((item, index) => (
                            <FAQItem
                                key={index}
                                item={item}
                                isOpen={openIndices.includes(index)}
                                toggleOpen={() => toggleOpen(index)}
                            />
                        ))}
                    </div>
                </div>
            </NavBarContainer>
        </div>
    );
};

export default Index;
