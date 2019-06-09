import React, { Component } from "react";
import { connect } from "react-redux";
import { Card, Typography, Steps, Input, Button, Form, Icon } from "antd";
import { PageTitle } from "../../components";
import Actions from "../../redux/actions";
import AddSettlementModal from "../../components/modals/AddSettlementModal";
const { Step } = Steps;
const { Title } = Typography;

class PaymentsModal extends Component {
	render() {
		return (
			<div>
				<Form action="https://www.coinpayments.net/index.php" method="post">
					<Input type="hidden" name="cmd" value="_pay" />
					<Input type="hidden" name="reset" value="1" />
					<Input type="hidden" name="merchant" value="46ed83339e6e0252cb80d762294470da" />
					<Input type="hidden" name="item_name" value="USD" />
					<Input type="hidden" name="currency" value="USD" />
					<Input type="hidden" name="amountf" value="10.00000000" />
					<Input type="hidden" name="quantity" value="1" />
					<Input type="hidden" name="allow_quantity" value="0" />
					<Input type="hidden" name="want_shipping" value="1" />
					<Input type="hidden" name="success_url" value="http://localhost:3000/deposit" />
					<Input type="hidden" name="cancel_url" value="http://localhost:3000/deposit" />
					<Input type="hidden" name="ipn_url" value="https://preprod.onyxpay.co/api/v1/deposit" />
					<Input type="hidden" name="allow_extra" value="0" />
					<Input
						type="image"
						src="https://www.coinpayments.net/images/pub/CP-main-medium.png"
						alt="Buy Now with CoinPayments.net"
						style={{ textAlign: "left", width: 186, height: 79, borderStyle: "none" }}
					/>
				</Form>
			</div>
		);
	}
}
const steps = {
	settlements: 0,
	buyCache: 1,
	waitForApprovement: 2,
};

const items = steps;
const StepTitleCss = { textAlign: "left", borderBottom: "1px solid rgba(167, 180, 201, 0.3)" };
function getStepComponent(step, showSettlements, role) {
	if (step === steps.settlements) {
		return (
			<div style={{ marginBottom: 30 }}>
				<Title level={4} style={StepTitleCss}>
					Fill settlement account.
				</Title>
				<p>
					To upgrade to the position of agent or super agent you should input your settlement
					account. This information will be used for automatically sending to the user that is going
					to make the deposit.
				</p>
				<Button type="primary" onClick={showSettlements()}>
					<Icon type="plus" /> Add new settlement account
				</Button>
			</div>
		);
	} else if (step === steps.buyCache) {
		return (
			<div>
				<Title level={4} style={StepTitleCss}>
					Buy OnyxCache.
				</Title>
				<p>
					Please, buy OnyxCash amounting to <b>{role === "Agent" ? "500 $" : "100 000 $"}.</b>
				</p>
				<PaymentsModal />
			</div>
		);
	} else if (step === steps.waitForApprovement) {
		return (
			<div>
				<Title level={4} style={StepTitleCss}>
					Waiting for Approvement
				</Title>
			</div>
		);
	}
}

function getStepTitle(item, step) {
	if (item > step) {
		return "Waiting";
	} else if (item === step) {
		return "In Progress";
	} else {
		return "Finished";
	}
}

class UpgradeUser extends Component {
	state = {
		currentStep: steps.settlements,
		showSettlements: false,
	};
	checkSettlements() {
		const { getSettlementsList } = this.props;
		getSettlementsList().then(
			() => {
				if (this.props.settlements.length > 0) {
					this.setState({ currentStep: steps.buyCache });
				}
			},
			error => {
				throw new Error(error);
			}
		);
	}
	componentDidMount() {
		this.checkSettlements();
	}
	hideModal = type => () => {
		this.setState({ showSettlements: false });
		this.checkSettlements();
	};
	showModal = type => () => {
		this.setState({ showSettlements: true });
	};
	render() {
		let role;
		if (this.props.match.params.agent === ":agent") {
			role = "Agent";
		} else if (this.props.match.params.agent === ":super_agent") {
			role = "Super agent";
		} else {
			throw new Error("Unexpected role");
		}

		return (
			<>
				<PageTitle>Upgrade to the {role}</PageTitle>
				<Card>
					<section>
						<nav className="upgrade_navigation" style={{ float: "left", width: "30%" }}>
							<Steps direction="vertical" current={this.state.currentStep}>
								<Step
									title={getStepTitle(items.settlements, this.state.currentStep)}
									description="Fill settlements account."
								/>
								<Step
									title={getStepTitle(items.buyCache, this.state.currentStep)}
									description="Buy OnyxCache."
								/>
								<Step
									title={getStepTitle(items.waitForApprovement, this.state.currentStep)}
									description="Upgrading approvement."
								/>
							</Steps>
						</nav>
						<aside className="upgrade_step" style={{ float: "right", width: "70%" }}>
							{getStepComponent(this.state.currentStep, this.showModal, role)}
						</aside>
					</section>
				</Card>
				<AddSettlementModal
					isModalVisible={this.state.showSettlements}
					hideModal={this.hideModal()}
				/>
			</>
		);
	}
}

export default connect(
	state => {
		return {
			settlements: state.settlements,
			loading: state.loading,
		};
	},
	{
		getSettlementsList: Actions.settlements.getSettlementsList,
	}
)(UpgradeUser);
