// GlobalStateContext.js
import React, { createContext, useContext, useState } from 'react';

const GlobalStateContext = createContext();

export const GlobalStateProvider = ({ children }) => {
  const [cname, setCname] = useState("");
  const [cenv, setCenv] = useState("dev");

  return (
    <GlobalStateContext.Provider value={{ cname, setCname,cenv,setCenv }}>
      {children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () => useContext(GlobalStateContext);
