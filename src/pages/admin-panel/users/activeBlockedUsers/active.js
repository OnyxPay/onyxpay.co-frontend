import React, { Component } from "react";
import { Input } from "antd";

const Search = Input.Search;

class ActiveUsers extends Component {
	render() {
		return (
			<Search placeholder="input search text" onSearch={value => console.log(value)} enterButton />
		);
	}
}

export default ActiveUsers;
