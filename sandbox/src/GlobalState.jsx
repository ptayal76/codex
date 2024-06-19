// GlobalStateContext.js
import React, { createContext, useContext, useState } from 'react';

const GlobalStateContext = createContext();

export const GlobalStateProvider = ({ children }) => {
  const [cname, setCname] = useState("");
  const [cenv, setCenv] = useState("dev");
  const apiUrl = import.meta.env.VITE_API_URL;

  return (
    <GlobalStateContext.Provider value={{ cname, setCname,cenv,setCenv, apiUrl }}>
      {children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () => useContext(GlobalStateContext);
