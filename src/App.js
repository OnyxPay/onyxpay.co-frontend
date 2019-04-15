import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import { Home, Page404, Deposit } from "./pages";
import { Layout } from "antd";
import { Header, Footer, MainContent, Sidebar } from "./components";
import { getContractsAddress } from "./api/contracts";
import { initBalanceProvider } from "./providers/balanceProvider";
import Authorization from "./providers/Authorization";

const Deposit2 = props => <div>Agent's deposit...</div>;

const User = Authorization(["user"]);
const Agent = Authorization(["agent", "super agent"]);
// const SuperAgent = Authorization(["super agent"]);

const UserDeposit = User(Deposit);
const AgentDeposit = Agent(Deposit2);

class App extends Component {
	state = {
		collapsed: false,
	};

	componentDidMount() {
		getContractsAddress();
		initBalanceProvider();
	}

	toggleSidebar = () => {
		this.setState({
			collapsed: !this.state.collapsed,
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
								<Route path="/" exact component={Home} />
								<Route path="/deposit" component={UserDeposit} />
								<Route path="/deposit:agent" exact component={AgentDeposit} />
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
