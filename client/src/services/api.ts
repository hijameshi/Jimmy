import axios from 'axios';
import { FlowData, DatabaseType } from '../types';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 413) {
      throw new Error('File too large. Please upload a smaller SQL file.');
    } else if (error.response?.status === 429) {
      throw new Error('Too many requests. Please try again later.');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please try again.');
    } else if (!error.response) {
      throw new Error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

/**
 * Parse SQL query and get data lineage
 */
export const parseSQL = async (sql: string, dbType: string = 'mysql'): Promise<FlowData> => {
  try {
    const response = await api.post('/parse-sql', {
      sql: sql.trim(),
      dbType,
    });

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to parse SQL');
    }

    return response.data.data;
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw error;
  }
};

/**
 * Upload SQL file and get data lineage
 */
export const uploadSQLFile = async (file: File, dbType: string = 'mysql'): Promise<FlowData> => {
  try {
    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('File size exceeds 10MB limit');
    }

    const allowedTypes = ['.sql', '.txt'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!allowedTypes.includes(fileExtension)) {
      throw new Error('Only .sql and .txt files are allowed');
    }

    // Create form data
    const formData = new FormData();
    formData.append('sqlFile', file);
    formData.append('dbType', dbType);

    const response = await api.post('/upload-sql', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to upload and parse SQL file');
    }

    return response.data.data;
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw error;
  }
};

/**
 * Get supported database types
 */
export const getDatabaseTypes = async (): Promise<DatabaseType[]> => {
  try {
    const response = await api.get('/database-types');

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch database types');
    }

    return response.data.data;
  } catch (error: any) {
    console.error('Failed to fetch database types:', error);
    
    // Return default database types as fallback
    return [
      { value: 'mysql', label: 'MySQL' },
      { value: 'postgresql', label: 'PostgreSQL' },
      { value: 'sqlite', label: 'SQLite' },
      { value: 'oracle', label: 'Oracle' },
      { value: 'mssql', label: 'Microsoft SQL Server' },
      { value: 'snowflake', label: 'Snowflake' },
      { value: 'bigquery', label: 'Google BigQuery' },
      { value: 'redshift', label: 'Amazon Redshift' },
    ];
  }
};

/**
 * Health check endpoint
 */
export const healthCheck = async (): Promise<{ status: string; timestamp: string }> => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error: any) {
    throw new Error('Server health check failed');
  }
};

/**
 * Validate SQL syntax (basic client-side validation)
 */
export const validateSQL = (sql: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const trimmedSQL = sql.trim();

  if (!trimmedSQL) {
    errors.push('SQL query cannot be empty');
    return { isValid: false, errors };
  }

  // Basic SQL validation
  const sqlKeywords = [
    'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER', 'WITH'
  ];

  const hasValidKeyword = sqlKeywords.some(keyword => 
    trimmedSQL.toUpperCase().includes(keyword)
  );

  if (!hasValidKeyword) {
    errors.push('SQL query must contain at least one valid SQL keyword');
  }

  // Check for common syntax issues
  const openParens = (trimmedSQL.match(/\(/g) || []).length;
  const closeParens = (trimmedSQL.match(/\)/g) || []).length;
  
  if (openParens !== closeParens) {
    errors.push('Mismatched parentheses in SQL query');
  }

  // Check for unclosed quotes
  const singleQuotes = (trimmedSQL.match(/'/g) || []).length;
  const doubleQuotes = (trimmedSQL.match(/"/g) || []).length;
  
  if (singleQuotes % 2 !== 0) {
    errors.push('Unclosed single quotes in SQL query');
  }
  
  if (doubleQuotes % 2 !== 0) {
    errors.push('Unclosed double quotes in SQL query');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Generate sample SQL queries for different database types
 */
export const getSampleQueries = (dbType: string) => {
  const samples: Record<string, Record<string, string>> = {
    mysql: {
      basic: `SELECT u.id, u.name, o.order_date, o.total
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE o.order_date >= '2023-01-01';`,
      
      complex: `WITH recent_orders AS (
  SELECT user_id, COUNT(*) as order_count, AVG(total) as avg_total
  FROM orders 
  WHERE order_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
  GROUP BY user_id
)
SELECT 
  u.name,
  u.email,
  ro.order_count,
  ro.avg_total
FROM users u
JOIN recent_orders ro ON u.id = ro.user_id
WHERE ro.order_count > 2;`,
    },
    
    postgresql: {
      basic: `SELECT u.id, u.name, o.order_date, o.total
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE o.order_date >= '2023-01-01'::date;`,
      
      complex: `WITH recent_orders AS (
  SELECT user_id, COUNT(*) as order_count, AVG(total) as avg_total
  FROM orders 
  WHERE order_date >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY user_id
)
SELECT 
  u.name,
  u.email,
  ro.order_count,
  ro.avg_total
FROM users u
JOIN recent_orders ro ON u.id = ro.user_id
WHERE ro.order_count > 2;`,
    },
    
    snowflake: {
      basic: `SELECT u.id, u.name, o.order_date, o.total
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE o.order_date >= '2023-01-01'::date;`,
      
      complex: `WITH recent_orders AS (
  SELECT user_id, COUNT(*) as order_count, AVG(total) as avg_total
  FROM orders 
  WHERE order_date >= DATEADD(day, -30, CURRENT_DATE())
  GROUP BY user_id
)
SELECT 
  u.name,
  u.email,
  ro.order_count,
  ro.avg_total
FROM users u
JOIN recent_orders ro ON u.id = ro.user_id
WHERE ro.order_count > 2;`,
    }
  };
  
  return samples[dbType] || samples.mysql;
};

export default api;