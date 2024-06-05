import React from "react";

const SearchResults = ({ results }) => {
  return (
    <div className="search-results">
      {results.length > 0 ? (
        results.map((result, index) => (
          <div key={index} className="result-item">
            <a href={result.link} className="result-link">
              {result.title}
            </a>
            <p className="result-description">{result.description}</p>
          </div>
        ))
      ) : (
        <p>No results found</p>
      )}
    </div>
  );
};

export default SearchResults;
