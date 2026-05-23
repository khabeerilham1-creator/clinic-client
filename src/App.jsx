import React from "react";

import Login from "./pages/Login";
import Patients from "./pages/Patients";

function App() {

  const token =
    localStorage.getItem("token");

  // IF NOT LOGGED IN
  if (!token) {

    return <Login />;

  }

  // IF LOGGED IN
  return <Patients />;

}

export default App;