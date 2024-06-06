import React, { useState } from 'react';
import './Sandbox.css';

const Sandbox = () => {
  return (
    <div className="sandbox-container">
      <iframe src="https://codesandbox.io/embed/vsrqqr?view=preview&module=%2Fsrc%2Fcomponents%2FLandingPage.tsx&hidenavigation=1"
      style={{
        width: '100%',
        height: '800px',
        border: '0',
        borderRadius: '4px',
        overflow: 'hidden'
      }}
     className="sandbox-iframe"
     title="tse"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>
    </div>
  );
};

export default Sandbox;
