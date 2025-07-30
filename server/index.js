const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { Parser } = require('node-sql-parser');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// File upload configuration
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Initialize SQL parser
const parser = new Parser();

// SQL Parser utility functions
class SQLFlowAnalyzer {
  constructor() {
    this.tables = new Map();
    this.columns = new Map();
    this.relationships = [];
    this.nodeId = 0;
  }

  generateId() {
    return ++this.nodeId;
  }

  parseSQL(sqlText, dbType = 'mysql') {
    try {
      const ast = parser.astify(sqlText, { database: dbType });
      return this.analyzeAST(ast);
    } catch (error) {
      console.error('SQL parsing error:', error);
      throw new Error(`SQL parsing failed: ${error.message}`);
    }
  }

  analyzeAST(ast) {
    this.tables.clear();
    this.columns.clear();
    this.relationships = [];
    this.nodeId = 0;

    if (Array.isArray(ast)) {
      ast.forEach(statement => this.analyzeStatement(statement));
    } else {
      this.analyzeStatement(ast);
    }

    return this.generateFlowData();
  }

  analyzeStatement(statement) {
    switch (statement.type) {
      case 'select':
        this.analyzeSelect(statement);
        break;
      case 'insert':
        this.analyzeInsert(statement);
        break;
      case 'update':
        this.analyzeUpdate(statement);
        break;
      case 'delete':
        this.analyzeDelete(statement);
        break;
      case 'create':
        this.analyzeCreate(statement);
        break;
      case 'alter':
        this.analyzeAlter(statement);
        break;
      default:
        console.log('Unsupported statement type:', statement.type);
    }
  }

  analyzeSelect(statement) {
    // Analyze FROM clause
    if (statement.from) {
      statement.from.forEach(fromItem => {
        this.processFromItem(fromItem);
      });
    }

    // Analyze SELECT columns
    if (statement.columns) {
      statement.columns.forEach(column => {
        this.processSelectColumn(column);
      });
    }

    // Analyze JOIN conditions
    if (statement.from) {
      statement.from.forEach(fromItem => {
        if (fromItem.join) {
          this.processJoin(fromItem);
        }
      });
    }

    // Analyze WHERE clause
    if (statement.where) {
      this.processWhereClause(statement.where);
    }
  }

  analyzeInsert(statement) {
    const targetTable = this.getTableName(statement.table);
    this.addTable(targetTable, 'target');

    if (statement.values) {
      // INSERT with VALUES
      if (statement.columns) {
        statement.columns.forEach(col => {
          this.addColumn(targetTable, col, 'target');
        });
      }
    } else if (statement.select) {
      // INSERT with SELECT
      this.analyzeSelect(statement.select);
      
      // Create relationships from SELECT to INSERT target
      const selectTables = Array.from(this.tables.keys()).filter(t => 
        this.tables.get(t).type === 'source'
      );
      
      selectTables.forEach(sourceTable => {
        this.addRelationship(sourceTable, targetTable, 'insert');
      });
    }
  }

  analyzeUpdate(statement) {
    const targetTable = this.getTableName(statement.table);
    this.addTable(targetTable, 'target');

    if (statement.set) {
      statement.set.forEach(setItem => {
        this.addColumn(targetTable, setItem.column, 'target');
      });
    }

    if (statement.where) {
      this.processWhereClause(statement.where);
    }
  }

  analyzeDelete(statement) {
    const targetTable = this.getTableName(statement.from);
    this.addTable(targetTable, 'target');

    if (statement.where) {
      this.processWhereClause(statement.where);
    }
  }

  analyzeCreate(statement) {
    if (statement.keyword === 'table') {
      const tableName = this.getTableName(statement.table);
      this.addTable(tableName, 'table');

      if (statement.create_definitions) {
        statement.create_definitions.forEach(def => {
          if (def.column) {
            this.addColumn(tableName, def.column.column, 'column');
            
            // Handle foreign key constraints
            if (def.reference_definition) {
              const refTable = this.getTableName(def.reference_definition.table);
              this.addTable(refTable, 'table');
              this.addRelationship(tableName, refTable, 'foreign_key');
            }
          }
        });
      }
    } else if (statement.keyword === 'view') {
      const viewName = this.getTableName(statement.table);
      this.addTable(viewName, 'view');
      
      if (statement.select) {
        this.analyzeSelect(statement.select);
        
        // Create relationships from source tables to view
        const sourceTables = Array.from(this.tables.keys()).filter(t => 
          this.tables.get(t).type === 'source'
        );
        
        sourceTables.forEach(sourceTable => {
          this.addRelationship(sourceTable, viewName, 'view_dependency');
        });
      }
    }
  }

  analyzeAlter(statement) {
    // Handle ALTER TABLE statements
    const tableName = this.getTableName(statement.table);
    this.addTable(tableName, 'table');
  }

  processFromItem(fromItem) {
    if (fromItem.table) {
      const tableName = this.getTableName(fromItem.table);
      this.addTable(tableName, 'source');
    } else if (fromItem.expr && fromItem.expr.type === 'select') {
      // Subquery
      this.analyzeSelect(fromItem.expr);
    }
  }

  processSelectColumn(column) {
    if (column.expr && column.expr.type === 'column_ref') {
      const tableName = column.expr.table || 'unknown';
      const columnName = column.expr.column;
      this.addColumn(tableName, columnName, 'selected');
    }
  }

  processJoin(fromItem) {
    if (fromItem.table) {
      const tableName = this.getTableName(fromItem.table);
      this.addTable(tableName, 'source');
    }

    if (fromItem.on) {
      this.processWhereClause(fromItem.on);
    }
  }

