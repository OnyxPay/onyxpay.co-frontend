import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import { Home } from "./pages";
import { Layout } from "antd";
import { Header, Footer, MainContent, Sidebar } from "./components";

class App extends Component {
  state = {
    collapsed: false
  };

  toggleSidebar = () => {
    this.setState({
      collapsed: !this.state.collapsed
    });
  };

  render() {
    const { collapsed } = this.state;
    return (
      <Layout style={{ minHeight: "100vh" }}>
        <Header toggleSidebar={this.toggleSidebar} isSidebarCollapsed={collapsed} />
        <Layout style={collapsed ? { margin: "64px 0 0 80px" } : { margin: "64px 0 0 240px" }}>
          <Sidebar collapsed={collapsed} />
          <Layout>
            <MainContent>
              <Switch>
                <Route exact path="/" component={Home} />
                <Route path="/agents" component={() => <div>Agents page</div>} />
              </Switch>
            </MainContent>
            <Footer />
          </Layout>
        </Layout>
      </Layout>
    );
  }
}

export default App;
