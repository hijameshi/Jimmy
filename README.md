# SQLFlow - Data Lineage Visualizer

A powerful web application that analyzes SQL queries and visualizes data flow relationships, similar to [sqlflow.gudusoft.com](https://sqlflow.gudusoft.com). This tool helps developers and data engineers understand complex SQL dependencies and data transformations.

![SQLFlow Demo](https://via.placeholder.com/800x400?text=SQLFlow+Demo)

## Features

### 🔍 **SQL Analysis**
- Parse and analyze complex SQL queries
- Support for 10+ major database types (MySQL, PostgreSQL, Oracle, SQL Server, Snowflake, etc.)
- Handle SELECT, INSERT, UPDATE, DELETE, CREATE VIEW, and more
- Extract table and column relationships
- Identify data dependencies and transformations

### 📊 **Data Lineage Visualization**
- Interactive flow diagrams using Cytoscape.js
- Multiple layout algorithms (Hierarchical, Force-directed, Circle, Grid)
- Node highlighting and relationship tracing
- Zoom, pan, and export capabilities
- Color-coded nodes by type (Tables, Views, Sources, Targets)

### 💻 **Advanced SQL Editor**
- Syntax highlighting for multiple SQL dialects
- Auto-completion for SQL keywords, tables, and columns
- Line numbers and code folding
- Keyboard shortcuts (Ctrl+Enter to execute, Ctrl+Shift+F to format)
- File upload support (.sql, .txt files up to 10MB)

### 🎨 **Modern UI/UX**
- Clean, responsive design built with React and Ant Design
- Real-time analysis and visualization
- Sample queries for quick testing
- Export diagrams as PNG or JSON
- Mobile-friendly responsive layout

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/sqlflow-web.git
   cd sqlflow-web
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:3000
   ```

The backend API will run on `http://localhost:5000` and the React frontend on `http://localhost:3000`.

## Usage

### Basic Usage

1. **Select Database Type**: Choose your SQL dialect from the dropdown
2. **Enter SQL Query**: Type or paste your SQL query in the editor
3. **Analyze**: Click "Analyze SQL" to generate the data flow diagram
4. **Explore**: Interact with the visualization to understand data relationships

### Sample Queries

Try these sample queries to see SQLFlow in action:

**Basic Join Query:**
```sql
SELECT u.id, u.name, o.order_date, o.total
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE o.order_date >= '2023-01-01';
```

**Complex CTE Query:**
```sql
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
  ro.avg_total
FROM users u
JOIN recent_orders ro ON u.id = ro.user_id
WHERE ro.order_count > 2;
```

### File Upload

1. Click "Upload SQL File"
2. Select a .sql or .txt file (max 10MB)
3. The file content will be loaded and analyzed automatically

### Visualization Controls

- **Zoom**: Use mouse wheel or zoom buttons
- **Pan**: Click and drag to move around
- **Layout**: Switch between different layout algorithms
- **Highlight**: Click on nodes to highlight connections
- **Export**: Save diagrams as PNG images or JSON data

## Supported Databases

- MySQL
- PostgreSQL  
- SQLite
- MariaDB
- Oracle
- Microsoft SQL Server
- Snowflake
- Google BigQuery
- Amazon Redshift
- IBM DB2

## API Endpoints

### POST `/api/parse-sql`
Analyze SQL query and return data lineage.

**Request:**
```json
{
  "sql": "SELECT * FROM users u JOIN orders o ON u.id = o.user_id",
  "dbType": "mysql"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "nodes": [...],
    "edges": [...],
    "summary": {
      "totalTables": 2,
      "totalRelationships": 1,
      "tableTypes": {"source": 2}
    }
  }
}
```

### POST `/api/upload-sql`
Upload and analyze SQL file.

### GET `/api/database-types`
Get list of supported database types.

### GET `/api/health`
Health check endpoint.

## Development

### Project Structure
```
sqlflow-web/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   └── ...
│   └── package.json
├── server/                 # Node.js backend
│   └── index.js           # Express server
├── package.json           # Root package.json
└── README.md
```

### Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run server:dev` - Start only the backend server
- `npm run client:dev` - Start only the frontend
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run install:all` - Install all dependencies

### Technology Stack

**Frontend:**
- React 18 with TypeScript
- Ant Design for UI components
- Cytoscape.js for graph visualization
- React Ace for code editing
- Axios for API calls

**Backend:**
- Node.js with Express
- node-sql-parser for SQL parsing
- Multer for file uploads
- CORS for cross-origin requests

## Configuration

### Environment Variables

Create a `.env` file in the client directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Server Configuration

The server runs on port 5000 by default. You can change this by setting the `PORT` environment variable:

```bash
PORT=8000 npm run server:dev
```

## Deployment

### Production Build

1. **Build the client:**
   ```bash
   npm run build
   ```

2. **Start production server:**
   ```bash
   NODE_ENV=production npm start
   ```

### Docker Deployment

```dockerfile
FROM node:16-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 5000
CMD ["npm", "start"]
```

### Deploy to Heroku

1. Create a Heroku app
2. Set buildpacks for Node.js
3. Configure environment variables
4. Deploy via Git

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

**Node modules issues:**
```bash
# Clean install
rm -rf node_modules client/node_modules
npm run install:all
```

**CORS errors:**
- Ensure the backend server is running
- Check REACT_APP_API_URL in client/.env

### Performance Tips

- Use smaller SQL files (< 1MB recommended)
- Limit complex queries with many joins
- Use appropriate layout algorithms for your data

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by [SQLFlow by Gudu Software](https://sqlflow.gudusoft.com)
- Built with [Cytoscape.js](https://cytoscape.org/) for graph visualization
- Uses [node-sql-parser](https://github.com/taozhi8833998/node-sql-parser) for SQL parsing
- UI components from [Ant Design](https://ant.design/)

## Support

- 📧 Email: support@sqlflow-web.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/sqlflow-web/issues)
- 📖 Documentation: [Wiki](https://github.com/your-username/sqlflow-web/wiki)

---

**Made with ❤️ for the data community**