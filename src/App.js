import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import { Home, Page404, Deposit, Registration, Login, WalletUnlock } from "./pages";
import Layout from "./components/layout";
import Authorization from "./providers/Authorization";
// import { getContractsAddress } from "./api/contracts";
// import { initBalanceProvider } from "./providers/balanceProvider";

const Deposit2 = props => <div>Agent's deposit...</div>;

// permissions
const User = Authorization(["user"]);
const Agent = Authorization(["agent", "super agent"]);
const All = Authorization(["user", "agent", "super agent"]);

// routes with permissions
const UserDeposit = User(Deposit);
const AgentDeposit = Agent(Deposit2);
const Dashboard = All(Home);
const Page404Protected = All(Page404);

class App extends Component {
	state = {
		collapsed: false,
	};

	componentDidMount() {
		// getContractsAddress();
		// initBalanceProvider();
	}

	toggleSidebar = () => {
		this.setState({
			collapsed: !this.state.collapsed,
		});
	};

	render() {
		const { collapsed } = this.state;

		return (
			<Layout
				isSideBarCollapsed={collapsed}
				toggleSidebar={this.toggleSidebar}
				simplified={["/login", "/registration", "/wallet-unlock"]}
			>
				<Switch>
					<Route path="/" exact component={Dashboard} />
					<Route path="/deposit" component={UserDeposit} />
					<Route path="/deposit:agent" exact component={AgentDeposit} />
					<Route path="/login" exact component={Login} />
					<Route path="/registration" exact component={Registration} />
					<Route path="/wallet-unlock" exact component={WalletUnlock} />
					<Route component={Page404Protected} />
				</Switch>
			</Layout>
		);
	}
}

export default App;
