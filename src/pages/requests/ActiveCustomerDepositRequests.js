import { compose } from "redux";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import ActiveRequests from "pages/requests/ActiveRequests";
import { createLoadingSelector } from "selectors/loading";
import { push } from "connected-react-router";
import { getOpMessages, GET_MESSAGES_REQUESTS, disableRequest } from "redux/requests";

const loadingSelector = createLoadingSelector([GET_MESSAGES_REQUESTS]);
function mapStateToProps(state, ownProps) {
	return {
		user: state.user,
		walletAddress: state.wallet.defaultAccountAddress,
		data: state.opMessages,
		isFetching: loadingSelector(state),
		balanceAssets: state.balance.assets,
		balanceOnyxCash: state.balance.onyxCash,
	};
}

var ActiveCustomerDepositRequests = compose(
	withRouter,
	connect(
		mapStateToProps,
		{ push, getOpRequests: getOpMessages, disableRequest }
	)
)(ActiveRequests);

export default ActiveCustomerDepositRequests;
