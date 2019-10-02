import React, { Component } from "react";
import { connect } from "react-redux";
import { Modal, Select, Form, Button, Typography } from "antd";
import { getData as getCountriesData } from "country-list";
import { Formik } from "formik";
import PerformersTable from "./PerformersTable";
import { searchUsers } from "api/users";
import { sendMessage } from "api/operation-messages";
import { choosePerformer } from "api/requests";
import { showNotification } from "components/notification";
import { convertAmountToStr } from "utils/number";
import { handleBcError } from "api/network";
import { disableRequest } from "redux/requests";
import { roles } from "api/constants";
import { formatUserRole } from "utils";
const { Option } = Select;
const { Text } = Typography;

class ChoosePerformer extends Component {
	state = this.getInitialState();

	getInitialState() {
		return {
			loading: false,
			users: null,
			selectedRows: [],
			selectedRowKeys: [],
			pagination: { current: 1, pageSize: 20 },
			country: this.props.user && this.props.user.countryId,
		};
	}

	componentDidUpdate(prevProps, prevState) {
		const { isModalVisible, isSendingMessage } = this.props;

		if (isModalVisible && prevProps.isModalVisible !== isModalVisible && isSendingMessage) {
			this.fetchUsers();
		}
	}

	requestIsSentMessage(user) {
		return user && user.role === roles.a
			? "Request is successfully sent to super-agent/super-agents. Wait for the super-agent to confirm the request."
			: "Request is successfully sent to agent/agents. Wait for the agent to confirm the request.";
	}

	handleFormSubmit = async (values, formActions) => {
		const {
			requestId,
			isSendingMessage,
			fetchRequests,
			openedRequestData,
			disableRequest,
			user,
		} = this.props;
		const { selectedRows } = this.state;

		if (isSendingMessage) {
			const ids = [];
			selectedRows.forEach(row => {
				ids.push(row.user_id);
			});
			const res = await sendMessage(requestId, ids);
			if (!res.error) {
				formActions.resetForm();
				showNotification({
					type: "success",
					msg: this.getMessage(user),
				});
				fetchRequests();
				this.handleClose();
			}
		} else {
			try {
				const performer = selectedRows[0].receiver;
				await choosePerformer(requestId, performer.walletAddr);
				formActions.resetForm();
				disableRequest(requestId);
				if (openedRequestData.type === "withdraw") {
					showNotification({
						type: "success",
						msg: "You have successfully chosen the Agent",
						desc:
							"Next, you should wait until fiat money is coming, and then finalize the request by clicking on the 'Perform' button",
					});
				} else {
					let assetSymbol = openedRequestData.asset;
					const splittedAssetSymbol = openedRequestData.asset.split("");
					if (splittedAssetSymbol[0] === "o") {
						assetSymbol = splittedAssetSymbol.slice(1).join("");
					}

					if (assetSymbol === "OnyxCash") {
						assetSymbol = "USD";
					}

					const performerRole =
						openedRequestData.type === "deposit"
							? formatUserRole("agent")
							: formatUserRole("superagent");

					showNotification({
						type: "success",
						msg: `You have successfully chosen the ${performerRole}`,
						desc: `Send ${convertAmountToStr(
							openedRequestData.amount,
							8
						)} ${assetSymbol} or equivalent in FIAT to ${performerRole} ${performer.firstName} ${
							performer.lastName
						} settlement account or hand over the cash by hand`,
					});
				}
				this.handleClose();
			} catch (e) {
				handleBcError(e);
			} finally {
				formActions.setSubmitting(false);
			}
		}
	};

	handleTableChange = (pagination, filters, sorter) => {
		let sorOrder;
		const { country } = this.state;

		if (sorter.order === "ascend") {
			sorOrder = "asc";
		} else if (sorter.order === "descend") {
			sorOrder = "desc";
		}

		this.setState(
			{
				pagination: {
					...this.state.pagination,
					current: pagination.current,
					pageSize: pagination.pageSize,
				},
			},
			() => {
				const filtersCopy = { ...filters };
				for (const filter in filtersCopy) {
					if (filtersCopy[filter]) {
						filtersCopy[filter] = filtersCopy[filter][0];
					}
				}
				this.fetchUsers({
					...filtersCopy,
					sort_field: sorter.field,
					sort: sorOrder,
					country: country,
				});
			}
		);
	};

	handleSendAllAgents = async () => {
		const { fetchRequests, requestId, user } = this.props;
		const { country, pagination } = this.state;
		await this.fetchUsers({
			pageSize: pagination.total,
			pageNum: 1,
			country: country,
		});
		const { users } = this.state;
		const ids = [];
		users.items.forEach(user => {
			ids.push(user.user_id);
		});
		const res = await sendMessage(requestId, ids);
		if (!res.error) {
			showNotification({
				type: "success",
				msg: this.getMessage(user),
			});
			fetchRequests();
			this.handleClose();
		}
	};

	handleCountryChange = (setFieldValue, setSubmitting) => async countryId => {
		await this.fetchUsers({
			country: countryId,
		});
		// reset selected users
		this.setState({ selectedRowKeys: [], selectedRows: [], country: countryId });
		setFieldValue("country", countryId);
	};

