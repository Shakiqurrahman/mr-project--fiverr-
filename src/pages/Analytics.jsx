import { useState } from "react";
import AffiliateData from "../components/analytics/AffiliateData";
import CategoriesData from "../components/analytics/CategoriesData";
import ProjectDetailsData from "../components/analytics/ProjectDetailsData";
import TopKeywords from "../components/analytics/TopKeywords";
import VisitorsData from "../components/analytics/VisitorsData";
import WorldDomination from "../components/analytics/WorldDomination";

const Analytics = () => {
  const btns = [
    "Project Details",
    "World Domination",
    "Top Keywords",
    "Categories",
    "Affiliate",
    "Visitors",
  ];
  const [selectedBtn, setSelectedBtn] = useState("Project Details");
  const RenderComponent = () => {
    switch (selectedBtn) {
      case "Project Details":
        return <ProjectDetailsData />;
      case "World Domination":
        return <WorldDomination />;
      case "Top Keywords":
        return <TopKeywords />;
      case "Categories":
        return <CategoriesData />;
      case "Affiliate":
        return <AffiliateData />;
      case "Visitors":
        return <VisitorsData />;
      default:
        return null;
    }
  };
  return (
    <div className="max-width mt-10">
      <div className="mb-10 flex justify-between gap-3">
        {btns.map((btn, i) => (
          <button
            key={i}
            className={`shrink-0 border-b text-lg font-semibold duration-300 hover:border-primary hover:text-primary ${btn === selectedBtn ? "border-primary text-primary" : "border-transparent"}`}
            onClick={() => setSelectedBtn(btn)}
          >
            {btn}
          </button>
        ))}
      </div>
      <RenderComponent />
    </div>
  );
};

export default Analytics;
