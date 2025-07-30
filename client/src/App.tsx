import React from 'react';
import { ConfigProvider } from 'antd';
import { Layout } from 'antd';
import SQLFlowApp from './components/SQLFlowApp';
import './App.css';

const { Header, Content } = Layout;

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
        },
      }}
    >
      <Layout className="app-layout">
        <Header className="app-header">
          <div className="header-content">
            <h1 className="app-title">SQLFlow - Data Lineage Visualizer</h1>
            <div className="header-subtitle">
              Analyze SQL queries and visualize data flow relationships
            </div>
          </div>
        </Header>
        <Content className="app-content">
          <SQLFlowApp />
        </Content>
      </Layout>
    </ConfigProvider>
  );
}

export default App;
