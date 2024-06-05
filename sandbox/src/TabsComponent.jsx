import React, { useState } from "react";
import "./TabsComponent.css";

const TabsComponent = () => {
  const [activeTab, setActiveTab] = useState("tab1");

  const renderContent = () => {
    switch (activeTab) {
      case "tab1":
        return (
          <div className="content">
            Content for Tab 1: Some text and information.
          </div>
        );
      case "tab2":
        return (
          <div className="content">
            Content for Tab 2:
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
              <li>Item 3</li>
            </ul>
          </div>
        );
      case "tab3":
        return (
          <div className="content">
            Content for Tab 3:
            <img src="https://picsum.photos/200/300" alt="Example" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="tabs-component">
      <div className="tabs">
        <button
          className={`tab-button ${activeTab === "tab1" ? "active" : ""}`}
          onClick={() => setActiveTab("tab1")}
        >
          Tab 1
        </button>
        <button
          className={`tab-button ${activeTab === "tab2" ? "active" : ""}`}
          onClick={() => setActiveTab("tab2")}
        >
          Tab 2
        </button>
        <button
          className={`tab-button ${activeTab === "tab3" ? "active" : ""}`}
          onClick={() => setActiveTab("tab3")}
        >
          Tab 3
        </button>
      </div>
      <div className="tab-content">{renderContent()}</div>
    </div>
  );
};

export default TabsComponent;
