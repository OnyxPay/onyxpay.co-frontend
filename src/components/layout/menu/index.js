import React, { Component } from "react";
import { compose } from "redux";
import connect from "react-redux/es/connect/connect";
import { debounce } from "lodash";
import { Layout } from "antd";
import { withRouter } from "react-router-dom";

import UserSidebar from "./UserSidebar";
import AgentSidebar from "./AgentSidebar";
import SuperAdminSidebar from "./SuperAdminSidebar";

const { Sider } = Layout;

// TODO: fix lock body scroll on mobile devises
// close sidebar on route change
// extract menu from sideBar

class Menu extends Component {
	constructor(props) {
		super(props);
		this.checkWindowWidth = debounce(this.checkWindowWidth.bind(this), 200);
		this.state = {
			xsDevise: false,
		};
	}

	checkWindowWidth() {
		const { xsDevise } = this.state;
		if (window.innerWidth <= 575 && !xsDevise) {
			this.setState({ xsDevise: true });
		} else if (window.innerWidth > 575 && xsDevise) {
			this.setState({ xsDevise: false });
		}
	}

	componentDidMount() {
		this.checkWindowWidth();
		window.addEventListener("resize", this.checkWindowWidth);
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this.checkWindowWidth);
	}

	render() {
		const { collapsed, user } = this.props;
		const { xsDevise } = this.state;

		return (
			<Sider
				className="sidebar"
				collapsible
				collapsed={collapsed}
				trigger={null}
				width="240"
				collapsedWidth={xsDevise ? "0" : "80"}
			>
				{user && user.role === "user" && <UserSidebar />}
				{user && user.role === "agent" && <AgentSidebar />}
				{user && user.role === "super admin" && <SuperAdminSidebar />}
			</Sider>
		);
	}
}

function mapStateToProps(state) {
	return {
		user: state.user,
	};
}

Menu = compose(
	withRouter,
	connect(mapStateToProps)
)(Menu);

export default Menu;
