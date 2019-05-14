import React, { Component } from "react";
import { connect } from "react-redux";
import Actions from "../../redux/actions";
import { UnderlayBg } from "../../components/styled";
import bgImg from "../../assets/img/bg/login.jpg";
import styled from "styled-components";
import { Typography, Button } from "antd";
import { Link } from "react-router-dom";
import AddWallet from "./AddWallet";
import ImportWalletModal from "../../components/modals/wallet/ImportWalletModal";
import CreateWalletModal from "../../components/modals/wallet/CreateWalletModal";

const { Title } = Typography;

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
		isImportWalletModalVisible: false,
		isCreateWalletModalVisible: false,
	};

	openDashboard = () => {
		this.props.saveUser({ name: "Lucas", role: "user" });
		this.props.history.push("/");
	};

	hideImportWalletModal = () => {
		this.setState({ isImportWalletModalVisible: false });
	};

	showImportWalletModal = () => {
		this.setState({ isImportWalletModalVisible: true });
	};

	hideCreateWalletModal = () => {
		this.setState({ isCreateWalletModalVisible: false });
	};

	showCreateWalletModal = () => {
		this.setState({ isCreateWalletModalVisible: true });
	};

	switchModal = to => () => {
		if (to === "CreateWalletModal") {
			this.hideImportWalletModal();
			this.showCreateWalletModal();
		} else {
			this.hideCreateWalletModal();
			this.showImportWalletModal();
		}
	};

	render() {
		const { isImportWalletModalVisible, isCreateWalletModalVisible } = this.state;

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
							showImportWalletModal={this.showImportWalletModal}
							showCreateWalletModal={this.showCreateWalletModal}
						/>
					</Title>

					<Button block type="primary" style={{ marginBottom: 5 }} disabled>
						<Link to={{ pathname: "/wallet-unlock", state: { from: "login" } }}>Login</Link>
					</Button>
					<Button block type="primary" style={{ marginBottom: 5 }} disabled>
						<Link to={{ pathname: "/wallet-create", state: { from: "create_account" } }}>
							Create account
						</Link>
					</Button>
					<Button block onClick={this.openDashboard} type="danger">
						Open Dashboard
					</Button>
					<ImportWalletModal
						isModalVisible={isImportWalletModalVisible}
						hideModal={this.hideImportWalletModal}
						switchModal={this.switchModal("CreateWalletModal")}
					/>
					<CreateWalletModal
						isModalVisible={isCreateWalletModalVisible}
						hideModal={this.hideCreateWalletModal}
						switchModal={this.switchModal("ImportWalletModal")}
					/>
				</LoginCard>
			</UnderlayBg>
		);
	}
}

export default connect(
	null,
	{ saveUser: Actions.user.saveUser }
)(Login);
