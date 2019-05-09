import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import Layout from "./components/layout";
import Authorization from "./providers/Authorization";
import Loadable from "react-loadable";
import { Loader } from "./components";
// import { getContractsAddress } from "./api/contracts";
// import { initBalanceProvider } from "./providers/balanceProvider";

const Deposit2 = props => <div>Agent's deposit...</div>;

let Dashboard = Loadable({
	loader: () => import(/* webpackChunkName: "Home" */ "./pages/dashboard"),
	loading() {
		return <Loader />;
	},
	delay: 300,
});

const Login = Loadable({
	loader: () => import(/* webpackChunkName: "Login" */ "./pages/login"),
	loading() {
		return <Loader />;
	},
});

const Registration = Loadable({
	loader: () => import(/* webpackChunkName: "Registration" */ "./pages/registration"),
	loading() {
		return <Loader />;
	},
});

const WalletUnlock = Loadable({
	loader: () => import(/* webpackChunkName: "WalletUnlock" */ "./pages/wallet-unlock"),
	loading() {
		return <Loader />;
	},
});

let Page404 = Loadable({
	loader: () => import(/* webpackChunkName: "Page404" */ "./pages/404"),
	loading() {
		return <Loader />;
	},
});

const Deposit = Loadable({
	loader: () => import(/* webpackChunkName: "Page404" */ "./pages/deposit"),
	loading() {
		return <Loader />;
	},
});

// permissions
const User = Authorization(["user"]);
const Agent = Authorization(["agent", "super agent"]);
const All = Authorization(["user", "agent", "super agent"]);

// routes with permissions
Dashboard = All(Dashboard);
const UserDeposit = User(Deposit);
const AgentDeposit = Agent(Deposit2);
Page404 = All(Page404);

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
					<Route path="/login" exact component={Login} />
					<Route path="/registration" exact component={Registration} />
					<Route path="/wallet-unlock" exact component={WalletUnlock} />
					<Route path="/deposit" component={UserDeposit} />
					<Route path="/deposit:agent" exact component={AgentDeposit} />
					<Route component={Page404} />
				</Switch>
			</Layout>
		);
	}
}

export default App;
