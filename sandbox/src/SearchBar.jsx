import React, { useState } from "react";
import { useGlobalState } from './GlobalState.jsx';
import './SearchBar.css'; // Import the CSS file for styling

const SearchBar = () => {
  const { cname, setCname } = useGlobalState();
  const { cenv, setCenv } = useGlobalState();
  const [query, setQuery] = useState(cname);

  const handleInputChange = (e) => {
    setCname(e.target.value);
    setQuery(e.target.value);
  };

  const handleEnvChange = (e) => {
    setCenv(e.target.value);
  };

  return (
    <div className="search-bar">
      <label className="label">Cluster Name</label>
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={handleInputChange}
        className="search-input"
      />
      <select value={cenv} onChange={handleEnvChange} className="env-dropdown">
        <option value="dev">dev</option>
        <option value="staging">staging</option>
        <option value="prod">prod</option>
      </select>
    </div>
  );
};

export default SearchBar;
