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

let Dashboard = Loadable({
	loader: () => import(/* webpackChunkName: "Home" */ "./pages/dashboard"),
	loading: Loader,
});

let Investments = Loadable({
	loader: () => import(/* webpackChunkName: "Admin" */ "./pages/admin-panel/investments"),
	loading: Loader,
});

let Complaints = Loadable({
	loader: () =>
		import(/* webpackChunkName: "Admin" */ "./pages/admin-panel/requests/ComplaintsList"),
	loading: Loader,
});

let ResolvedComplaints = Loadable({
	loader: () =>
		import(/* webpackChunkName: "Admin" */ "./pages/admin-panel/requests/ResolvedComplaints"),
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

let Deposit = Loadable({
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

let ReferralProgram = Loadable({
	loader: () => import(/* webpackChunkName: "ReferralProgram" */ "./pages/referral-program"),
	loading: Loader,
});

let UserUpgradeRequests = Loadable({
	loader: () =>
		import(/* webpackChunkName: "Users" */ "./pages/admin-panel/requests/UserUpgradeRequests"),
	loading: Loader,
});

let ActiveCustomerDepositRequests = Loadable({
	loader: () =>
		import(/* webpackChunkName: "ActiveCustomerDepositRequests" */ "./pages/requests/ActiveCustomerDepositRequests"),
	loading: Loader,
});

let ActiveCustomerWithdrawRequests = Loadable({
	loader: () =>
		import(/* webpackChunkName: "ActiveCustomerWithdrawRequests" */ "./pages/requests/ActiveCustomerWithdrawRequests"),
	loading: Loader,
});

let ActiveOwnDepositRequests = Loadable({
	loader: () =>
		import(/* webpackChunkName: "ActiveOwnDepositRequests" */ "./pages/requests/ActiveOwnDepositRequests"),
	loading: Loader,
});

let ActiveOwnWithdrawRequests = Loadable({
	loader: () =>
		import(/* webpackChunkName: "ActiveCustomerWithdrawRequests" */ "./pages/requests/ActiveOwnWithdrawRequests"),
	loading: Loader,
});

let ClosedOpRequests = Loadable({
	loader: () =>
		import(/* webpackChunkName: "ClosedOpRequests" */ "./pages/requests/ClosedRequests"),
	loading: Loader,
});

// permissions
const User = Authorization([roles.c]);
// const AgentAndSuperAgent = Authorization([roles.a, roles.sa]);
const All = Authorization([roles.c, roles.a, roles.sa]);
const AllAndSupport = Authorization([roles.c, roles.a, roles.sa, roles.support]);
const AdminAndSuperAdmin = Authorization([roles.adm, roles.sadm]);
const AdminAndSuperAdminAndSupport = Authorization([roles.adm, roles.sadm, roles.support]);
// const UserAndAgent = Authorization([roles.c, roles.a]);
const AllRoles = Authorization([roles.c, roles.a, roles.sa, roles.adm, roles.support, roles.sadm]);

// routes with permissions
Dashboard = All(Dashboard);
AssetsExchange = All(AssetsExchange);
Page404 = All(Page404);
Settlement = All(Settlement);
UpgradeUser = All(UpgradeUser);
Profile = All(Profile);
SendAsset = User(SendAsset);
Withdraw = User(Withdraw);
Profile = AllRoles(Profile);
Users = AdminAndSuperAdminAndSupport(Users);
UserUpgradeRequests = AdminAndSuperAdmin(UserUpgradeRequests);
Investments = AdminAndSuperAdmin(Investments);
Complaints = AdminAndSuperAdminAndSupport(Complaints);
ResolvedComplaints = AdminAndSuperAdminAndSupport(ResolvedComplaints);
Assets = AdminAndSuperAdmin(Assets);
ActiveCustomerDepositRequests = All(ActiveCustomerDepositRequests);
ActiveCustomerWithdrawRequests = All(ActiveCustomerWithdrawRequests);
ActiveOwnDepositRequests = All(ActiveOwnDepositRequests);
ActiveOwnWithdrawRequests = All(ActiveOwnWithdrawRequests);
ClosedOpRequests = All(ClosedOpRequests);
Deposit = All(Deposit);
ReferralProgram = All(ReferralProgram);

class App extends Component {
	componentDidMount() {
		initBalanceProvider();
		syncLoginState();
		wsClientRun();
	}
	getAdditionalRoutes() {
		if (process.env.REACT_APP_TAG !== "prod") {
			return (
				<>
					<Route path="/deposit" component={Deposit} />
					<Route path="/exchange" exact component={AssetsExchange} />
					<Route path="/send-asset" exact component={SendAsset} />
					<Route path="/withdraw" exact component={Withdraw} />
					<Route path="/deposit-onyx-cash" exact component={Deposit} />
					{/* Agent initiator || Super agent initiator */}
					<Route
						path="/active-requests/deposit-onyx-cash"
						exact
						component={ActiveOwnDepositRequests}
					/>
					<Route path="/closed-requests/deposit-onyx-cash" exact component={ClosedOpRequests} />
					<Route
						path="/active-customer-requests/deposit"
						exact
						component={ActiveCustomerDepositRequests}
					/>
					<Route
						path="/active-customer-requests/withdraw"
						exact
						component={ActiveCustomerWithdrawRequests}
					/>
					{/* Super agent performer */}
					<Route
						path="/active-customer-requests/deposit-onyx-cash"
						exact
						component={ActiveCustomerDepositRequests}
					/>
					<Route
						path="/closed-customer-requests/deposit-onyx-cash"
						exact
						component={ClosedOpRequests}
					/>
					{/* Agent performer || client initiator */}
					<Route path="/active-requests/deposit" exact component={ActiveOwnDepositRequests} />
					<Route path="/active-requests/withdraw" exact component={ActiveOwnWithdrawRequests} />
					<Route path="/closed-requests/deposit" exact component={ClosedOpRequests} />
					<Route path="/closed-requests/withdraw" exact component={ClosedOpRequests} />
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
					<Route path="/admin/requests/complaints" exact component={Complaints} />
					<Route path="/admin/requests/complaints/resolve" exact component={ResolvedComplaints} />
					<Route path="/login" exact component={Login} />
					<Route path="/profile" exact component={Profile} />
					<Route path="/referral-program" exact component={ReferralProgram} />
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
