import React, { Component } from "react";
import { Typography, Card, Button, Input, Row, Col, Form, List, Avatar, Skeleton } from "antd";
import { PageTitle } from "../../components";
import * as axios from "axios";
import { Formik } from "formik";
import { BackendUrl } from "../../api/constants";

const { Title } = Typography;
const { TextArea } = Input;

class Settlement extends Component {
	state = {
		initLoading: true,
		loading: false,
		listData: [],
	};

	componentDidMount() {
		const headers = {
			authorization:
				"bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczpcL1wvcHJlcHJvZC5vbnl4cGF5LmNvXC9hcGlcL3YxXC9sb2dpbiIsImlhdCI6MTU1Nzk0MTE0NiwiZXhwIjoxNTU3OTQ0NzQ2LCJuYmYiOjE1NTc5NDExNDYsImp0aSI6Ild4alNjRGx6SUpBeWhua2oiLCJzdWIiOjEsInBydiI6IjQzZDY4YjU4M2JhNTMwN2Y5ZWUyY2RkZTE0ZDBiYThlZmVjN2M1MTcifQ.qW5fG-D-K2gPDvK4Gr3SiuQzkiwU35YOzbjInDePMpA",
		};

		// let formData = new FormData();
		// formData.append("first_name", "first_name");
		// formData.append("last_name", "last_name");
		// formData.append("wallet_addr", "wallet_addr");
		// formData.append("public_key", "public_key");
		// formData.append("country_id", 1324567890);
		// axios.post(`${BackendUrl}/api/v1/login`, formData).then(res => {
		// 	console.log("/api/v1/sign-up ", res);
		// });

		// ------------- GET
		axios.get(`${BackendUrl}/api/v1/settlements`, { headers }).then(res => {
			console.log("GET Settlements ", res.data.data);

			this.setState({
				initLoading: false,
				listData: res.data.data,
			});
		});

		// ------------- ADD
		// let formData = new FormData();
		// formData.append("account_number", "250");
		// formData.append("account_name", "account_name");
		// formData.append("description", "description");
		// formData.append("brief_notes", "brief_notes");
		// axios
		// 	.post(`${BackendUrl}/api/v1/settlements`, formData, {
		// 		headers: headers,
		// 	})
		// 	.then(res => {
		// 		console.log("/api/v1/settlements ", res.data);
		// 	});

		// ------------- DELETE
		// axios
		// 	.delete(`${BackendUrl}/api/v1/settlements/1`, {
		// 		headers: headers,
		// 	})
		// 	.then(res => {
		// 		console.log("DELETE ", res.data);
		// 	});
	}

	handleFormSubmit = (values, { resetForm }) => {
		console.log("sending", values);
		resetForm();
	};

	render() {
		const { initLoading, listData } = this.state;

		return (
			<>
				<PageTitle>Settlement Accounts</PageTitle>
				<Card>
					<Row gutter={10}>
						<Col md={24} lg={11}>
							<h2>Add new Settlemt</h2>
							<Formik
								onSubmit={this.handleFormSubmit}
								initialValues={{
									account_number: "",
									account_name: "",
									description: "",
									brief_notes: "",
								}}
								validate={values => {
									let errors = {};
									if (!values.account_number) {
										errors.account_number = "required";
									}
									if (!values.account_name) {
										errors.account_name = "required";
									}
									if (!values.description) {
										errors.description = "required";
									}
									if (!values.brief_notes) {
										errors.brief_notes = "required";
									}
									return errors;
								}}
							>
								{({ values, errors, isSubmitting, handleChange, handleBlur, handleSubmit }) => {
									return (
										<form onSubmit={handleSubmit}>
											<Form.Item
												validateStatus={errors.account_number ? "error" : ""}
												help={errors.account_number ? errors.account_number : ""}
												required
											>
												<Input
													size="large"
													name="account_number"
													placeholder="Account number"
													value={values.account_number}
													onChange={handleChange}
													onBlur={handleBlur}
													disabled={isSubmitting}
												/>
											</Form.Item>

											<Form.Item
												validateStatus={errors.account_name ? "error" : ""}
												help={errors.account_name ? errors.account_name : ""}
												required
											>
												<Input
													size="large"
													name="account_name"
													placeholder="Account name"
													value={values.account_name}
													onChange={handleChange}
													onBlur={handleBlur}
													disabled={isSubmitting}
												/>
											</Form.Item>

											<Form.Item
												validateStatus={errors.description ? "error" : ""}
												help={errors.description ? errors.description : ""}
												required
											>
												<TextArea
													rows={4}
													name="description"
													placeholder="Description"
													value={values.description}
													onChange={handleChange}
												/>
											</Form.Item>

											<Form.Item
												validateStatus={errors.brief_notes ? "error" : ""}
												help={errors.brief_notes ? errors.brief_notes : ""}
												required
											>
												<Input
													size="large"
													name="brief_notes"
													placeholder="Brief notes"
													value={values.brief_notes}
													onChange={handleChange}
													onBlur={handleBlur}
													disabled={isSubmitting}
												/>
											</Form.Item>

											<Button type="primary" htmlType="submit" disabled={isSubmitting}>
												Submit
											</Button>
										</form>
									);
								}}
							</Formik>
						</Col>
						<Col md={24} lg={11}>
							<h2>Settlemts list</h2>
							<List
								className="demo-loadmore-list"
								loading={initLoading}
								itemLayout="horizontal"
								dataSource={listData}
								renderItem={item => (
									<List.Item actions={[<a>edit</a>, <a>delete</a>]}>
										<Skeleton avatar title={false} loading={item.loading} active>
											{/* {console.log(item[Object.keys(item)[0]].accountName)} */}

											<List.Item.Meta description={item.description} />
											<div>
												id - {item.id} <br />
												briefNotes - {item.briefNotes}
												<br />
												accountNumber - {item.accountNumber}
												<br />
												accountName - {item.accountName}
												<br />
											</div>
										</Skeleton>
									</List.Item>
								)}
							/>
						</Col>
					</Row>
				</Card>
			</>
		);
	}
}

export default Settlement;

// Registration (url: /api/v1/sign-up, method: POST)
// Get settlement accounts (url: /api/v1/settlements, method: GET)
// Store settlement account (url: /api/v1/settlements, method: POST)
// Remove settlement account (url: /api/v1/settlements/{id}, method: DELETE)

// Store settlement account (url: /api/v1/settlements, method: POST)
// Request-headers:

// jwt token
// Request:

// account_number (validation:[required, unique], type: string)
// description (validation:[required], type: string)
// account_name (validation:[required], type: string)
// brief_notes (validation:[required], type: string)
