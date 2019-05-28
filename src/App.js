import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import Layout from "./components/layout";
import Authorization from "./providers/Authorization";
import Loadable from "react-loadable";
import { Loader } from "./components";

import { getContractsAddress } from "./api/contracts";
// import { initBalanceProvider } from "./providers/balanceProvider";
import { syncLoginState } from "./providers/syncLoginState";
import UnlockWalletModal from "./components/modals/wallet/UnlockWalletModal";
import SessionExpiredModal from "./components/modals/SessionExpired";

//import Admin from "./pages/admin-panel/index";
import Users from "./pages/admin-panel/users/index";
import Investments from "./pages/admin-panel/investments/index";

const Deposit2 = props => <div>Agent's deposit...</div>;

let Dashboard = Loadable({
	loader: () => import(/* webpackChunkName: "Home" */ "./pages/dashboard"),
	loading: Loader,
});

/*let AdminPanel = Loadable({
	loader: () => import(/!* webpackChunkName: "Admin" *!/ "./pages/admin-panel/investments"),
	loading: Loader,
});*/

const Login = Loadable({
	loader: () => import(/* webpackChunkName: "Login" */ "./pages/login"),
	loading: Loader,
});

let Page404 = Loadable({
	loader: () => import(/* webpackChunkName: "Page404" */ "./pages/404"),
	loading: Loader,
});

const Deposit = Loadable({
	loader: () => import(/* webpackChunkName: "Page404" */ "./pages/deposit"),
	loading: Loader,
});

const Settlement = Loadable({
	loader: () => import(/* webpackChunkName: "Settlement" */ "./pages/settlements"),
	loading: Loader,
});

// permissions
const User = Authorization(["user"]);
const Agent = Authorization(["agent", "super agent"]);
const All = Authorization(["user", "agent", "super agent"]);
//const Admin = Authorization(["admin", "super admin"]);

// routes with permissions
Dashboard = All(Dashboard);
const UserDeposit = User(Deposit);
const AgentDeposit = Agent(Deposit2);
//const SuperAdmin = Admin(AdminPanel);
Page404 = All(Page404);

class App extends Component {
	componentDidMount() {
		getContractsAddress();
		// initBalanceProvider();
		syncLoginState();
	}

	render() {
		return (
			<Layout simplified={["/login"]}>
				<Switch>
					<Route path="/" exact component={Dashboard} />
					<Route path="/admin/investments" component={Investments} />
					<Route path="/admin/users" component={Users} />
					<Route path="/login" exact component={Login} />
					<Route path="/deposit" component={UserDeposit} />
					<Route path="/deposit:agent" exact component={AgentDeposit} />
					<Route path="/settlement-accounts" exact component={Settlement} />
					<Route component={Page404} />
				</Switch>
				<UnlockWalletModal />
				<SessionExpiredModal />
			</Layout>
		);
	}
}

export default App;
