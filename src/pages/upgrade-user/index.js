import React, { Component } from "react";
import { connect } from "react-redux";
import { Card, Typography, Steps, Button, Icon } from "antd";
import { PageTitle } from "../../components";
import Actions from "../../redux/actions";
import AddSettlementModal from "../../components/modals/AddSettlementModal";
import { CoinPaymentsForm } from "./CoinPaymentsForm";

const { Step } = Steps;
const { Title } = Typography;

const steps = {
	settlements: 0,
	buyCache: 1,
	waitForApprovement: 2,
};

const StepTitleCss = { textAlign: "left", borderBottom: "1px solid rgba(167, 180, 201, 0.3)" };
function getStepComponent(
	step,
	showSettlements,
	role,
	handleSubmit,
	backHandler,
	checkPaymentHandler
) {
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
					Please, buy OnyxCash amounting to <b>{role === "Agent" ? "500$" : "100 000$"}.</b>
				</p>
				<CoinPaymentsForm
					user={JSON.parse(sessionStorage.getItem("user"))}
					amount={role === "Agent" ? 500 : 100000}
					handleSubmit={handleSubmit}
				/>
			</div>
		);
	} else if (step === steps.waitForApprovement) {
		return (
			<div>
				<Title level={4} style={StepTitleCss}>
					Waiting for Approvement
				</Title>
				<p>
					You role will be upgraded automatically after receiving the paymant. Receiving the payment
					can take a wile up to 24 hours. If you role wasn't updated during 24 hours or you didn't
					receive OnyxCache please &nbsp;
					<a href="mailto:support@onyxpay.co">contact the support</a>.
				</p>
				<Button type="primary" onClick={backHandler} style={{ marginRight: 10 }}>
					Back to payment page
				</Button>
				<Button onClick={checkPaymentHandler} style={{ marginTop: 10 }}>
					Check payment status
				</Button>
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
		showTitle: true,
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
		if (window.innerWidth <= 480) {
			this.setState({ showTitle: false });
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
		event.preventDefault();
		event.target.parentElement.submit();
		let currentStep = this.state.currentStep;
		this.setState({ currentStep: ++currentStep });
	};

	movePrevStep = type => () => {
		let currentStep = this.state.currentStep;
		this.setState({ currentStep: --currentStep });
	};

	titles = ["Fill settlements account.", "Buy OnyxCache.", "Upgrading approvement."];
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
						<nav className="upgrade_navigation" style={{ float: "left", width: "25%" }}>
							<Steps direction="vertical" current={this.state.currentStep}>
								{this.titles.map((title, index) => {
									if (this.state.showTitle) {
										return (
											<Step
												key={index}
												title={getStepTitle(index, this.state.currentStep)}
												description={title}
											/>
										);
									} else {
										return <Step />;
									}
								})}
							</Steps>
						</nav>
						<aside className="upgrade_step" style={{ float: "right", width: "75%" }}>
							{getStepComponent(
								this.state.currentStep,
								this.showModal,
								role,
								this.moveNextStep(),
								this.movePrevStep()
							)}
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
