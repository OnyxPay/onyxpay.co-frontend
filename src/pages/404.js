import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { Button } from "antd";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 100%;
`;

const Title = styled.h1`
  color: #1890ff;
  font-weight: 500;
  font-size: 120px;
  line-height: 120px;
  margin-bottom: 0;
`;

const Text = styled.div`
  font-size: 30px;
  margin-bottom: 15px;
`;

export const Page404 = () => {
  return (
    <Wrapper>
      <Title>404</Title>
      <Text>Page not found</Text>
      <Button type="primary" size="large">
        <Link to="/">Home</Link>
      </Button>
    </Wrapper>
  );
};
