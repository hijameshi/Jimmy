// Database types
export interface DatabaseType {
  value: string;
  label: string;
}

// Node types for data flow visualization
export interface FlowNode {
  data: {
    id: string;
    label: string;
    type: 'table' | 'view' | 'source' | 'target' | 'column';
    nodeType: 'table' | 'column';
    columns?: Column[];
    parent?: string;
  };
}

// Edge types for relationships
export interface FlowEdge {
  data: {
    id: string;
    source: string;
    target: string;
    label: string;
    type: 'join' | 'insert' | 'view_dependency' | 'foreign_key' | 'update' | 'delete';
  };
}

// Column information
export interface Column {
  id: number;
  name: string;
  type: string;
}

// Table information
export interface Table {
  id: number;
  name: string;
  type: 'table' | 'view' | 'source' | 'target';
  columns: Column[];
}

// Relationship information
export interface Relationship {
  id: number;
  source: string;
  target: string;
  type: string;
}

// Summary statistics
export interface FlowSummary {
  totalTables: number;
  totalRelationships: number;
  tableTypes: Record<string, number>;
}

// Complete flow data structure
export interface FlowData {
  nodes: FlowNode[];
  edges: FlowEdge[];
  summary: FlowSummary;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
  timestamp?: string;
}

export interface ParseSQLResponse extends ApiResponse<FlowData> {
  filename?: string;
}

// SQL Editor types
export interface SQLEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  theme?: string;
  readOnly?: boolean;
  height?: string;
  width?: string;
}

// Visualization types
export interface VisualizationProps {
  data: FlowData;
  layout?: string;
  theme?: string;
}

// Layout configuration
export interface LayoutConfig {
  name: string;
  [key: string]: any;
}

// Cytoscape element types
export interface CytoscapeElement {
  data: {
    id: string;
    label?: string;
    source?: string;
    target?: string;
    type?: string;
    nodeType?: string;
    parent?: string;
    [key: string]: any;
  };
  classes?: string;
}

// Error types
export interface ValidationError {
  field: string;
  message: string;
}

export interface SQLValidationResult {
  isValid: boolean;
  errors: string[];
}

// File upload types
export interface FileUploadProps {
  accept?: string;
  maxSize?: number;
  onUpload: (file: File) => Promise<void>;
  loading?: boolean;
}

// Application state types
export interface AppState {
  sqlContent: string;
  dbType: string;
  flowData: FlowData | null;
  loading: boolean;
  error: string | null;
  databaseTypes: DatabaseType[];
}

// Theme types
export interface Theme {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  border: string;
}

// Export types
export interface ExportOptions {
  format: 'json' | 'png' | 'svg' | 'pdf';
  filename?: string;
  includeMetadata?: boolean;
}

// Settings types
export interface AppSettings {
  theme: 'light' | 'dark';
  defaultDatabase: string;
  autoSave: boolean;
  showLineNumbers: boolean;
  fontSize: number;
  layout: string;
}

// History types
export interface QueryHistory {
  id: string;
  sql: string;
  dbType: string;
  timestamp: Date;
  success: boolean;
  error?: string;
}

// Statistics types
export interface UsageStatistics {
  totalQueries: number;
  successfulQueries: number;
  failedQueries: number;
  averageExecutionTime: number;
  mostUsedDatabase: string;
  queryComplexity: 'simple' | 'medium' | 'complex';
}

// Component prop types
export interface ButtonProps {
  type?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
  children: React.ReactNode;
}

export interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  disabled?: boolean;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Event types
export interface SQLExecuteEvent extends CustomEvent {
  detail: {
    sql: string;
    dbType: string;
  };
}

export interface NodeClickEvent {
  nodeId: string;
  nodeData: FlowNode['data'];
  connectedNodes: string[];
}

export interface EdgeClickEvent {
  edgeId: string;
  edgeData: FlowEdge['data'];
  sourceNode: string;
  targetNode: string;
}

// Constants
export const DATABASE_TYPES: DatabaseType[] = [
  { value: 'mysql', label: 'MySQL' },
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'sqlite', label: 'SQLite' },
  { value: 'mariadb', label: 'MariaDB' },
  { value: 'oracle', label: 'Oracle' },
  { value: 'mssql', label: 'Microsoft SQL Server' },
  { value: 'snowflake', label: 'Snowflake' },
  { value: 'bigquery', label: 'Google BigQuery' },
  { value: 'redshift', label: 'Amazon Redshift' },
  { value: 'db2', label: 'IBM DB2' },
];

export const SUPPORTED_FILE_TYPES = ['.sql', '.txt'];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const DEFAULT_THEME: Theme = {
  primary: '#1890ff',
  secondary: '#52c41a',
  background: '#ffffff',
  surface: '#fafafa',
  text: '#000000',
  border: '#d9d9d9',
};

export const LAYOUT_OPTIONS = [
  { value: 'dagre', label: 'Hierarchical' },
  { value: 'cose-bilkent', label: 'Force-Directed' },
  { value: 'circle', label: 'Circle' },
  { value: 'grid', label: 'Grid' },
];

// Enums
export enum NodeType {
  TABLE = 'table',
  VIEW = 'view',
  SOURCE = 'source',
  TARGET = 'target',
  COLUMN = 'column',
}

export enum EdgeType {
  JOIN = 'join',
  INSERT = 'insert',
  UPDATE = 'update',
  DELETE = 'delete',
  VIEW_DEPENDENCY = 'view_dependency',
  FOREIGN_KEY = 'foreign_key',
}

export enum DatabaseVendor {
  MYSQL = 'mysql',
  POSTGRESQL = 'postgresql',
  SQLITE = 'sqlite',
  ORACLE = 'oracle',
  MSSQL = 'mssql',
  SNOWFLAKE = 'snowflake',
  BIGQUERY = 'bigquery',
  REDSHIFT = 'redshift',
  DB2 = 'db2',
  MARIADB = 'mariadb',
}

export enum LayoutType {
  DAGRE = 'dagre',
  COSE_BILKENT = 'cose-bilkent',
  CIRCLE = 'circle',
  GRID = 'grid',
}

export enum ExportFormat {
  JSON = 'json',
  PNG = 'png',
  SVG = 'svg',
  PDF = 'pdf',
}