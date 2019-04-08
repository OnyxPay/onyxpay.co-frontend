import React from "react";
import styled from "styled-components";
import logoPic from "../../assets/icons/logo.png";
import { Link } from "react-router-dom";
import { Icon } from "antd";

const Header = styled.header`
  height: 58px;
  background-color: #fff;
  background: linear-gradient(120deg, #000109 40%, #cb253e 100%);
  position: fixed;
  width: 100%;
  z-index: 100;
  padding: 5px 15px;
  align-items: center;
  display: flex;
  flex: 0 0 auto;
  z-index: 100;
  .trigger {
    font-size: 18px;
    padding: 0 24px;
    cursor: pointer;
    color: #fff;
    transition: color 0.3s;
    margin-left: 15px;
    svg {
      width: 20px;
      height: 20px;
    }
  }
`;

const Logo = styled.img`
  height: 2.5rem;
  line-height: 2rem;
`;

export const HeaderComponent = ({ toggleSidebar, isSidebarCollapsed }) => {
  return (
    <Header>
      <Link to="/">
        <Logo src={logoPic} />
      </Link>
      <Icon className="trigger" type={isSidebarCollapsed ? "menu-unfold" : "menu-fold"} onClick={toggleSidebar} />
    </Header>
  );
};
