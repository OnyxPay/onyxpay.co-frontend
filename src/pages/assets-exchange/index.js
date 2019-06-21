import React, { Component } from "react";
import { connect } from "react-redux";
import { Row, Col, Card, Form, Icon, Input, Button, Select } from "antd";
import Actions from "../../redux/actions";
import { PageTitle } from "../../components";
const { Option } = Select;

class AssetsExchange extends Component {
	render() {
		return (
			<>
				<PageTitle>Assets Exchange</PageTitle>
				<Card>
					<Row gutter={48}>
						<Form layout="inline" onSubmit={this.handleSubmit}>
							<Col md={{ span: 24 }} lg={{ span: 10, offset: 0 }}>
								<Form.Item>
									<Input
										prefix={<Icon type="logout" style={{ color: "rgba(0,0,0,.25)" }} />}
										type="number"
										placeholder="You send"
									/>
								</Form.Item>
								<Form.Item>
									<Select defaultValue="oUSD">
										<Option value="oUSD">oUSD</Option>
										<Option value="oEUR">oEUR</Option>
									</Select>
								</Form.Item>
							</Col>

							<Col md={{ span: 24 }} lg={{ span: 4, offset: 0 }}>
								<Form.Item>
									<Button type="primary" htmlType="submit">
										Exchange
									</Button>
								</Form.Item>
							</Col>

							<Col md={{ span: 24 }} lg={{ span: 10, offset: 0 }}>
								<Form.Item>
									<Input
										prefix={<Icon type="login" style={{ color: "rgba(0,0,0,.25)" }} />}
										type="number"
										step={0.1}
										min={0}
										placeholder="You get"
									/>
								</Form.Item>
								<Form.Item>
									<Select defaultValue="oUSD">
										<Option value="oUSD">oUSD</Option>
										<Option value="oEUR">oEUR</Option>
									</Select>
								</Form.Item>
							</Col>
						</Form>
					</Row>
					<Row>
						<Col md={24} lg={12}>
							sell table
						</Col>
						<Col md={24} lg={12}>
							buy table
						</Col>
					</Row>
				</Card>
			</>
		);
	}
}

export default connect(
	state => {
		return {
			user: state.user,
			exchangeRates: state.assets.rates,
			wallet: state.wallet,
		};
	},
	{
		getExchangeRates: Actions.assets.getExchangeRates,
	}
)(AssetsExchange);
