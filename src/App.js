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
import { wsClientRun } from "./websock/client";

const Deposit2 = props => <div>Agent's deposit...</div>;

let Dashboard = Loadable({
	loader: () => import(/* webpackChunkName: "Home" */ "./pages/dashboard"),
	loading: Loader,
});

let Investments = Loadable({
	loader: () => import(/* webpackChunkName: "Admin" */ "./pages/admin-panel/investments"),
	loading: Loader,
});

let Assets = Loadable({
	loader: () => import(/* webpackChunkName: "Admin" */ "./pages/admin-panel/assets"),
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

let UpgradeUser = Loadable({
	loader: () => import(/* webpackChunkName: "UpgradeUser" */ "./pages/upgrade-user"),
	loading: Loader,
});

let ActiveRequests = Loadable({
	loader: () => import(/* webpackChunkName: "ActiveRequests" */ "./pages/requests/ActiveRequests"),
	loading: Loader,
});

const ClosedRequests = Loadable({
	loader: () => import(/* webpackChunkName: "ClosedRequests" */ "./pages/requests/ClosedRequests"),
	loading: Loader,
});

let AssetsExchange = Loadable({
	loader: () => import(/* webpackChunkName: "AssetsExchange" */ "./pages/assets-exchange"),
	loading: Loader,
});

let SendAsset = Loadable({
	loader: () => import(/* webpackChunkName: "SendAsset" */ "./pages/send-asset"),
	loading: Loader,
});

let Withdraw = Loadable({
	loader: () => import(/* webpackChunkName: "Withdraw" */ "./pages/withdraw"),
	loading: Loader,
});

let Users = Loadable({
	loader: () => import(/* webpackChunkName: "Users" */ "./pages/admin-panel/users"),
	loading: Loader,
});

let Profile = Loadable({
	loader: () => import(/* webpackChunkName: "Profile" */ "./pages/profile"),
	loading: Loader,
});

let UserUpgradeRequests = Loadable({
	loader: () =>
		import(/* webpackChunkName: "Users" */ "./pages/admin-panel/requests/UserUpgradeRequests"),
	loading: Loader,
});

// permissions
const User = Authorization([roles.c]);
const Agent = Authorization([roles.a, roles.sa]);
const All = Authorization([roles.c, roles.a, roles.sa]);
const AdminAndSuperAdmin = Authorization([roles.adm, roles.sadm]);
const AllRoles = Authorization([roles.c, roles.a, roles.sa, roles.adm, roles.sadm]);

// routes with permissions
Dashboard = All(Dashboard);
const UserDeposit = User(Deposit);
const AgentDeposit = Agent(Deposit2);
AssetsExchange = All(AssetsExchange);
Page404 = All(Page404);
Settlement = All(Settlement);
UpgradeUser = All(UpgradeUser);
SendAsset = User(SendAsset);

Withdraw = User(Withdraw);
Profile = AllRoles(Profile);
Users = AdminAndSuperAdmin(Users);
ActiveRequests = All(ActiveRequests);
UserUpgradeRequests = AdminAndSuperAdmin(UserUpgradeRequests);
Investments = AdminAndSuperAdmin(Investments);
Assets = AdminAndSuperAdmin(Assets);

class App extends Component {
	componentDidMount() {
		initBalanceProvider();
		syncLoginState();
		wsClientRun();
	}
	getAdditionalRoutes() {
		if (process.env.TAG === "prod") {
			return (
				<>
					<Route path="/deposit" component={UserDeposit} />
					<Route path="/deposit:agent" exact component={AgentDeposit} />
					<Route path="/active-requests/:type" exact component={ActiveRequests} />
					<Route path="/closed-requests/:type" exact component={ClosedRequests} />
					<Route path="/exchange" exact component={AssetsExchange} />
					<Route path="/send-asset" exact component={SendAsset} />
					<Route path="/withdraw" exact component={Withdraw} />
				</>
			);
		}
	}

	render() {
		return (
			<Layout simplified={["/login"]}>
				<Switch>
					<Route path="/" exact component={Dashboard} />
					<Route path="/admin/investments" exact component={Investments} />
					<Route path="/admin/users" exact component={Users} />
					<Route path="/admin/assets" exact component={Assets} />
					<Route path="/admin/requests/user-upgrade" exact component={UserUpgradeRequests} />
					<Route path="/login" exact component={Login} />
					<Route path="/profile" exact component={Profile} />
					<Route path="/settlement-accounts" exact component={Settlement} />
					<Route path="/upgrade-user:role" exact component={UpgradeUser} />
					{this.getAdditionalRoutes()}
					<Route component={Page404} />
				</Switch>
				<UnlockWalletModal />
				<SessionExpiredModal />
			</Layout>
		);
	}
}

export default App;
