import React, { Component } from "react";
import App from "./App";
import { connect } from "react-redux";
import { LoadingIndicator } from "./components";
import { authProvider } from "./api/auth";

class AppInit extends Component {
	componentDidMount() {
		authProvider("http://3.120.190.178:8001");
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
