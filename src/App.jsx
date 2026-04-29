import React, { useState } from "react";
import Login from "./pages/Login";
import Patients from "./pages/Patients";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  return (
    <div>
      {isLoggedIn
        ? <Patients setIsLoggedIn={setIsLoggedIn} />
        : <Login setIsLoggedIn={setIsLoggedIn} />}
    </div>
  );
}

export default App;