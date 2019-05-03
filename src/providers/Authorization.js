import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Redirect } from "react-router-dom";

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
				const { user } = this.props;
				if (!user) {
					return <Redirect to="/signup" />;
				} else if (allowedRoles.includes(user.role)) {
					return <WrappedComponent {...this.props} />;
				} else {
					return <Redirect to="/" />;
				}
			}
		}
		return connect(state => {
			return { user: state.user };
		})(WithAuthorization);
	};
}

export default Authorization;
