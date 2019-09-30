import React, { Component } from "react";
import { connect } from "react-redux";
import { Card, Typography, Steps, Button, Icon, Spin } from "antd";
import { PageTitle } from "components";
import Actions from "redux/actions";
import AddSettlementModal from "components/modals/AddSettlementModal";
import { CoinPaymentsForm } from "./CoinPaymentsForm";
import { sendUpgradeRequest } from "api/upgrade";
import { UpgradeRequestStatus, roleByCode, roles } from "api/constants";
import { showNotification } from "components/notification";

const { Step } = Steps;
const { Title } = Typography;

const steps = {
	settlements: 0,
	buyCache: 1,
	waitForApprovement: 2,
	refused: 3,
	success: 4,
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
	if (role === roles.a) {
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
		this.checkUpgradeRequests();

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

	checkUpgradeRequests() {
		this.props.getUserUpgradeRequest().then(
			data => {
				if (data && data.upgradeRequest) {
					if (
						data.upgradeRequest.status === UpgradeRequestStatus.Completed ||
						data.upgradeRequest.status === UpgradeRequestStatus.Refused
					) {
						this.setState({ currentStep: steps.finished });
					} else if (data.upgradeRequest.status === UpgradeRequestStatus.Opened) {
						showNotification({
							desc: (
								<>
									You have openned request to the&nbsp;
									{roleByCode[data.upgradeRequest.expectedPosition]}
									&nbsp; position. You can not create several requests. For removing existing
									request
									<br />
									Please,&nbsp;
									<a href="mailto:support@onyxpay.co">contact the support</a>
								</>
							),
						});
						this.setState({ currentStep: steps.waitForApprovement });
					}
				}
				this.setState({ showSpin: false });
			},
			err => {
				console.error(err.errors);
				showNotification({
					type: "error",
					msg:
						"There is an error occurred while receiving upgrade requests. Details:" +
						JSON.stringify(err.errors),
				});
				this.setState({ showSpin: false });
			}
		);
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
			this.checkUpgradeRequests();
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
		const paymentAmount = role === roles.a ? 800 : 100000;
		if (this.props.upgradeRequest && this.state.currentStep === steps.waitForApprovement) {
			if (this.props.upgradeRequest.status === UpgradeRequestStatus.Completed) {
				this.setState({ currentStep: steps.success });
			} else if (this.props.upgradeRequest.status === UpgradeRequestStatus.Refused) {
				this.setState({ currentStep: steps.refused });
			}
		}
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
						Purchase OnyxCash
					</Title>
					<p>
						Please purchase {role === roles.a ? "500 OnyxCash for" : "an amount of OnyxCash equal to"}{" "}
						<b>{role === roles.a ? "800" : "100 000"}</b> U.S. dollar in order to be upgraded to the{" "}
						{getTitleRoleByRole(role)} role.
					</p>
					<CoinPaymentsForm
						user={this.props.user}
						amount={paymentAmount}
						handleSubmit={this.moveNextStep()}
					/>
				</div>
			);
		} else if (this.state.currentStep === steps.success) {
			return (
				<div>
					<Title level={4} style={StepTitleCss}>
						Upgrade result
					</Title>
					<p>
						You was upgraded successfully. Please, click "Ok" button to start working in the new
						role.
					</p>
					<Button
						type="primary"
						onClick={() => {
							this.props.histor.push(`/`);
						}}
						style={{ marginRight: 10, width: 170 }}
					>
						Ok
					</Button>
					<h4 style={{ color: "#1890ff" }}>{this.state.upgradeStatus}</h4>
				</div>
			);
		} else if (this.state.currentStep === steps.refused) {
			return (
				<div>
					<Title level={4} style={StepTitleCss}>
						Upgrade failed
					</Title>
					<p>
						You request was refused by the administrator with reason:&nbsp;
						<b>{this.props.upgradeRequest.reason}.</b>&nbsp;To receive more information{" "}
						<a href="mailto:support@onyxpay.co">contact the support</a>.
					</p>
					<Button
						type="primary"
						onClick={() => {
							this.props.history.push(`/`);
						}}
						style={{ marginRight: 10, width: 170 }}
					>
						Ok
					</Button>
					<h4 style={{ color: "#1890ff" }}>{this.state.upgradeStatus}</h4>
				</div>
			);
		} else {
			return (
				<div>
					<Title level={4} style={StepTitleCss}>
						Upgrade Approval
					</Title>
					<p>
						You role will be upgraded automatically after receiving the payment. Receiving the
						payment can take a while up to 24 hours. If you role wasn't updated during 24 hours or
						you didn't receive OnyxCash please &nbsp;
						<a href="mailto:support@onyxpay.co">contact the support</a>.
					</p>
					<Button
						type="primary"
						onClick={this.movePrevStep()}
						style={{ marginRight: 10, width: 170 }}
					>
						Back to the payment
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
							<Step
								title={getStepTitle(1, this.state.currentStep)}
								description="Purchase OnyxCash."
							/>
							<Step
								title={getStepTitle(2, this.state.currentStep)}
								description="Upgrade Approval."
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
			upgradeRequest: state.upgradeRequest,
		};
	},
	{
		getSettlementsList: Actions.settlements.getSettlementsList,
		getUserData: Actions.user.getUserData,
		getUserUpgradeRequest: Actions.upgradeRequest.getUserUpgradeRequest,
		logOut: Actions.auth.logOut,
	}
)(UpgradeUser);
