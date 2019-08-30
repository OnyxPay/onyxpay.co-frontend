import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Redirect } from "react-router-dom";
import { roles, userStatus } from "../api/constants";
import { getUserData } from "../redux/user";

/**
 * HOC that Handles whether or not the user is allowed to see the page.
 * @param {array} allowedRoles - user roles that are allowed to see the page.
 * @returns {Component}
 */

function Authorization(allowedRoles) {
	return function(WrappedComponent) {
		class WithAuthorization extends React.Component {
			static propTypes = {
				user: PropTypes.object,
			};

			getRedirectPath(location) {
				return location.pathname + location.search;
			}

			render() {
				const { user, location } = this.props;
				if (!user) {
					// user in not logged in
					return (
						<Redirect
							to={{
								pathname: "/login",
								state: { redirectFrom: this.getRedirectPath(location) },
							}}
						/>
					);
				} else if (
					allowedRoles.includes(user.role) &&
					(user.status === userStatus.active || user.status === userStatus.blocked)
				) {
					// user is confirmed
					return <WrappedComponent {...this.props} />;
				} else if (allowedRoles.includes(user.role) && location.pathname === "/") {
					// user is unconfirmed show Confirmation modal
					return <WrappedComponent {...this.props} />;
				} else if (user.role === roles.adm || user.role === roles.sadm) {
					return <Redirect to="/admin/users" />;
				} else if (!allowedRoles.includes(user.role)) {
					return <Redirect to="/login" />;
				} else {
					return <Redirect to="/" />;
				}
			}
		}
		return connect(
			state => {
				return { user: state.user, location: state.router.location };
			},
			{ getUserData }
		)(WithAuthorization);
	};
}

export default Authorization;
