from flask import Flask, render_template, request, jsonify
import re
import json
from sql_parser import SQLParser

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate_diagram', methods=['POST'])
def generate_diagram():
    try:
        sql_query = request.json.get('sql_query', '')
        if not sql_query:
            return jsonify({'error': 'No SQL query provided'}), 400
        
        parser = SQLParser()
        diagram_data = parser.parse_query(sql_query)
        
        return jsonify({
            'success': True,
            'diagram_data': diagram_data
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)