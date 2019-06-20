import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Redirect } from "react-router-dom";
import { roles } from "../api/constants";

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
			render() {
				const { user, location } = this.props;
				if (!user) {
					return <Redirect to="/login" />;
				} else if (allowedRoles.includes(user.role) && user.status === 1) {
					// user is confirmed
					return <WrappedComponent {...this.props} />;
				} else if (allowedRoles.includes(user.role) && user.status !== 1 && location === "/") {
					return <WrappedComponent {...this.props} />;
				} else if (user.role === roles.adm || user.role === roles.sadm) {
					return <Redirect to="/admin/investments" />;
				} else {
					return <Redirect to="/" />;
				}
			}
		}
		return connect(state => {
			return { user: state.user, location: state.router.location.pathname };
		})(WithAuthorization);
	};
}

export default Authorization;
