import React, { Component } from "react";
import App from "./App";
import { connect } from "react-redux";
import { LoadingIndicator } from "./components";
import { authProvider } from "./api/auth";

/* 
	check token and wallet in session storage
	if none redirect to signIn
	else to "/"
*/
class AppInit extends Component {
	componentDidMount() {
		authProvider();
	}

	render() {
		const { user } = this.props;
		if (!user) {
			return <LoadingIndicator />;
		} else {
			return <App />;
		}
	}
}

export default connect(state => {
	return {
		user: state.user,
	};
})(AppInit);
