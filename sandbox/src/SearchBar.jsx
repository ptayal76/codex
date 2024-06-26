import React, { useState } from "react";
import { useGlobalState } from './GlobalState.jsx';
import './SearchBar.css'; // Import the CSS file for styling
import { Select , Input } from "antd";
const SearchBar = () => {
  const { cname, setCname } = useGlobalState();
  const { cenv, setCenv } = useGlobalState();
  const [query, setQuery] = useState(cname);

  const handleInputChange = (e) => {
    setCname(e.target.value);
    setQuery(e.target.value);
    console.log("Cname: ", cname);
  };

  return (
    <div className="flex flex-row gap-3">
      <div className="flex flex-row flex-grow gap-4">
        <Input defaultValue={cname} placeholder="Search..." addonBefore={<strong>Cluster Name :</strong>} onChange={handleInputChange} size="large"/>
      </div>
      <Select
        defaultValue={cenv}
        style={{
            width: 120,
        }}
        options={[
            {
                value: 'dev',
                label: 'dev',
            },
            {
                value: 'staging',
                label: 'staging',
            },
            {
                value: 'prod',
                label: 'prod',
            }
        ]}
        onChange={(value)=> setCenv(value)}
        size="large"
      />
    </div>
  );
};

export default SearchBar;