  processWhereClause(whereClause) {
    if (whereClause.type === 'binary_expr') {
      this.processBinaryExpression(whereClause);
    }
  }

  processBinaryExpression(expr) {
    if (expr.left && expr.left.type === 'column_ref') {
      const tableName = expr.left.table || 'unknown';
      const columnName = expr.left.column;
      this.addColumn(tableName, columnName, 'condition');
    }

    if (expr.right && expr.right.type === 'column_ref') {
      const tableName = expr.right.table || 'unknown';
      const columnName = expr.right.column;
      this.addColumn(tableName, columnName, 'condition');
      
      // If both sides are column references, create a relationship
      if (expr.left && expr.left.type === 'column_ref') {
        const leftTable = expr.left.table || 'unknown';
        const rightTable = expr.right.table || 'unknown';
        if (leftTable !== rightTable) {
          this.addRelationship(leftTable, rightTable, 'join');
        }
      }
    }
  }

  getTableName(tableRef) {
    if (typeof tableRef === 'string') {
      return tableRef;
    } else if (tableRef && tableRef.table) {
      return tableRef.table;
    } else if (tableRef && tableRef.name) {
      return tableRef.name;
    }
    return 'unknown';
  }

  addTable(tableName, type) {
    if (!this.tables.has(tableName)) {
      this.tables.set(tableName, {
        id: this.generateId(),
        name: tableName,
        type: type,
        columns: []
      });
    }
  }

  addColumn(tableName, columnName, type) {
    if (tableName === 'unknown') return;
    
    this.addTable(tableName, 'source');
    const table = this.tables.get(tableName);
    
    if (!table.columns.find(col => col.name === columnName)) {
      table.columns.push({
        id: this.generateId(),
        name: columnName,
        type: type
      });
    }
  }

  addRelationship(sourceTable, targetTable, type) {
    if (sourceTable === targetTable) return;
    
    this.relationships.push({
      id: this.generateId(),
      source: sourceTable,
      target: targetTable,
      type: type
    });
  }

  generateFlowData() {
    const nodes = [];
    const edges = [];

    // Generate nodes for tables
    this.tables.forEach((table, tableName) => {
      nodes.push({
        data: {
          id: `table_${table.id}`,
          label: tableName,
          type: table.type,
          columns: table.columns,
          nodeType: 'table'
        }
      });

      // Generate nodes for columns
      table.columns.forEach(column => {
        nodes.push({
          data: {
            id: `column_${column.id}`,
            label: column.name,
            type: column.type,
            parent: `table_${table.id}`,
            nodeType: 'column'
          }
        });
      });
    });

    // Generate edges for relationships
    this.relationships.forEach(rel => {
      const sourceTable = this.tables.get(rel.source);
      const targetTable = this.tables.get(rel.target);
      
      if (sourceTable && targetTable) {
        edges.push({
          data: {
            id: `edge_${rel.id}`,
            source: `table_${sourceTable.id}`,
            target: `table_${targetTable.id}`,
            label: rel.type,
            type: rel.type
          }
        });
      }
    });

    return {
      nodes,
      edges,
      summary: {
        totalTables: this.tables.size,
        totalRelationships: this.relationships.length,
        tableTypes: this.getTableTypesSummary()
      }
    };
  }

  getTableTypesSummary() {
    const types = {};
    this.tables.forEach(table => {
      types[table.type] = (types[table.type] || 0) + 1;
    });
    return types;
  }
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Parse SQL and generate flow diagram
app.post('/api/parse-sql', (req, res) => {
  try {
    const { sql, dbType = 'mysql' } = req.body;
    
    if (!sql || sql.trim() === '') {
      return res.status(400).json({ error: 'SQL query is required' });
    }

    const analyzer = new SQLFlowAnalyzer();
    const flowData = analyzer.parseSQL(sql, dbType);
    
    res.json({
      success: true,
      data: flowData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Parse SQL error:', error);
    res.status(500).json({ 
      error: 'Failed to parse SQL', 
      details: error.message 
    });
  }
});

// Upload and parse SQL file
app.post('/api/upload-sql', upload.single('sqlFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { dbType = 'mysql' } = req.body;
    const filePath = req.file.path;
    
    // Read file content
    const sqlContent = await fs.readFile(filePath, 'utf8');
    
    // Clean up uploaded file
    await fs.remove(filePath);
    
    const analyzer = new SQLFlowAnalyzer();
    const flowData = analyzer.parseSQL(sqlContent, dbType);
    
    res.json({
      success: true,
      data: flowData,
      filename: req.file.originalname,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Upload SQL error:', error);
    
    // Clean up file if it exists
    if (req.file) {
      await fs.remove(req.file.path).catch(() => {});
    }
    
    res.status(500).json({ 
      error: 'Failed to process uploaded file', 
      details: error.message 
    });
  }
});

// Get supported database types
app.get('/api/database-types', (req, res) => {
  res.json({
    success: true,
    data: [
      { value: 'mysql', label: 'MySQL' },
      { value: 'postgresql', label: 'PostgreSQL' },
      { value: 'sqlite', label: 'SQLite' },
      { value: 'mariadb', label: 'MariaDB' },
      { value: 'bigquery', label: 'Google BigQuery' },
      { value: 'snowflake', label: 'Snowflake' },
      { value: 'redshift', label: 'Amazon Redshift' },
      { value: 'oracle', label: 'Oracle' },
      { value: 'mssql', label: 'Microsoft SQL Server' },
      { value: 'db2', label: 'IBM DB2' }
    ]
  });
});

// Serve static files from React build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    error: 'Internal server error', 
    details: process.env.NODE_ENV === 'development' ? error.message : undefined 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`SQLFlow server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;