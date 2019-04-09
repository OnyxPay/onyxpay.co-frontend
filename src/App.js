import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import { Home, Page404 } from "./pages";
import { Layout } from "antd";
import { Header, Footer, MainContent, Sidebar } from "./components";
import { getContractsAddress } from "./api/contracts";

class App extends Component {
  state = {
    collapsed: false
  };

  componentDidMount() {
    getContractsAddress();
  }

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
        <Layout className={collapsed ? "content-wrapper collapsed" : "content-wrapper"}>
          <Sidebar collapsed={collapsed} />
          <Layout>
            <MainContent>
              <Switch>
                <Route exact path="/" component={Home} />
                <Route path="/agents" component={() => <div>Agents page</div>} />
                <Route component={Page404} />
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
