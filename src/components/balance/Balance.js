import React, { Component } from "react";
import { connect } from "react-redux";
import Actions from "../../redux/actions";

class Balance extends Component {
  componentDidMount() {
    const { getAssetsBalance, getOnyxCashBalance } = this.props;
    getAssetsBalance();
    getOnyxCashBalance();
  }

  render() {
    return <div>Assets:</div>;
  }
}

export default connect(
  null,
  {
    getAssetsBalance: Actions.balance.getAssetsBalance,
    getOnyxCashBalance: Actions.balance.getOnyxCashBalance
  }
)(Balance);
