# SQL Query Diagram Generator

A web application that generates data flow diagrams from SQL queries, similar to the reference image provided. The application parses SQL queries and creates visual representations of table relationships, CTEs (Common Table Expressions), and data flow.

## Features

- **SQL Query Parsing**: Analyzes complex SQL queries including CTEs, JOINs, and subqueries
- **Visual Diagram Generation**: Creates interactive data flow diagrams using D3.js
- **Modern UI**: Dark theme interface with responsive design
- **Interactive Elements**: Zoom, hover effects, and clear visual hierarchy
- **Color-coded Nodes**: Different colors for tables, CTEs, and result sets

## Installation

1. **Clone or download the project files**

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**:
   ```bash
   python app.py
   ```

4. **Open your browser** and navigate to `http://localhost:5000`

## Usage

1. **Enter your SQL query** in the text area on the left side
2. **Click "Generate Diagram"** or press `Ctrl+Enter`
3. **View the generated diagram** on the right side
4. **Use the "Clear" button** to reset the form

## Example Query

The application can handle complex queries like:

```sql
WITH department_avg_salary AS (
  SELECT 
    department_id,
    AVG(salary) AS avg_dept_salary
  FROM employees
  GROUP BY department_id
),
high_performers AS (
  SELECT
    employee_id,
    first_name,
    last_name,
    email,
    phone_number,
    hire_date,
    job_id,
    salary,
    department_id
  FROM employees e
  JOIN department_avg_salary das ON e.department_id = das.department_id
  WHERE e.salary > das.avg_dept_salary
)
SELECT
  hp.employee_id,
  hp.first_name || ' ' || hp.last_name AS full_name,
  hp.email,
  d.department_name,
  j.job_title,
  hp.salary,
  sg.grade_level AS salary_grade,
  hp.hire_date,
  COUNT(jh.job_id) OVER (PARTITION BY hp.employee_id) AS job_change_count,
  LAST_VALUE(jh.start_date) OVER (PARTITION BY hp.employee_id ORDER BY jh.start_date) AS last_job_change_date,
  RANK() OVER (PARTITION BY hp.department_id ORDER BY hp.salary DESC) AS rank_in_department,
  CASE
    WHEN sg.grade_level = 'A' THEN hp.salary * 0.15
    WHEN sg.grade_level = 'B' THEN hp.salary * 0.10
    ELSE hp.salary * 0.05
  END AS bonus_amount,
  (SELECT COUNT(*) FROM employees WHERE job_id = hp.job_id) AS total_employees_in_job
FROM high_performers hp
LEFT JOIN departments d ON hp.department_id = d.department_id
LEFT JOIN jobs j ON hp.job_id = j.job_id
LEFT JOIN job_history jh ON hp.employee_id = jh.employee_id
LEFT JOIN salary_grades sg ON hp.salary BETWEEN sg.lowest_sal AND sg.highest_sal
WHERE 
  hp.hire_date >= TO_DATE('2010-01-01', 'YYYY-MM-DD')
  AND d.location_id IN (1700, 1800)
ORDER BY
  d.department_name,
  rank_in_department ASC;
```

## Diagram Elements

- **Green Nodes**: Source tables (employees, departments, jobs, etc.)
- **Brown Nodes**: CTEs (Common Table Expressions)
- **Red Nodes**: Final result sets
- **Grey Arrows**: Data flow between components

## Technical Details

- **Backend**: Flask (Python)
- **Frontend**: HTML5, CSS3, JavaScript
- **Visualization**: D3.js
- **SQL Parsing**: Custom regex-based parser
- **Styling**: Modern CSS with dark theme

## File Structure

```
├── app.py                 # Main Flask application
├── sql_parser.py          # SQL query parsing logic
├── requirements.txt       # Python dependencies
├── templates/
│   └── index.html        # Main HTML template
└── static/
    ├── css/
    │   └── style.css     # CSS styles
    └── js/
        └── diagram.js    # JavaScript for diagram generation
```

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Troubleshooting

- **If the diagram doesn't appear**: Check the browser console for JavaScript errors
- **If the server won't start**: Ensure all dependencies are installed with `pip install -r requirements.txt`
- **If the diagram is empty**: Verify your SQL query syntax is correct

## Future Enhancements

- Support for more complex SQL constructs
- Export diagrams as PNG/SVG
- Save and load query history
- More detailed table relationship analysis
- Support for different database dialects