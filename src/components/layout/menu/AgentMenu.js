import React, { Component } from "react";
import { Icon, Menu } from "antd";
import { Link, withRouter } from "react-router-dom";
import { compose } from "redux";
import connect from "react-redux/es/connect/connect";
import { roles } from "api/constants";

const SubMenu = Menu.SubMenu;

class AgentMenu extends Component {
	render() {
		const { location, role } = this.props;
		return (
			<Menu theme="dark" selectedKeys={[location.pathname]} mode="inline">
				<Menu.Item key="/">
					<Link to="/" className="ant-menu-item-content">
						<Icon type="dashboard" />
						<span>Dashboard</span>
					</Link>
				</Menu.Item>
				<SubMenu
					key="OnyxCash (agent)"
					title={
						<span className="ant-menu-item-content">
							<Icon type="interaction" />
							<span>OnyxCash</span>
						</span>
					}
				>
					<Menu.Item key="/deposit-onyx-cash">
						<Link to="/deposit-onyx-cash">Deposit</Link>
					</Menu.Item>
					<Menu.Item key="/active-requests/deposit-onyx-cash">
						<Link to="/active-requests/deposit-onyx-cash">Active deposit requests</Link>
					</Menu.Item>
					<Menu.Item key="/closed-requests/deposit-onyx-cash">
						<Link to="/closed-requests/deposit-onyx-cash">Closed deposit requests</Link>
					</Menu.Item>
				</SubMenu>
				{role === roles.a ? (
					<SubMenu
						key="active-requests"
						title={
							<span className="ant-menu-item-content">
								<Icon type="team" />
								<span>Customer requests</span>
							</span>
						}
					>
						<Menu.Item key="/active-requests/deposit">
							<Link to="/active-requests/deposit">Active deposit requests</Link>
						</Menu.Item>
						<Menu.Item key="/active-requests/withdraw">
							<Link to="/active-requests/withdraw">Active withdraw requests</Link>
						</Menu.Item>

						<Menu.Item key="/closed-requests/deposit">
							<Link to="/closed-requests/deposit">Closed deposit requests</Link>
						</Menu.Item>
						<Menu.Item key="/closed-requests/withdraw">
							<Link to="/closed-requests/withdraw">Closed withdraw requests</Link>
						</Menu.Item>
					</SubMenu>
				) : (
					<SubMenu
						key="active-requests"
						title={
							<span className="ant-menu-item-content">
								<Icon type="team" />
								<span>Customer requests</span>
							</span>
						}
					>
						<Menu.Item key="/active-customer-requests/deposit-onyx-cash">
							<Link to="/active-customer-requests/deposit-onyx-cash">Active deposit requests</Link>
						</Menu.Item>
						<Menu.Item key="/closed-customer-requests/deposit-onyx-cash">
							<Link to="/closed-customer-requests/deposit-onyx-cash">Closed deposit requests</Link>
						</Menu.Item>
					</SubMenu>
				)}

				<Menu.Item key="/exchange">
					<Link to="/exchange" className="ant-menu-item-content">
						<Icon type="wallet" />
						<span>Assets Exchange</span>
					</Link>
				</Menu.Item>
			</Menu>
		);
	}
}

function mapStateToProps(state) {
	return {
		user: state.user,
	};
}

AgentMenu = compose(
	withRouter,
	connect(mapStateToProps)
)(AgentMenu);

export default AgentMenu;
