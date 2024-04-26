//create a simple home component
import React from "react";
import { Link } from "react-router-dom";

const Documents = () => {
  return (
    <div>
      <h1>Welcome to the Documents Page</h1>
      <Link to="/">Go to Home Page</Link>
    </div>
  );
};

export default Documents;
