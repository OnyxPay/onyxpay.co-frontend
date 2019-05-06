import React, { Component } from "react";
import Tabs, { Tab, TabContent, TabsContainer, TabLabel, TabsNav } from "../../components/tabs";
import styled from "styled-components";
import { Typography, Select } from "antd";

const { Title } = Typography;
const Option = Select.Option;

const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
`;

const Card = styled.div`
	margin-top: 120px;
	margin-bottom: 30px;
	width: 850px;
	@media (max-width: 992px) {
		margin-top: 0;
		width: 100%;
	}
`;

const SelectContainer = styled.div`
	@media (min-width: 993px) {
		display: none;
	}
`;

const CardBody = styled.div`
	box-shadow: rgb(228, 228, 228) 0px 0px 10px;
	background: rgb(255, 255, 255);
	padding: 40px 60px;
`;

const UnlockTitle = styled.div`
	font-size: 16px;
	font-weight: bold;
	margin-top: 20px;
	@media (max-width: 992px) {
		margin-bottom: 15px;
	}
`;

class WalletUnlock extends Component {
	state = {
		value: 0,
	};

	handleTabChange = value => {
		this.setState({ value: Number(value) });
	};

	render() {
		const { value } = this.state;
		return (
			<Wrapper>
				<Card>
					<CardBody>
						<Title level={3} style={{ textAlign: "center" }}>
							Unlock Your Wallet
						</Title>

						<UnlockTitle>Select how you would like to unlock</UnlockTitle>

						<SelectContainer>
							<Select defaultValue="0" style={{ width: "100%" }} onChange={this.handleTabChange}>
								<Option value="0">Private key</Option>
								<Option value="1">Mnemonics phrase</Option>
								<Option value="2">Import wallet</Option>
							</Select>
						</SelectContainer>

						<TabsContainer>
							<TabsNav>
								<Tabs value={value} onChange={this.handleTabChange}>
									<Tab>
										<TabLabel>Private key</TabLabel>
									</Tab>
									<Tab>
										<TabLabel>Mnemonics phrase</TabLabel>
									</Tab>
									<Tab>
										<TabLabel>Import wallet</TabLabel>
									</Tab>
								</Tabs>
							</TabsNav>

							{value === 0 && (
								<TabContent>
									<div>
										Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots
										in a piece of classical Latin literature from 45 BC, making it over 2000 years
										old. Richard McClintock, a Latin professor at Hampden-Sydney College in
										Virginia, looked up one of the more obscure Latin words, consectetur, from a
										Lorem Ipsum passage, and going through the cites of the word in classical
										literature, discovered the undoubtable source. Lorem Ipsum comes from sections
										1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and
										Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of
										ethics, very popular during the Renaissance. The first line of Lorem Ipsum,
										"Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.
									</div>
								</TabContent>
							)}
							{value === 1 && (
								<TabContent>
									<div>
										<p>
											Why do we use it? It is a long established fact that a reader will be
											distracted by the readable content of a page when looking at its layout. The
											point of using Lorem Ipsum is that it has a more-or-less normal distribution
											of letters, as opposed to using 'Content here, content here', making it look
											like readable English. Many desktop publishing packages and web page editors
											now use Lorem Ipsum as their default model text, and a search for 'lorem
											ipsum' will uncover many web sites still in their infancy. Various versions
											have evolved over the years, sometimes by accident, sometimes on purpose
											(injected humour and the like).
										</p>
										<p>
											Why do we use it? It is a long established fact that a reader will be
											distracted by the readable content of a page when looking at its layout. The
											point of using Lorem Ipsum is that it has a more-or-less normal distribution
											of letters, as opposed to using 'Content here, content here', making it look
											like readable English. Many desktop publishing packages and web page editors
											now use Lorem Ipsum as their default model text, and a search for 'lorem
											ipsum' will uncover many web sites still in their infancy. Various versions
											have evolved over the years, sometimes by accident, sometimes on purpose
											(injected humour and the like).
										</p>
										<p>
											Why do we use it? It is a long established fact that a reader will be
											distracted by the readable content of a page when looking at its layout. The
											point of using Lorem Ipsum is that it has a more-or-less normal distribution
											of letters, as opposed to using 'Content here, content here', making it look
											like readable English. Many desktop publishing packages and web page editors
											now use Lorem Ipsum as their default model text, and a search for 'lorem
											ipsum' will uncover many web sites still in their infancy. Various versions
											have evolved over the years, sometimes by accident, sometimes on purpose
											(injected humour and the like).
										</p>
									</div>
								</TabContent>
							)}
							{value === 2 && (
								<TabContent>
									<div>Import wallet</div>
								</TabContent>
							)}
						</TabsContainer>
					</CardBody>
				</Card>
			</Wrapper>
		);
	}
}

export default WalletUnlock;
