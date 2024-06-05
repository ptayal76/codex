import React from "react";

const ScrollableComponent = ({response}) => {
  const messages = Array.from({ length: 20 }, (_, i) => `Message ${i + 1}`);

  return (
    <div className="scrollable">
      <h3>Scrollable Component</h3>
      <div className="scrollable-content">
        {response.map((rs, index) => (
          <div key={index} className="message">
            <p>{rs.message}</p>
            <div className="buttons">
              <button className="btn">Action</button>
              <a href="#!" className="link">
                More info
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScrollableComponent;
