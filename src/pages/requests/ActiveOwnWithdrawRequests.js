import { compose } from "redux";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import ActiveRequests from "pages/requests/ActiveRequests";
import { createLoadingSelector } from "selectors/loading";
import { push } from "connected-react-router";
import { getOwnOpRequests, GET_OWN_OPERATION_REQUESTS } from "redux/ownRequests";

const loadingSelector = createLoadingSelector([GET_OWN_OPERATION_REQUESTS]);
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

var ActiveOwnWithdrawRequests = compose(
	withRouter,
	connect(
		mapStateToProps,
		{ push, getOpRequests: getOwnOpRequests }
	)
)(ActiveRequests);

export default ActiveOwnWithdrawRequests;
