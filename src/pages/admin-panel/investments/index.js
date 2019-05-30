import React from "react";
import { FormWrapper } from "../../../components/styled";
import antd from "antd";

import BlockInvestor from "./Block";
import UnblockInvestor from "./Unblock";
import SetAmount from "./SetAmount";
import GetUnclaimed from "./GetUnclaimed";

const { Typography } = antd;
const { Title } = Typography;

const Investments = () => {
	return (
		<div>
			<FormWrapper>
				<Title level={4}>Set Amount</Title>
				<SetAmount />
			</FormWrapper>
			<FormWrapper>
				<Title level={4}>Get Unclaimed</Title>
				<GetUnclaimed />
			</FormWrapper>
			<FormWrapper>
				<Title level={4}>Block</Title>
				<BlockInvestor />
			</FormWrapper>
			<FormWrapper>
				<Title level={4}>Unblock</Title>
				<UnblockInvestor />
			</FormWrapper>
		</div>
	);
};

export default Investments;
