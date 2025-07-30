import React from 'react';
import AceEditor from 'react-ace';

// Import ACE editor modes and themes
import 'ace-builds/src-noconflict/mode-mysql';
import 'ace-builds/src-noconflict/mode-pgsql';
import 'ace-builds/src-noconflict/mode-sql';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/theme-tomorrow';
import 'ace-builds/src-noconflict/theme-textmate';

// Import ACE editor extensions
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/ext-searchbox';
import 'ace-builds/src-noconflict/ext-settings_menu';

interface SQLEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  theme?: string;
  readOnly?: boolean;
  height?: string;
  width?: string;
}

const SQLEditor: React.FC<SQLEditorProps> = ({
  value,
  onChange,
  language = 'mysql',
  theme = 'github',
  readOnly = false,
  height = '100%',
  width = '100%'
}) => {
  // SQL Keywords for autocompletion
  const sqlKeywords = [
    'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN',
    'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'UNION ALL',
    'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'DROP', 'ALTER',
    'TABLE', 'VIEW', 'INDEX', 'DATABASE', 'SCHEMA', 'CONSTRAINT', 'PRIMARY KEY', 'FOREIGN KEY',
    'NOT NULL', 'NULL', 'DEFAULT', 'AUTO_INCREMENT', 'UNIQUE', 'CHECK',
    'AND', 'OR', 'NOT', 'IN', 'EXISTS', 'BETWEEN', 'LIKE', 'IS', 'AS',
    'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'DISTINCT', 'ALL',
    'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'IF', 'IFNULL', 'COALESCE',
    'CAST', 'CONVERT', 'SUBSTRING', 'LENGTH', 'UPPER', 'LOWER', 'TRIM',
    'DATE', 'TIME', 'DATETIME', 'TIMESTAMP', 'NOW', 'CURRENT_DATE', 'CURRENT_TIME',
    'WITH', 'RECURSIVE', 'CTE', 'WINDOW', 'OVER', 'PARTITION BY', 'ROW_NUMBER',
    'RANK', 'DENSE_RANK', 'LAG', 'LEAD', 'FIRST_VALUE', 'LAST_VALUE'
  ];

  // Common table names for autocompletion
  const commonTables = [
    'users', 'orders', 'products', 'customers', 'employees', 'departments',
    'categories', 'order_items', 'user_profiles', 'addresses', 'payments',
    'inventory', 'suppliers', 'transactions', 'logs', 'sessions'
  ];

  // Common column names for autocompletion
  const commonColumns = [
    'id', 'name', 'email', 'created_at', 'updated_at', 'deleted_at',
    'user_id', 'order_id', 'product_id', 'customer_id', 'category_id',
    'first_name', 'last_name', 'phone', 'address', 'city', 'state', 'country',
    'price', 'quantity', 'total', 'status', 'type', 'description', 'title'
  ];

  // Custom completions
  const customCompleter = {
    getCompletions: (editor: any, session: any, pos: any, prefix: any, callback: any) => {
      const completions: any[] = [];

      // Add SQL keywords
      sqlKeywords.forEach(keyword => {
        completions.push({
          caption: keyword,
          value: keyword,
          meta: 'keyword',
          score: 1000
        });
      });

      // Add common table names
      commonTables.forEach(table => {
        completions.push({
          caption: table,
          value: table,
          meta: 'table',
          score: 800
        });
      });

      // Add common column names
      commonColumns.forEach(column => {
        completions.push({
          caption: column,
          value: column,
          meta: 'column',
          score: 600
        });
      });

      callback(null, completions);
    }
  };

  const handleLoad = (editor: any) => {
    // Add custom completer
    editor.completers = [customCompleter];
    
    // Configure editor options
    editor.setOptions({
      enableBasicAutocompletion: true,
      enableLiveAutocompletion: true,
      enableSnippets: true,
      showLineNumbers: true,
      tabSize: 2,
      fontSize: 14,
      fontFamily: 'Fira Code, Monaco, Menlo, Ubuntu Mono, monospace',
      wrap: true,
      showPrintMargin: false,
      highlightActiveLine: true,
      highlightSelectedWord: true,
      behavioursEnabled: true,
      wrapBehavioursEnabled: true,
      autoScrollEditorIntoView: true,
      copyWithEmptySelection: false,
    });

    // Set custom key bindings
    editor.commands.addCommand({
      name: 'executeQuery',
      bindKey: { win: 'Ctrl-Enter', mac: 'Cmd-Enter' },
      exec: () => {
        // Trigger parent component's parse function
        const event = new CustomEvent('sqlExecute');
        window.dispatchEvent(event);
      }
    });

    editor.commands.addCommand({
      name: 'formatSQL',
      bindKey: { win: 'Ctrl-Shift-F', mac: 'Cmd-Shift-F' },
      exec: (editor: any) => {
        // Basic SQL formatting
        const sql = editor.getValue();
        const formatted = formatSQL(sql);
        editor.setValue(formatted, -1);
      }
    });
  };

  // Basic SQL formatter
  const formatSQL = (sql: string): string => {
    return sql
      .replace(/\s+/g, ' ')
      .replace(/,\s*/g, ',\n  ')
      .replace(/\bSELECT\b/gi, 'SELECT')
      .replace(/\bFROM\b/gi, '\nFROM')
      .replace(/\bWHERE\b/gi, '\nWHERE')
      .replace(/\bJOIN\b/gi, '\nJOIN')
      .replace(/\bINNER JOIN\b/gi, '\nINNER JOIN')
      .replace(/\bLEFT JOIN\b/gi, '\nLEFT JOIN')
      .replace(/\bRIGHT JOIN\b/gi, '\nRIGHT JOIN')
      .replace(/\bFULL JOIN\b/gi, '\nFULL JOIN')
      .replace(/\bGROUP BY\b/gi, '\nGROUP BY')
      .replace(/\bORDER BY\b/gi, '\nORDER BY')
      .replace(/\bHAVING\b/gi, '\nHAVING')
      .replace(/\bUNION\b/gi, '\nUNION')
      .replace(/\bWITH\b/gi, 'WITH')
      .trim();
  };

  return (
    <AceEditor
      mode={language}
      theme={theme}
      value={value}
      onChange={onChange}
      onLoad={handleLoad}
      name="sql-editor"
      editorProps={{ $blockScrolling: true }}
      width={width}
      height={height}
      readOnly={readOnly}
      showPrintMargin={false}
      showGutter={true}
      highlightActiveLine={true}
      setOptions={{
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        enableSnippets: true,
        showLineNumbers: true,
        tabSize: 2,
        fontSize: 14,
        fontFamily: 'Fira Code, Monaco, Menlo, Ubuntu Mono, monospace',
        wrap: true,
        useWorker: false, // Disable web worker to avoid CORS issues
      }}
      annotations={[]}
      markers={[]}
    />
  );
};

export default SQLEditor;