import { Icon, Menu } from "antd";
import { Link, withRouter } from "react-router-dom";
import React, { Component } from "react";
import { compose } from "redux";
import connect from "react-redux/es/connect/connect";

const SubMenu = Menu.SubMenu;

class SuperAdminSidebar extends Component {
	render() {
		const { location } = this.props;
		console.log(this.props);
		return (
			<Menu theme="dark" selectedKeys={[location.pathname]} mode="inline">
				<Menu.Item key={[location.pathname]}>
					<Link to={[location.pathname]} className="ant-menu-item-content">
						<Icon type="pay-circle" />
						<span>Investments</span>
					</Link>
				</Menu.Item>

				{/*<Menu.Item key={`${location.pathname}/setAmount`}>
						<Link to={`${location.pathname}/setAmount`}>SetAmount</Link>
					</Menu.Item>
					<Menu.Item key={`${location.pathname}/getUnclaimed`}>
						<Link to={`${location.pathname}/getUnclaimed`}>GetUnclaimed</Link>
					</Menu.Item>
					<Menu.Item key={`${location.pathname}/block`}>
						<Link to={`${location.pathname}/block`}>Block</Link>
					</Menu.Item>
					<Menu.Item key={`${location.pathname}/unblock`}>
					<Link to={`${location.pathname}/unblock`}>Unblock</Link>
				</Menu.Item>*/}
			</Menu>
		);
	}
}

function mapStateToProps(state) {
	return {
		user: state.user,
	};
}

SuperAdminSidebar = compose(
	withRouter,
	connect(mapStateToProps)
)(SuperAdminSidebar);

export default SuperAdminSidebar;
