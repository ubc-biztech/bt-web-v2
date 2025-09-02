import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TabProps {
  tabs: { label: React.ReactNode; value: string }[];
  panels: { value: string; content: React.ReactNode }[];
}

const DynamicTabs: React.FC<TabProps> = ({ tabs, panels }) => {
  const [activeTab, setActiveTab] = useState(tabs[0]?.value || "");

  const handleTabClick = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="w-full">
      <div className="w-full flex flex-row items-end">
        <div className="relative flex border-b border-bt-blue-300 text-nowrap flex-wrap xxl:w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              className={`relative transition-colors duration-200 ease-in-out flex-1 p-3 text-center ${
                activeTab === tab.value
                  ? "text-bt-green-300"
                  : "text-bt-blue-300 hover:text-bt-blue-200"
              }`}
              onClick={() => handleTabClick(tab.value)}
            >
              {tab.label}

              {activeTab === tab.value && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-bt-green-300"
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              )}
            </button>
          ))}
        </div>
        <div className="w-full relative flex border-b border-bt-blue-300" />
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        <AnimatePresence mode="wait">
          {panels.map(
            (panel) =>
              panel.value === activeTab && (
                <motion.div
                  key={panel.value}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {panel.content}
                </motion.div>
              ),
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DynamicTabs;