	async fetchUsers(opts = {}) {
		const { performer, accountAddress, isSendingMessage, openedRequestData } = this.props;
		const { pagination, country } = this.state;
		try {
			const params = {
				pageSize: pagination.pageSize,
				pageNum: pagination.current,
				role: performer,
				country: country,
				status: "active",
				...opts,
			};

			this.setState({ loading: true });
			const res = await searchUsers(params);
			pagination.total = res.total;
			let performers;

			if (
				isSendingMessage &&
				openedRequestData.operationMessages &&
				openedRequestData.operationMessages.length
			) {
				// remove agents received message from the list
				performers = res.items.filter(el =>
					openedRequestData.operationMessages.find(
						item => el.walletAddr !== item.receiver.walletAddr
					)
				);
			} else {
				performers = res.items.filter(performer => performer.walletAddr !== accountAddress);
			}

			// TODO: pagination may be incorrect because of filtration, fix it!

			this.setState({
				loading: false,
				users: { items: performers, total: res.total },
				pagination,
			});
		} catch (e) {}
	}

	handleClose = () => {
		this.props.hideModal();
		this.setState(this.getInitialState());
	};

	onSelectedRow = (selectedRowKeys, selectedRows) => {
		this.setState({ selectedRowKeys, selectedRows });
	};

	render() {
		const {
			isModalVisible,
			user,
			operationMessages,
			isSendingMessage,
			showUserSettlementsModal,
		} = this.props;
		const { loading, users, selectedRowKeys } = this.state;

		let tipText, sendToAllPerformersBtnText;

		if (user && user.role === roles.c) {
			tipText =
				'This page allows you to select your preferred agent or agents together with the countries they are located in. Click on "Send to all agents" button to send the request to all agents, or select agents by hand with check-boxes and click on "Send request" button.';
			sendToAllPerformersBtnText = "Send to all agents";
		} else {
			tipText =
				'This page allows you to select your preferred super-agent or super-agents together with the countries they are located in. Click on "Send to all super-agents" button to send the request to all super-agents, or select super-agents by hand with check-boxes and click on "Send request" button.';
			sendToAllPerformersBtnText = "Send to all super-agents";
		}

		return (
			<Modal
				title={
					isSendingMessage ? "Send request to potential performer/ performers" : "Choose performer"
				}
				visible={isModalVisible}
				onCancel={this.handleClose}
				footer={null}
				destroyOnClose={true}
				className="choose-performer-modal"
			>
				{isSendingMessage && (
					<Text type="secondary" style={{ display: "block", marginBottom: 12 }}>
						{tipText}
					</Text>
				)}

				<Formik
					onSubmit={this.handleFormSubmit}
					initialValues={{ country: user ? user.countryId : "" }}
				>
					{({
						values,
						errors,
						isSubmitting,
						handleChange,
						handleBlur,
						handleSubmit,
						setFieldValue,
						touched,
						setSubmitting,
					}) => {
						return (
							<div>
								<form onSubmit={handleSubmit}>
									{isSendingMessage && (
										<Form.Item
											label="Country"
											validateStatus={errors.country && touched.country ? "error" : ""}
											help={errors.country && touched.country ? errors.country : ""}
										>
											<Select
												showSearch
												name="country"
												placeholder="Select a country"
												optionFilterProp="children"
												value={values.country}
												onChange={this.handleCountryChange(setFieldValue, setSubmitting)}
												filterOption={(input, option) =>
													option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
												}
												disabled={isSubmitting}
												loading={isSubmitting}
											>
												{getCountriesData().map((country, index) => {
													return (
														<Option key={country.code} value={country.code}>
															{country.name}
														</Option>
													);
												})}
											</Select>
										</Form.Item>
									)}

									<PerformersTable
										loading={loading}
										data={isSendingMessage ? users : operationMessages}
										onSelectedRowKeysChange={this.onSelectedRow}
										selectedRowKeys={selectedRowKeys}
										pagination={this.state.pagination}
										onChange={this.handleTableChange}
										isSendingMessage={isSendingMessage}
										showUserSettlementsModal={showUserSettlementsModal}
										requestId={this.props.requestId}
										key={this.state.country}
									/>
									<div className="ant-modal-custom-footer">
										<Button key="back" onClick={this.handleClose} style={{ marginRight: 10 }}>
											Cancel
										</Button>
										<Button
											type="primary"
											htmlType="submit"
											disabled={!selectedRowKeys.length || isSubmitting}
											loading={isSubmitting}
											style={{ marginRight: 10 }}
										>
											{isSendingMessage ? "Send request" : "Choose"}
										</Button>
										{isSendingMessage ? (
											<Button
												type="primary"
												key="allAgent"
												onClick={() => this.handleSendAllAgents()}
												className="send-to-all-performers-btn"
											>
												{sendToAllPerformersBtnText}
											</Button>
										) : null}
									</div>
								</form>
							</div>
						);
					}}
				</Formik>
			</Modal>
		);
	}
}

export default connect(
	state => {
		return {
			user: state.user,
			accountAddress: state.wallet.defaultAccountAddress,
		};
	},
	{ disableRequest }
)(ChoosePerformer);
