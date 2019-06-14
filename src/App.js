import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import Layout from "./components/layout";
import Authorization from "./providers/Authorization";
import Loadable from "react-loadable";
import { Loader } from "./components";

import { initBalanceProvider } from "./providers/balanceProvider";
import { syncLoginState } from "./providers/syncLoginState";
import UnlockWalletModal from "./components/modals/wallet/UnlockWalletModal";
import SessionExpiredModal from "./components/modals/SessionExpired";
import { roles } from "./api/constants";

import Users from "./pages/admin-panel/users/index";
// import Balance from "./components/balance/Balance";

const Deposit2 = props => <div>Agent's deposit...</div>;

let Dashboard = Loadable({
	loader: () => import(/* webpackChunkName: "Home" */ "./pages/dashboard"),
	loading: Loader,
});

let Investments = Loadable({
	loader: () => import(/* webpackChunkName: "Admin" */ "./pages/admin-panel/investments"),
	loading: Loader,
});

const Login = Loadable({
	loader: () => import(/* webpackChunkName: "Login" */ "./pages/login"),
	loading: Loader,
});

let Page404 = Loadable({
	loader: () => import(/* webpackChunkName: "Page404" */ "./pages/404"),
	loading: Loader,
});

const Deposit = Loadable({
	loader: () => import(/* webpackChunkName: "Deposit" */ "./pages/deposit"),
	loading: Loader,
});

let Settlement = Loadable({
	loader: () => import(/* webpackChunkName: "Settlement" */ "./pages/settlements"),
	loading: Loader,
});

const ActiveRequests = Loadable({
	loader: () => import(/* webpackChunkName: "ActiveRequests" */ "./pages/requests/ActiveRequests"),
	loading: Loader,
});

const ClosedRequests = Loadable({
	loader: () => import(/* webpackChunkName: "ClosedRequests" */ "./pages/requests/ClosedRequests"),
	loading: Loader,
});

let AssetsExchange = Loadable({
	loader: () => import(/* webpackChunkName: "ClosedRequests" */ "./pages/assets-exchange"),
	loading: Loader,
});

// permissions
const User = Authorization([roles.c]);
const Agent = Authorization([roles.a, roles.sa]);
const UserOrAgent = Authorization([roles.c, roles.a]);
const All = Authorization([roles.c, roles.a, roles.sa]);
// const Admin = Authorization(["admin", "super_admin"]);

// routes with permissions
Dashboard = All(Dashboard);
const UserDeposit = User(Deposit);
const AgentDeposit = Agent(Deposit2);
AssetsExchange = UserOrAgent(AssetsExchange);
Page404 = All(Page404);
Settlement = All(Settlement);

class App extends Component {
	componentDidMount() {
		initBalanceProvider();
		syncLoginState();
	}

	render() {
		return (
			<Layout simplified={["/login"]}>
				<Switch>
					<Route path="/" exact component={Dashboard} />
					<Route path="/admin/investments" exact component={Investments} />
					<Route path="/admin/users" exact component={Users} />
					<Route path="/login" exact component={Login} />
					<Route path="/deposit" component={UserDeposit} />
					<Route path="/deposit:agent" exact component={AgentDeposit} />
					<Route path="/settlement-accounts" exact component={Settlement} />
					<Route path="/active-requests" exact component={ActiveRequests} />
					<Route path="/closed-requests" exact component={ClosedRequests} />
					<Route path="/exchange" exact component={AssetsExchange} />
					<Route component={Page404} />
				</Switch>
				<UnlockWalletModal />
				<SessionExpiredModal />
			</Layout>
		);
	}
}

export default App;
