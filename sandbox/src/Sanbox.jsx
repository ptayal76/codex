import React, { useState } from 'react';
import './Sandbox.css';

const Sandbox = () => {
  return (
    <div className="sandbox-container">
      <div className="iframe-wrapper">
        {/* src="https://codesandbox.io/embed/vsrqqr?view=preview&module=%2Fsrc%2Fcomponents%2FLandingPage.tsx&hidenavigation=1" */}
        <iframe 
          src="https://codesandbox.io/embed/j4ch89?view=preview&module=%2Fsrc%2Fcomponents%2Fhome.tsx&hidenavigation=1"
          className="sandbox-iframe"
          title="tse"
          allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
          sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
        ></iframe>
      </div>
    </div>
  );
};

export default Sandbox;
