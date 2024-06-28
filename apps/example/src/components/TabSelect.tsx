import { Button } from "@chakra-ui/react";
import { useCallback, useState } from "react";

export const SliderToggleButton = () => {
  const [activeTab, setActiveTab] = useState("Trade");

  const handleTabClick = useCallback((tab: "Trade" | "History") => {
    setActiveTab(tab);
  }, []);

  return (
    <div className="mb-4 flex w-full justify-between rounded-md border border-gray-300">
      {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
      <button
        className={`h-12 w-1/2 rounded-md  text-center ${activeTab === "Trade" ? "bg-indigo-600 text-white" : "bg-gray-200"}`}
        onClick={() => handleTabClick("Trade")}
      >
        {"Trade"}
      </button>
      {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
      <button
        className={`h-12 w-1/2 rounded-md  text-center ${activeTab === "History" ? "bg-indigo-600 text-white" : "bg-gray-200"}`}
        onClick={() => handleTabClick("History")}
      >
        {"History"}
      </button>
    </div>
  );
};
