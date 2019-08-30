import { compose } from "redux";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import ActiveRequests from "pages/requests/ActiveRequests";
import { createLoadingSelector } from "selectors/loading";
import { push } from "connected-react-router";
import { getOpRequests, GET_OPERATION_REQUESTS } from "redux/requests";
import { disableRequest } from "redux/requests";

const loadingSelector = createLoadingSelector([GET_OPERATION_REQUESTS]);
function mapStateToProps(state, ownProps) {
	return {
		user: state.user,
		walletAddress: state.wallet.defaultAccountAddress,
		data: state.opRequests,
		isFetching: loadingSelector(state),
		balanceAssets: state.balance.assets,
		balanceOnyxCash: state.balance.onyxCash,
	};
}

var ActiveOwnDepositRequests = compose(
	withRouter,
	connect(
		mapStateToProps,
		{ push, getOpRequests, disableRequest }
	)
)(ActiveRequests);

export default ActiveOwnDepositRequests;
