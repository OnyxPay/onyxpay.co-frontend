import React, { Component } from "react";
import "./App.css";
import { Route, Switch } from "react-router-dom";
import { Home } from "./pages";

class App extends Component {
  render() {
    return (
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="*" component={() => <div>Page 404</div>} />
      </Switch>
    );
  }
}

export default App;
