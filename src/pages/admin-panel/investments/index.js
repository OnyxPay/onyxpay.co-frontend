import React from "react";
import { FormWrapper } from "../../../components/styled";

import BlockInvestor from "./Block";
import UnblockInvestor from "./Unblock";
import SetAmount from "./SetAmount";
import GetUnclaimed from "./GetUnclaimed";

const Investments = () => {
	return (
		<div>
			<FormWrapper>
				<SetAmount />
			</FormWrapper>
			<FormWrapper>
				<GetUnclaimed />
			</FormWrapper>
			<FormWrapper>
				<BlockInvestor />
			</FormWrapper>
			<FormWrapper>
				<UnblockInvestor />
			</FormWrapper>
		</div>
	);
};

export default Investments;
