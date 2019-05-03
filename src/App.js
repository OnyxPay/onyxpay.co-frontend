import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import { Home, Page404, Deposit, SignUp } from "./pages";
import Layout from "./components/layout";
import Authorization from "./providers/Authorization";
// import { getContractsAddress } from "./api/contracts";
// import { initBalanceProvider } from "./providers/balanceProvider";

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
				simplified={["/login"]}
			>
				<Switch>
					<Route path="/" exact component={Home} />
					<Route path="/deposit" component={UserDeposit} />
					<Route path="/deposit:agent" exact component={AgentDeposit} />
					<Route path="/login" exact component={SignUp} />
					<Route component={Page404} />
				</Switch>
			</Layout>
		);
	}
}

export default App;
