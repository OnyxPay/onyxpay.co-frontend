import React, { Component } from "react";
import { connect } from "react-redux";
import { Card, Typography, Steps, Button, Icon, Spin, message } from "antd";
import { PageTitle } from "../../components";
import Actions from "../../redux/actions";
import AddSettlementModal from "../../components/modals/AddSettlementModal";
import { CoinPaymentsForm } from "./CoinPaymentsForm";
import { IPayForm } from "./IPayForm";
import { sendUpgradeRequest, getUpgradeRequest } from "../../api/upgrade";

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
function getTitleRoleByRole(role) {
	if (role === "agent") {
		return "Agent";
	}
	return "Super agent";
}

class UpgradeUser extends Component {
	state = {
		currentStep: steps.settlements,
		showSettlements: false,
		direction: "vertical",
		showSpin: true,
	};

	constructor(props) {
		super(props);
		this.updateUserDataState().then(data => {
			if (data) {
				this.userRoleCode = data.roleCode;
			}
		});
		this.checkSettlements();

		getUpgradeRequest().then(
			data => {
				if (data.data) {
					this.setState({ currentStep: steps.waitForApprovement });
				}
				this.setState({ showSpin: false });
			},
			err => {
				if (err.response.status !== 404) {
					console.error(err.errors);
					message.error(
						"There is an error occurred while receiving upgrade requests. Details:" +
							JSON.stringify(err.errors)
					);
				}
				this.setState({ showSpin: false });
			}
		);

		window.matchMedia("(max-width: 570px)").addListener(() => {
			this.setState({ direction: "horizontal" });
		});

		window.matchMedia("(min-width: 575px)").addListener(() => {
			this.setState({ direction: "vertical" });
		});
	}

	static getDerivedStateFromProps(props, currentState) {
		let role = props.match.params.role.substr(1).replace("_", "");
		return {
			value: props.value,
			role: role,
		};
	}

	checkSettlements() {
		this.props.getSettlementsList().then(
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

	async updateUserDataState() {
		const user = await this.props.getUserData();
		this.setState({ user: user.user });
		return user.user;
	}

	checkPaymentHandler = async () => {
		const user = await this.props.getUserData();
		let userRoleCode = user.user.roleCode;
		if (userRoleCode !== this.userRoleCode) {
			this.setState({
				upgradeStatus:
					"Your status was upgraded successfully, you will be logging out in 3 seconds.",
			});
			setTimeout(this.props.logOut, 3000);
		} else {
			this.setState({ upgradeStatus: "Your role have not changed please check in a while" });
			setTimeout(() => {
				this.setState({ upgradeStatus: "" });
			}, 3000);
		}
	};

	getStepComponent(role) {
		const paymentAmount = role === "agent" ? 500 : 100000;
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
						Please, buy OnyxCash amounting to <b>{role === "agent" ? "500$" : "100 000$"}.</b>
					</p>
					<CoinPaymentsForm
						user={this.props.user}
						amount={paymentAmount}
						handleSubmit={this.moveNextStep()}
					/>
					<IPayForm amount={paymentAmount} handleSubmit={this.moveNextStep()} />
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
					<Button
						type="primary"
						onClick={this.movePrevStep()}
						style={{ marginRight: 10, width: 170 }}
					>
						Back to payment page
					</Button>
					<Button onClick={this.checkPaymentHandler} style={{ marginTop: 10, width: 170 }}>
						Check payment status
					</Button>
					<h4 style={{ color: "#1890ff" }}>{this.state.upgradeStatus}</h4>
				</div>
			);
		}
	}
	getCardContent() {
		if (this.state.showSpin) {
			return (
				<center>
					<Spin />
				</center>
			);
		} else {
			return (
				<section>
					<nav className="upgrade_navigation">
						<Steps direction={this.state.direction} size="small" current={this.state.currentStep}>
							<Step
								title={getStepTitle(0, this.state.currentStep)}
								description="Fill settlements account."
							/>
							<Step title={getStepTitle(1, this.state.currentStep)} description="Buy OnyxCache." />
							<Step
								title={getStepTitle(2, this.state.currentStep)}
								description="Upgrading approvement."
							/>
						</Steps>
					</nav>
					<aside className="upgrade_step">{this.getStepComponent(this.state.role)}</aside>
				</section>
			);
		}
	}
	render() {
		return (
			<>
				<PageTitle>Upgrade to the {getTitleRoleByRole(this.state.role)}</PageTitle>
				<Card> {this.getCardContent()} </Card>
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
		getUserData: Actions.user.getUserData,
		logOut: Actions.auth.logOut,
	}
)(UpgradeUser);
