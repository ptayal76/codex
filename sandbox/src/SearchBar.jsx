import React, { useState } from "react";
import { useGlobalState } from './GlobalState.jsx';

// import {CNAME,generateRandomString} from './constants'
const SearchBar = () => {
  const { cname, setCname } = useGlobalState();
  const [query, setQuery] = useState(cname);
  const handleChange = (e) => {
    setCname(e.target.value)
    setQuery(e.target.value)
  };

  return (
    <div className="search-bar">
      Cluster Name
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={handleChange}
        className="search-input"
      />
    </div>
  );
};

export default SearchBar;
