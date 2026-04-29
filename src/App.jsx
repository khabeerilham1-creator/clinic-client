import React from "react";
import Login from "./pages/Login";
import Patients from "./pages/Patients";

function App() {

  // simple toggle (after login you can switch)
  const isLoggedIn = false; // change to true after login

  return (
    <div>
      {isLoggedIn ? <Patients /> : <Login />}
    </div>
  );
}

export default App;