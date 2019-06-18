import React, { Component } from "react";
import { connect } from "react-redux";
import { Card, Typography, Steps, Button, Icon } from "antd";
import { PageTitle } from "../../components";
import Actions from "../../redux/actions";
import AddSettlementModal from "../../components/modals/AddSettlementModal";
import { CoinPaymentsForm } from "./CoinPaymentsForm";
import { IPayForm } from "./IPayForm";
import { getRestClient, getAuthHeaders } from "../../api/network";
const restClient = getRestClient();

async function sendUpgradeRequest(role) {
	const authHeaders = getAuthHeaders();
	const form = await restClient.post("upgrade-request", {
		headers: {
			...authHeaders,
		},
		data: {
			role: role,
		},
	});
	return form;
}

const { Step } = Steps;
const { Title } = Typography;

const steps = {
	settlements: 0,
	buyCache: 1,
	waitForApprovement: 2,
};

const StepTitleCss = { textAlign: "left", borderBottom: "1px solid rgba(167, 180, 201, 0.3)" };

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
		stepsStyle: {
			float: "left",
			minWidth: 130,
			width: 130,
			borderRight: "1px solid rgba(167, 180, 201, 0.3)",
		},
		direction: "vertical",
		upgradeAsideStyle: {
			float: "left",
			paddingLeft: 10,
			width: "50%",
			minWidth: 200,
			display: "block",
		},
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

	componentWillMount() {
		this.checkSettlements();
		console.log(window.innerWidth);
		if (window.innerWidth <= 480) {
			let stepsStyle = { height: "100%", border: "none", width: "100%" };
			let upgradeAsideStyle = { width: "100%" };
			this.setState({
				stepsStyle: stepsStyle,
				direction: "horizontal",
				upgradeAsideStyle: upgradeAsideStyle,
			});
		}
		if (this.props.match.params.agent === ":agent") {
			this.setState({ role: "Agent" });
		} else if (this.props.match.params.agent === ":super_agent") {
			this.setState({ role: "Super agent" });
		} else {
			throw new Error("Unexpected role");
		}
	}

	hideModal = type => () => {
		this.setState({ showSettlements: false });
		this.checkSettlements();
	};

	showModal = type => () => {
		this.setState({ showSettlements: true });
	};

	moveNextStep = type => event => {
		let currentStep = this.state.currentStep;
		this.setState({ currentStep: ++currentStep });
		if (currentStep === steps.waitForApprovement) {
			sendUpgradeRequest(this.state.role);
		}
	};

	movePrevStep = type => () => {
		let currentStep = this.state.currentStep;
		this.setState({ currentStep: --currentStep });
	};

	checkPaymentHandler() {}

	getStepComponent(role) {
		if (this.state.currentStep === steps.settlements) {
			return (
				<div style={{ marginBottom: 30 }}>
					<Title level={4} style={StepTitleCss}>
						Fill settlement account.
					</Title>
					<p>
						To upgrade to the position of agent or super agent you should input your settlement
						account. This information will be used for automatically sending to the user that is
						going to make the deposit.
					</p>
					<Button type="primary" onClick={this.showModal()}>
						<Icon type="plus" /> Add new settlement account
					</Button>
				</div>
			);
		} else if (this.state.currentStep === steps.buyCache) {
			return (
				<div>
					<Title level={4} style={StepTitleCss}>
						Buy OnyxCache.
					</Title>
					<p>
						Please, buy OnyxCash amounting to <b>{role === "Agent" ? "500$" : "100 000$"}.</b>
					</p>
					<CoinPaymentsForm
						user={JSON.parse(sessionStorage.getItem("user"))}
						amount={role === "Agent" ? 500 : 100000}
						handleSubmit={this.moveNextStep()}
					/>
					<IPayForm amount={role === "Agent" ? 500 : 100000} handleSubmit={this.moveNextStep()} />
				</div>
			);
		} else if (this.state.currentStep === steps.waitForApprovement) {
			return (
				<div>
					<Title level={4} style={StepTitleCss}>
						Waiting for Approvement
					</Title>
					<p>
						You role will be upgraded automatically after receiving the paymant. Receiving the
						payment can take a wile up to 24 hours. If you role wasn't updated during 24 hours or
						you didn't receive OnyxCache please &nbsp;
						<a href="mailto:support@onyxpay.co">contact the support</a>.
					</p>
					<Button type="primary" onClick={this.movePrevStep()} style={{ marginRight: 10 }}>
						Back to payment page
					</Button>
					<Button onClick={this.checkPaymentHandler()} style={{ marginTop: 10 }}>
						Check payment status
					</Button>
				</div>
			);
		}
	}

	render() {
		console.log(this.state.direction);
		return (
			<>
				<PageTitle>Upgrade to the {this.state.role}</PageTitle>
				<Card>
					<section style={{ width: "100%" }}>
						<nav className="upgrade_navigation" style={this.state.stepsStyle}>
							<Steps direction={this.state.direction} size="small" current={this.state.currentStep}>
								<Step
									title={getStepTitle(0, this.state.currentStep)}
									description="Fill settlements account."
								/>
								<Step
									title={getStepTitle(0, this.state.currentStep)}
									description="Buy OnyxCache."
								/>
								<Step
									title={getStepTitle(0, this.state.currentStep)}
									description="Upgrading approvement."
								/>
							</Steps>
						</nav>
						<aside className="upgrade_step" style={this.state.upgradeAsideStyle}>
							{this.getStepComponent(this.state.role)}
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
