import React, { Component } from "react";
import { connect } from "react-redux";
import { Typography, Button, message } from "antd";
import { push } from "connected-react-router";
import styled from "styled-components";
import Actions from "../../redux/actions";
import { UnderlayBg } from "../../components/styled";
import bgImg from "../../assets/img/bg/login.jpg";
import AddWallet from "./AddWallet";
import { unlockWalletAccount } from "../../api/wallet";
import ImportWalletModal from "../../components/modals/wallet/ImportWalletModal";
import CreateWalletModal from "../../components/modals/wallet/CreateWalletModal";
import RegistrationModal from "../../components/modals/Registration";

const { Title } = Typography;

const modals = {
	IMPORT_WALLET_MODAL: "IMPORT_WALLET_MODAL",
	CREATE_WALLET_MODAL: "CREATE_WALLET_MODAL",
	REGISTRATION_MODAL: "REGISTRATION_MODAL",
};

const LoginCard = styled.div`
	border: 1px solid #e8e8e8;
	padding: 24px;
	position: relative;
	background: #fff;
	border-radius: 2px;
	transition: all 0.3s;
	min-width: 300px;
	position: absolute;
	right: 10%;
	top: 50%;
	transform: translateY(-50%);
	@media (max-width: 992px) {
		right: 50%;
		transform: translate(50%, -50%);
	}
`;

class Login extends Component {
	state = {
		IMPORT_WALLET_MODAL: false,
		CREATE_WALLET_MODAL: false,
		REGISTRATION_MODAL: false,
	};

	openDashboard = () => {
		this.props.saveUser({ name: "Lucas", role: "user" });
		this.props.history.push("/");
	};

	hideModal = type => () => {
		this.setState({ [type]: false });
	};

	showModal = type => () => {
		this.setState({ [type]: true });
	};

	switchModal = to => () => {
		if (to === modals.CREATE_WALLET_MODAL) {
			this.hideModal(modals.IMPORT_WALLET_MODAL)();
			this.showModal(modals.CREATE_WALLET_MODAL)();
		} else {
			this.hideModal(modals.CREATE_WALLET_MODAL)();
			this.showModal(modals.IMPORT_WALLET_MODAL)();
		}
	};

	handleClearWallet = () => {
		const { clearWallet } = this.props;
		clearWallet();
		message.success("You successfully closed your wallet", 5);
	};

	handleLogin = async () => {
		const { push, login } = this.props;
		try {
			const { pk, publicKey, accountAddress } = await unlockWalletAccount();
			const res = await login(publicKey);

			if (res && res.error) {
				/* 
						network error
						not valid credentials
					*/
			}
		} catch (error) {
			console.log(error);
		}
	};

	render() {
		const { wallet } = this.props;
		return (
			<UnderlayBg img={bgImg}>
				<LoginCard>
					<Title
						level={2}
						style={{ textAlign: "center", marginBottom: 24, fontWeight: 400 }}
						type="secondary"
					>
						Welcome to OnyxPay{" "}
						<AddWallet
							showImportWalletModal={this.showModal(modals.IMPORT_WALLET_MODAL)}
							wallet={wallet}
							clearWallet={this.handleClearWallet}
						/>
					</Title>

					<Button
						block
						type="primary"
						style={{ marginBottom: 5 }}
						disabled={!wallet}
						onClick={this.handleLogin}
					>
						Login
					</Button>
					<Button
						block
						type="primary"
						style={{ marginBottom: 5 }}
						disabled={!wallet}
						onClick={this.showModal(modals.REGISTRATION_MODAL)}
					>
						Create account
					</Button>
					<Button block onClick={this.openDashboard} type="danger">
						Open Dashboard
					</Button>
					<ImportWalletModal
						isModalVisible={this.state.IMPORT_WALLET_MODAL}
						hideModal={this.hideModal(modals.IMPORT_WALLET_MODAL)}
						switchModal={this.switchModal(modals.CREATE_WALLET_MODAL)}
					/>
					<CreateWalletModal
						isModalVisible={this.state.CREATE_WALLET_MODAL}
						hideModal={this.hideModal(modals.CREATE_WALLET_MODAL)}
						switchModal={this.switchModal(modals.IMPORT_WALLET_MODAL)}
					/>
					<RegistrationModal
						isModalVisible={this.state.REGISTRATION_MODAL}
						hideModal={this.hideModal(modals.REGISTRATION_MODAL)}
					/>
				</LoginCard>
			</UnderlayBg>
		);
	}
}

export default connect(
	state => {
		return { wallet: state.wallet };
	},
	{
		saveUser: Actions.user.saveUser,
		clearWallet: Actions.wallet.clearWallet,
		unlockWallet: Actions.walletUnlock.showWalletUnlockModal,
		login: Actions.auth.login,
		push,
	}
)(Login);
