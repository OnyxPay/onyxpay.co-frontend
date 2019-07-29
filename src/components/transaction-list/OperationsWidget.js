import React, { Component } from "react";
import { getOperationHistory } from "api/transactions-history";
import { convertAmountToStr } from "utils/number";
import TransactionsTable from "components/transaction-list/TransactionsTable";

class OperationsWidget extends Component {
	render() {
		const operationHistoryColumns = [];

		return (
			<>
				<TransactionsTable
					columns={operationHistoryColumns}
					dataFetchFunction={getOperationHistory}
				/>
			</>
		);
	}
}

export default OperationsWidget;
