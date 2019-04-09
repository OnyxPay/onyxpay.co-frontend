import React, { Component } from "react";
import { connect } from "react-redux";
import Actions from "../../redux/actions";

class Balance extends Component {
  componentDidMount() {
    const { getAssetsBalance } = this.props;
    // getAssetsBalance("AdnhncNBiFYTHYJLqrEa59jVJBkGm7w6iZ");
    getAssetsBalance("f17af3cf26d901702d42ecf09c13e273e198fded");
  }

  render() {
    return <div>Assets:</div>;
  }
}

export default connect(
  null,
  { getAssetsBalance: Actions.balance.getAssetsBalance }
)(Balance);
