import re
from typing import Dict, List, Set, Tuple
import json

class SQLParser:
    def __init__(self):
        self.nodes = []
        self.edges = []
        self.node_id_counter = 0
        
    def parse_query(self, sql_query: str) -> Dict:
        """Parse SQL query and generate diagram data"""
        self.nodes = []
        self.edges = []
        self.node_id_counter = 0
        
        # Clean the query
        sql_query = self._clean_query(sql_query)
        
        # Extract CTEs (Common Table Expressions)
        ctes = self._extract_ctes(sql_query)
        
        # Extract main query components
        main_query = self._extract_main_query(sql_query)
        
        # Parse tables and relationships
        self._parse_tables_and_relationships(ctes, main_query)
        
        return {
            'nodes': self.nodes,
            'edges': self.edges
        }
    
    def _clean_query(self, query: str) -> str:
        """Clean and normalize the SQL query"""
        # Remove comments
        query = re.sub(r'--.*$', '', query, flags=re.MULTILINE)
        query = re.sub(r'/\*.*?\*/', '', query, flags=re.DOTALL)
        
        # Normalize whitespace
        query = re.sub(r'\s+', ' ', query)
        query = query.strip()
        
        return query
    
    def _extract_ctes(self, query: str) -> List[Dict]:
        """Extract Common Table Expressions (CTEs)"""
        ctes = []
        
        # Handle multiple CTEs separated by commas
        if 'WITH' in query.upper():
            # Extract the entire WITH clause
            with_match = re.search(r'WITH\s+(.*?)(?=SELECT|$)', query, re.IGNORECASE | re.DOTALL)
            if with_match:
                with_clause = with_match.group(1)
                
                # Split by CTE definitions (looking for AS keyword)
                cte_parts = re.split(r',\s*(?=\w+\s+AS\s*\()', with_clause)
                
                for part in cte_parts:
                    cte_match = re.search(r'(\w+)\s+AS\s*\(\s*(.*?)\s*\)', part, re.IGNORECASE | re.DOTALL)
                    if cte_match:
                        cte_name = cte_match.group(1)
                        cte_query = cte_match.group(2)
                        ctes.append({
                            'name': cte_name,
                            'query': cte_query
                        })
        
        return ctes
    
    def _extract_main_query(self, query: str) -> str:
        """Extract the main query after CTEs"""
        # Remove CTEs to get main query
        main_query = re.sub(r'WITH\s+.*?\)\s*,?\s*', '', query, flags=re.IGNORECASE | re.DOTALL)
        return main_query.strip()
    
    def _parse_tables_and_relationships(self, ctes: List[Dict], main_query: str):
        """Parse tables and their relationships"""
        # Store CTE names for filtering
        self.cte_names = [cte['name'] for cte in ctes]
        
        # Add CTE nodes
        for cte in ctes:
            self._add_cte_node(cte)
        
        # Parse main query
        self._parse_main_query(main_query)
        
        # Add relationships
        self._add_relationships()
        
        # Remove CTEs from table nodes since they're already added as CTE nodes
        self._remove_cte_duplicates(ctes)
    
    def _add_cte_node(self, cte: Dict):
        """Add a CTE node to the diagram"""
        node_id = f"cte_{cte['name']}"
        
        # Extract tables from CTE query
        tables = self._extract_tables_from_query(cte['query'])
        
        node = {
            'id': node_id,
            'type': 'cte',
            'label': cte['name'],
            'tables': tables,
            'color': '#8B4513',  # Brown for CTEs
            'x': 300,
            'y': 100 + len([n for n in self.nodes if n['type'] == 'cte']) * 150
        }
        
        self.nodes.append(node)
    
    def _extract_tables_from_query(self, query: str) -> List[str]:
        """Extract table names from a query"""
        # Pattern to match table names in FROM and JOIN clauses
        table_pattern = r'(?:FROM|JOIN)\s+(\w+(?:\.\w+)?)'
        tables = re.findall(table_pattern, query, re.IGNORECASE)
        
        # Also look for subqueries and CTEs
        subquery_pattern = r'\(\s*SELECT.*?FROM\s+(\w+)'
        subquery_tables = re.findall(subquery_pattern, query, re.IGNORECASE | re.DOTALL)
        
        # Handle table aliases (e.g., employees e, departments d)
        alias_pattern = r'(\w+)\s+(\w+)(?:\s+ON|\s+WHERE|\s+GROUP|\s+ORDER|\s+HAVING|$)'
        alias_matches = re.findall(alias_pattern, query, re.IGNORECASE)
        aliased_tables = [match[0] for match in alias_matches if match[0] not in ['SELECT', 'FROM', 'WHERE', 'GROUP', 'ORDER', 'HAVING']]
        
        all_tables = tables + subquery_tables + aliased_tables
        
        # Filter out CTEs that are referenced in the main query
        # These should be treated as CTE nodes, not table nodes
        if hasattr(self, 'cte_names'):
            filtered_tables = [table for table in all_tables if table not in self.cte_names]
        else:
            filtered_tables = all_tables
        
        return list(set(filtered_tables))
    
    def _parse_main_query(self, query: str):
        """Parse the main query"""
        # Extract tables from main query
        tables = self._extract_tables_from_query(query)
        
        # Add table nodes
        for i, table in enumerate(tables):
            node_id = f"table_{table}"
            
            node = {
                'id': node_id,
                'type': 'table',
                'label': table,
                'color': '#228B22',  # Green for tables
                'x': 50,
                'y': 100 + i * 120
            }
            
            self.nodes.append(node)
        
        # Add result node
        result_node = {
            'id': 'result',
            'type': 'result',
            'label': 'Result',
            'color': '#FF6347',  # Red for result
            'x': 600,
            'y': 200
        }
        
        self.nodes.append(result_node)
    

    
    def _add_relationships(self):
        """Add edges between nodes based on relationships"""
        # Connect CTEs to result
        cte_nodes = [node for node in self.nodes if node['type'] == 'cte']
        table_nodes = [node for node in self.nodes if node['type'] == 'table']
        result_node = [node for node in self.nodes if node['type'] == 'result'][0]
        
        # Connect tables to result
        for table_node in table_nodes:
            edge = {
                'from': table_node['id'],
                'to': result_node['id'],
                'label': 'data flow'
            }
            self.edges.append(edge)
        
        # Connect CTEs to result
        for cte_node in cte_nodes:
            edge = {
                'from': cte_node['id'],
                'to': result_node['id'],
                'label': 'processed data'
            }
            self.edges.append(edge)
    
    def _remove_cte_duplicates(self, ctes: List[Dict]):
        """Remove CTE nodes that were incorrectly added as table nodes"""
        cte_names = [cte['name'] for cte in ctes]
        
        # Remove table nodes that are actually CTEs
        self.nodes = [node for node in self.nodes if not (
            node['type'] == 'table' and 
            node['label'] in cte_names
        )]