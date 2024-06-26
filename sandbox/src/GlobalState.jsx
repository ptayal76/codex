// GlobalStateContext.js
import React, { createContext, useContext, useState } from "react";

const GlobalStateContext = createContext();

export const GlobalStateProvider = ({ children }) => {
  const [cname, setCname] = useState("");
  const [cenv, setCenv] = useState("dev");
  const apiUrl = import.meta.env.VITE_API_URL;
  const hostnameDev = import.meta.env.VITE_HOSTNAME_DEV;
  const hostnameProd = import.meta.env.VITE_HOSTNAME_PROD;
  const hostnameStaging = import.meta.env.VITE_HOSTNAME_STAGING;
  const username = import.meta.env.VITE_USERNAME;
  const password = import.meta.env.VITE_PASSWORD;
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  const headersProd = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Basic ${import.meta.env.VITE_PROD_TOKEN}`,
  };
  return (
    <GlobalStateContext.Provider
      value={{ cname, setCname, cenv, setCenv, apiUrl,hostnameDev,hostnameStaging,hostnameProd,username,password,headers,headersProd }}
    >
      {children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () => useContext(GlobalStateContext);
