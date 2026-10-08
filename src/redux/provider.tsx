"use client";

import { store } from "./store";
import { Provider } from "react-redux";
import React from "react";
import StoreHydrator from "@/components/Common/StoreHydrator";

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <StoreHydrator />
      {children}
    </Provider>
  );
}
