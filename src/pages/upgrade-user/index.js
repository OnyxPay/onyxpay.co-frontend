import React, { Component } from "react";
import styled from "styled-components";
// import { connect } from "react-redux";
import { Card, Typography, Steps, Input, Button, Form } from "antd";
import { PageTitle } from "../../components";
// import Actions from "../../redux/actions";
import { getSettlementForm } from "../../components/modals/SettlementForm";
const { Step } = Steps;
const { Title } = Typography;

const NavigationPanel = styled.div`
	font-size: 16px;
	font-weight: bold;
	margin-top: 20px;
	clear: left;
	bottom: 10;
	width: 100%;
	text-align: right;
`;
const ButtonsBlock = styled.div`
	margin-right: 0;
	margin-left: auto;
	display: block;
`;

class PaymentsModal extends Component {
	render() {
		return (
			<div>
				<Title level={4} style={{ textAlign: "center" }}>
					Payment systems
				</Title>
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

function getStepComponent(step) {
	if (step === steps.settlements) {
		return getSettlementForm(undefined, undefined, undefined);
	} else if (step === steps.buyCache) {
		return <PaymentsModal />;
	} else if (step === steps.waitForApprovement) {
		return <div>Waiting for Approvement</div>;
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

function getDisplyButtonStyle(buttonName, step) {
	if (
		(buttonName === "next" && step === steps.waitForApprovement) ||
		(buttonName === "back" && step === steps.settlements)
	) {
		return "none";
	}
	return "";
}

class UpgradeUser extends Component {
	state = {
		currentStep: steps.settlements,
	};
	next = type => () => {
		if (this.state.currentStep < steps.waitForApprovement) {
			this.setState({ currentStep: ++this.state.currentStep });
		}
	};
	back = type => () => {
		if (this.state.currentStep > steps.settlements) {
			this.setState({ currentStep: --this.state.currentStep });
		}
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
							{getStepComponent(this.state.currentStep)};
						</aside>
					</section>
					<NavigationPanel>
						<ButtonsBlock>
							<Button
								key="back"
								onClick={this.back()}
								style={{ display: getDisplyButtonStyle("back", this.state.currentStep) }}
							>
								Back
							</Button>
							<Button
								key="next"
								onClick={this.next()}
								style={{
									marginLeft: 10,
									display: getDisplyButtonStyle("next", this.state.currentStep),
								}}
							>
								Next
							</Button>
						</ButtonsBlock>
					</NavigationPanel>
				</Card>
			</>
		);
	}
}
export default UpgradeUser;
