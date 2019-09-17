import React, { Component } from "react";
import { connect } from "react-redux";
import { getRewardsAmount } from "api/referral";
import styled from "styled-components";
import { convertAmountToStr } from "utils/number";
import { roles } from "api/constants";
import { Row, Col, Card, Button, Modal, Typography, Table, Tooltip, Icon } from "antd";

const { Title } = Typography;

const Amount = styled.div`
	font-size: 34px;
	color: #374254;
	word-break: break-all;
`;
const AssetLabel = styled.span`
	font-weight: 500;
`;
const referralRewardByAssetColumns = [
	{
		title: "Asset",
		dataIndex: "symbol",
		key: "symbol",
		render: symbol => (symbol ? symbol : "n/a"),
	},
	{
		title: "Amount",
		dataIndex: "amount",
		key: "amount",
		render: amount => (amount ? amount : "n/a"),
	},
];

class ReferralReward extends Component {
	state = {
		modalVisible: false,
		totalReward: 0,
		rewards: [],
	};

	componentDidMount = async () => {
		const data = await getRewardsAmount();
		this.setState({
			totalReward: convertAmountToStr(data.totalRewards, 8),
		});

		let balancesList = [];
		for (let element of data.rewards) {
			for (let asset in element) {
				balancesList.push({
					symbol: asset,
					amount: convertAmountToStr(element[asset], 8),
				});
			}
		}
		this.setState({
			rewards: balancesList,
		});
	};

	showModal = () => {
		this.setState({ modalVisible: true });
	};
	hideModal = () => {
		this.setState({ modalVisible: false });
	};

	render() {
		const { user } = this.props;
		return (
			<>
				<div>
					<Row gutter={16}>
						<Col lg={24} xl={10}>
							<Card
								title={
									<>
										Referral reward
										<Tooltip
											title="All received rewards has been already added to total balance and can be already used."
											placement="bottom"
											overlayStyle={{ maxWidth: 400 }}
										>
											<Icon
												type="info-circle"
												style={{ marginLeft: 5, marginTop: 10, fontSize: 18 }}
											/>
										</Tooltip>
									</>
								}
								extra={<Button onClick={this.showModal}>See details</Button>}
							>
								<Amount>{this.state.totalReward}</Amount>
								<AssetLabel>
									(in {user.role === roles.c ? "oUSD" : "OnyxCash"} equivalent)
								</AssetLabel>
							</Card>
						</Col>
					</Row>

					<Modal visible={this.state.modalVisible} onCancel={this.hideModal} footer={null}>
						<Title level={4}>Total rewards by asset:</Title>
						<Table
							columns={referralRewardByAssetColumns}
							dataSource={this.state.rewards}
							rowKey={record => record.symbol}
							pagination={false}
						/>
					</Modal>
				</div>
			</>
		);
	}
}

export default connect(state => {
	return {
		user: state.user,
	};
})(ReferralReward);
