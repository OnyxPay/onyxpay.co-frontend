import React from "react";
import { FormWrapper } from "../../../components/styled/index";

import BlockInvestor from "./Block";
import UnblockInvestor from "./Unblock";
import SetAmount from "./SetAmount";
import GetUnclaimed from "./GetUnclaimed";

const SuperAdmin = () => {
	return (
		<div>
			<FormWrapper>
				<h1>Set Amount</h1>
				<SetAmount />
			</FormWrapper>
			<FormWrapper>
				<h1>Get Unclaimed</h1>
				<GetUnclaimed />
			</FormWrapper>
			<FormWrapper>
				<h1>Block</h1>
				<BlockInvestor />
			</FormWrapper>
			<FormWrapper>
				<h1>Unblock</h1>
				<UnblockInvestor />
			</FormWrapper>
		</div>
	);
};

export default SuperAdmin;
