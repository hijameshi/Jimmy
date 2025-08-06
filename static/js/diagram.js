class DiagramGenerator {
    constructor() {
        this.svg = null;
        this.width = 800;
        this.height = 600;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeSvg();
    }

    setupEventListeners() {
        const generateBtn = document.getElementById('generateBtn');
        const clearBtn = document.getElementById('clearBtn');
        const sqlQuery = document.getElementById('sqlQuery');

        generateBtn.addEventListener('click', () => this.generateDiagram());
        clearBtn.addEventListener('click', () => this.clearDiagram());
        
        // Allow Enter key to generate diagram
        sqlQuery.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.generateDiagram();
            }
        });
    }

    initializeSvg() {
        this.svg = d3.select('#diagramSvg');
        
        // Clear existing content
        this.svg.selectAll('*').remove();
        
        // Add arrow marker
        this.svg.append('defs').append('marker')
            .attr('id', 'arrowhead')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 8)
            .attr('refY', 0)
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M0,-5L10,0L0,5')
            .attr('fill', '#888');
    }

    async generateDiagram() {
        const sqlQuery = document.getElementById('sqlQuery').value.trim();
        
        if (!sqlQuery) {
            alert('Please enter a SQL query');
            return;
        }

        try {
            const response = await fetch('/generate_diagram', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sql_query: sqlQuery })
            });

            const data = await response.json();
            
            if (data.success) {
                this.renderDiagram(data.diagram_data);
            } else {
                alert('Error: ' + data.error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while generating the diagram');
        }
    }

    renderDiagram(diagramData) {
        this.initializeSvg();
        
        const nodes = diagramData.nodes;
        const edges = diagramData.edges;
        
        if (nodes.length === 0) {
            this.showPlaceholder();
            return;
        }

        // Calculate layout
        const layout = this.calculateLayout(nodes);
        
        // Render edges
        this.renderEdges(edges, layout);
        
        // Render nodes
        this.renderNodes(nodes, layout);
        
        // Add zoom functionality
        this.addZoom();
    }

    calculateLayout(nodes) {
        const layout = {};
        const nodeWidth = 120;
        const nodeHeight = 80;
        const padding = 50;
        
        // Separate nodes by type
        const tables = nodes.filter(n => n.type === 'table');
        const ctes = nodes.filter(n => n.type === 'cte');
        const results = nodes.filter(n => n.type === 'result');
        
        // Position tables on the left
        tables.forEach((node, i) => {
            layout[node.id] = {
                x: padding,
                y: padding + i * (nodeHeight + 20)
            };
        });
        
        // Position CTEs in the middle
        ctes.forEach((node, i) => {
            layout[node.id] = {
                x: this.width / 2 - nodeWidth / 2,
                y: padding + i * (nodeHeight + 20)
            };
        });
        
        // Position results on the right
        results.forEach((node, i) => {
            layout[node.id] = {
                x: this.width - nodeWidth - padding,
                y: this.height / 2 - nodeHeight / 2
            };
        });
        
        return layout;
    }

    renderNodes(nodes, layout) {
        const nodeGroup = this.svg.selectAll('.node-group')
            .data(nodes)
            .enter()
            .append('g')
            .attr('class', 'node-group')
            .attr('transform', d => `translate(${layout[d.id].x}, ${layout[d.id].y})`);

        // Add rectangles
        nodeGroup.append('rect')
            .attr('width', 120)
            .attr('height', 80)
            .attr('rx', 8)
            .attr('ry', 8)
            .attr('fill', d => d.color)
            .attr('stroke', '#555')
            .attr('stroke-width', 2)
            .attr('class', 'node');

        // Add text
        nodeGroup.append('text')
            .attr('x', 60)
            .attr('y', 40)
            .attr('class', 'node-text')
            .text(d => d.label)
            .call(this.wrapText, 110);
    }

    renderEdges(edges, layout) {
        const edgeGroup = this.svg.selectAll('.edge-group')
            .data(edges)
            .enter()
            .append('g')
            .attr('class', 'edge-group');

        edgeGroup.append('path')
            .attr('class', 'edge')
            .attr('d', d => {
                const fromNode = layout[d.from];
                const toNode = layout[d.to];
                if (!fromNode || !toNode) return '';
                
                return `M ${fromNode.x + 120} ${fromNode.y + 40} L ${toNode.x} ${toNode.y + 40}`;
            });
    }

    wrapText(text, width) {
        text.each(function() {
            const text = d3.select(this);
            const words = text.text().split(/\s+/).reverse();
            const lineHeight = 1.1;
            const y = text.attr('y');
            const dy = parseFloat(text.attr('dy') || 0);
            
            let tspan = text.text(null).append('tspan')
                .attr('x', text.attr('x'))
                .attr('y', y)
                .attr('dy', dy + 'em');
            
            let line = [];
            let lineNumber = 0;
            
            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(' '));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(' '));
                    line = [word];
                    tspan = text.append('tspan')
                        .attr('x', text.attr('x'))
                        .attr('dy', ++lineNumber * lineHeight + dy + 'em')
                        .text(word);
                }
            }
        });
    }

    addZoom() {
        const zoom = d3.zoom()
            .scaleExtent([0.5, 3])
            .on('zoom', (event) => {
                this.svg.selectAll('g').attr('transform', event.transform);
            });

        this.svg.call(zoom);
    }

    showPlaceholder() {
        this.svg.selectAll('*').remove();
        
        this.svg.append('text')
            .attr('x', this.width / 2)
            .attr('y', this.height / 2)
            .attr('text-anchor', 'middle')
            .attr('fill', '#888')
            .attr('font-size', '16px')
            .text('No diagram data available');
    }

    clearDiagram() {
        document.getElementById('sqlQuery').value = '';
        this.showPlaceholder();
    }
}

// Initialize the diagram generator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new DiagramGenerator();
});