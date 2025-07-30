import React, { useState, useCallback, useRef } from 'react';
import { Button, Select, Upload, message, Spin, Typography } from 'antd';
import { 
  PlayCircleOutlined, 
  UploadOutlined, 
  ClearOutlined,
  DownloadOutlined,
  FileTextOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import SQLEditor from './SQLEditor';
import FlowVisualization from './FlowVisualization';
import { parseSQL, uploadSQLFile, getDatabaseTypes } from '../services/api';
import { FlowData, DatabaseType } from '../types';

const { Option } = Select;
const { Text } = Typography;

const SAMPLE_QUERIES = {
  basic: `-- Basic SELECT with JOIN
SELECT u.id, u.name, o.order_date, o.total
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE o.order_date >= '2023-01-01';`,
  
  complex: `-- Complex query with subquery and CTE
WITH recent_orders AS (
  SELECT user_id, COUNT(*) as order_count, AVG(total) as avg_total
  FROM orders 
  WHERE order_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
  GROUP BY user_id
)
SELECT 
  u.name,
  u.email,
  ro.order_count,
  ro.avg_total,
  p.product_name
FROM users u
JOIN recent_orders ro ON u.id = ro.user_id
JOIN order_items oi ON u.id = oi.user_id
JOIN products p ON oi.product_id = p.id
WHERE ro.order_count > 2;`,
  
  insert: `-- INSERT with SELECT
INSERT INTO user_summary (user_id, total_orders, total_spent)
SELECT 
  u.id,
  COUNT(o.id) as total_orders,
  SUM(o.total) as total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id;`,
  
  view: `-- CREATE VIEW
CREATE VIEW active_customers AS
SELECT 
  u.id,
  u.name,
  u.email,
  COUNT(o.id) as order_count,
  SUM(o.total) as lifetime_value
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE o.order_date >= DATE_SUB(NOW(), INTERVAL 365 DAY)
GROUP BY u.id, u.name, u.email
HAVING order_count >= 3;`
};

const SQLFlowApp: React.FC = () => {
  const [sqlContent, setSqlContent] = useState<string>(SAMPLE_QUERIES.basic);
  const [dbType, setDbType] = useState<string>('mysql');
  const [flowData, setFlowData] = useState<FlowData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [databaseTypes, setDatabaseTypes] = useState<DatabaseType[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    loadDatabaseTypes();
  }, []);

  const loadDatabaseTypes = async () => {
    try {
      const types = await getDatabaseTypes();
      setDatabaseTypes(types);
    } catch (err) {
      console.error('Failed to load database types:', err);
    }
  };

  const handleParseSQL = useCallback(async () => {
    if (!sqlContent.trim()) {
      message.warning('Please enter SQL query');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await parseSQL(sqlContent, dbType);
      setFlowData(result);
      message.success('SQL parsed successfully');
    } catch (err: any) {
      const errorMessage = err.response?.data?.details || err.message || 'Failed to parse SQL';
      setError(errorMessage);
      message.error('Failed to parse SQL');
    } finally {
      setLoading(false);
    }
  }, [sqlContent, dbType]);

  const handleFileUpload = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);

    try {
      const result = await uploadSQLFile(file, dbType);
      setFlowData(result);
      setSqlContent(await file.text());
      message.success(`File "${file.name}" uploaded and parsed successfully`);
    } catch (err: any) {
      const errorMessage = err.response?.data?.details || err.message || 'Failed to upload file';
      setError(errorMessage);
      message.error('Failed to upload file');
    } finally {
      setLoading(false);
    }

    return false; // Prevent default upload behavior
  }, [dbType]);

  const handleSampleQuery = useCallback((key: keyof typeof SAMPLE_QUERIES) => {
    setSqlContent(SAMPLE_QUERIES[key]);
    setFlowData(null);
    setError(null);
  }, []);

  const handleClear = useCallback(() => {
    setSqlContent('');
    setFlowData(null);
    setError(null);
  }, []);

  const handleExportDiagram = useCallback(() => {
    if (!flowData) {
      message.warning('No diagram to export');
      return;
    }

    const dataStr = JSON.stringify(flowData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sqlflow-diagram.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    message.success('Diagram exported successfully');
  }, [flowData]);

  return (
    <div className="sqlflow-container">
      <div className="sqlflow-header">
        <div className="sqlflow-controls">
          <Select
            value={dbType}
            onChange={setDbType}
            placeholder="Select Database"
            style={{ width: 160 }}
          >
            {databaseTypes.map(type => (
              <Option key={type.value} value={type.value}>
                {type.label}
              </Option>
            ))}
          </Select>

          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={handleParseSQL}
            loading={loading}
            disabled={!sqlContent.trim()}
          >
            Analyze SQL
          </Button>

          <Upload
            accept=".sql,.txt"
            showUploadList={false}
            beforeUpload={handleFileUpload}
            disabled={loading}
          >
            <Button icon={<UploadOutlined />} disabled={loading}>
              Upload SQL File
            </Button>
          </Upload>

          <Button
            icon={<ClearOutlined />}
            onClick={handleClear}
            disabled={loading}
          >
            Clear
          </Button>

          <Button
            icon={<DownloadOutlined />}
            onClick={handleExportDiagram}
            disabled={!flowData || loading}
          >
            Export
          </Button>
        </div>

        <div className="sample-sql-buttons">
          <Text type="secondary" style={{ marginRight: 8 }}>Sample queries:</Text>
          <Button
            size="small"
            className="sample-sql-button"
            onClick={() => handleSampleQuery('basic')}
          >
            Basic JOIN
          </Button>
          <Button
            size="small"
            className="sample-sql-button"
            onClick={() => handleSampleQuery('complex')}
          >
            Complex CTE
          </Button>
          <Button
            size="small"
            className="sample-sql-button"
            onClick={() => handleSampleQuery('insert')}
          >
            INSERT SELECT
          </Button>
          <Button
            size="small"
            className="sample-sql-button"
            onClick={() => handleSampleQuery('view')}
          >
            CREATE VIEW
          </Button>
        </div>
      </div>

      <div className="sqlflow-content">
        <div className="sql-editor-panel">
          <div className="sql-editor-header">
            <Text strong>
              <FileTextOutlined style={{ marginRight: 8 }} />
              SQL Query Editor
            </Text>
            <Text type="secondary">
              {sqlContent.split('\n').length} lines
            </Text>
          </div>
          <div className="sql-editor-content">
            <SQLEditor
              value={sqlContent}
              onChange={setSqlContent}
              language={dbType === 'postgresql' ? 'pgsql' : 'mysql'}
              readOnly={loading}
            />
          </div>
        </div>

        <div className="visualization-panel">
          <div className="visualization-header">
            <Text strong>
              <DatabaseOutlined style={{ marginRight: 8 }} />
              Data Flow Visualization
            </Text>
            {flowData && (
              <Text type="secondary">
                {flowData.summary.totalTables} tables, {flowData.summary.totalRelationships} relationships
              </Text>
            )}
          </div>
          <div className="visualization-content">
            {loading ? (
              <div className="visualization-loading">
                <Spin size="large" />
                <Text style={{ marginTop: 16 }}>Analyzing SQL query...</Text>
              </div>
            ) : error ? (
              <div className="error-display">
                <div className="error-title">SQL Analysis Error</div>
                <div>Please check your SQL syntax and try again.</div>
                <div className="error-details">{error}</div>
              </div>
            ) : flowData ? (
              <FlowVisualization data={flowData} />
            ) : (
              <div className="visualization-empty">
                <DatabaseOutlined />
                <Text>Enter SQL query and click "Analyze SQL" to see data flow diagram</Text>
              </div>
            )}
          </div>
        </div>
      </div>

      {flowData && (
        <div className="summary-panel">
          <div className="summary-stats">
            <div className="summary-stat">
              <span className="summary-stat-value">{flowData.summary.totalTables}</span>
              <span className="summary-stat-label">Tables</span>
            </div>
            <div className="summary-stat">
              <span className="summary-stat-value">{flowData.summary.totalRelationships}</span>
              <span className="summary-stat-label">Relationships</span>
            </div>
            <div className="summary-stat">
              <span className="summary-stat-value">{flowData.nodes.length}</span>
              <span className="summary-stat-label">Total Nodes</span>
            </div>
            <div className="summary-stat">
              <span className="summary-stat-value">{flowData.edges.length}</span>
              <span className="summary-stat-label">Total Edges</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SQLFlowApp;