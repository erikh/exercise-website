import React from "react";
import ReactDOM from "react-dom/client";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import CssBaseline from "@mui/material/CssBaseline";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Root from "./pages/root";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <CssBaseline />
    <div
      style={{
        marginTop: "25%",
        marginBottom: "25%",
        marginLeft: "25%",
        marginRight: "25%",
      }}
    >
      <RouterProvider router={router} />
    </div>
  </React.StrictMode>
);
