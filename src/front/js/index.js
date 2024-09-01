//import react into the bundle
import React from "react";
import ReactDOM from "react-dom";
import "regenerator-runtime/runtime";

//include your index.scss file into the bundle
import '../styles/home.css';
import '../styles/index.css';
import '../styles/profile.css';
import '../styles/signup.css';

//import your own components
import Layout from "./layout";

//render your react application
ReactDOM.render(<Layout />, document.querySelector("#app"));
