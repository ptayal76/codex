import React, { useState,useEffect } from "react";
import TabsComponent from "./TabsComponent.jsx";
import ScrollableComponent from "./ScrollableComponent";
import StyledComponent from "./StyledComponent";
import ResponsiveComponent from "./ResponsiveComponent";
import SearchBar from "./SearchBar";
import SearchResults from "./SearchResults";
import "./styles.css";

export default function App() {
  const [results, setResults] = useState([]);
  const [scrollableData, setScrollableData] = useState([]);

  useEffect(() => {
    const callApi = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/scrollable");
        const data = await response.json();
        setScrollableData(data);
        console.log(data);
      } catch (error) {
        console.error(error);
      }
    };
    callApi();
  }, []);
  const handleSearch = (query) => {
    // Simulate a search operation (replace with real search logic)
    const dummyResults = [
      {
        title: `Result for ${query} 1`,
        link: "#",
        description: "This is a description for result 1.",
      },
      {
        title: `Result for ${query} 2`,
        link: "#",
        description: "This is a description for result 2.",
      },
      {
        title: `Result for ${query} 3`,
        link: "#",
        description: "This is a description for result 3.",
      },
    ];
    setResults(dummyResults);
  };

  return (
    <div className="App">
      <h1>React Search and Tabs Component</h1>
      <SearchBar onSearch={handleSearch} />
      <SearchResults results={results} />
      <div className="grid-container">
        <TabsComponent />
        <ScrollableComponent response={scrollableData}/>
        <StyledComponent />
        <div>
          {/* {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : "Loading..."} */}
        </div>
        <ResponsiveComponent />
      </div>
    </div>
  );
}
