import React, { useEffect, useRef, useState } from 'react';
import { Button, Tooltip, Space } from 'antd';
import { 
  ZoomInOutlined, 
  ZoomOutOutlined, 
  ExpandOutlined,
  ReloadOutlined,
  DownloadOutlined,
  SettingOutlined
} from '@ant-design/icons';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import coseBilkent from 'cytoscape-cose-bilkent';
import { FlowData } from '../types';

// Register Cytoscape extensions
cytoscape.use(dagre);
cytoscape.use(coseBilkent);

interface FlowVisualizationProps {
  data: FlowData;
}

const FlowVisualization: React.FC<FlowVisualizationProps> = ({ data }) => {
  const cyRef = useRef<HTMLDivElement>(null);
  const cyInstance = useRef<cytoscape.Core | null>(null);
  const [layout, setLayout] = useState<string>('dagre');

  useEffect(() => {
    if (!cyRef.current || !data) return;

    // Initialize Cytoscape
    const cy = cytoscape({
      container: cyRef.current,
      elements: [...data.nodes, ...data.edges],
      style: getCytoscapeStyles(),
      layout: getLayoutConfig(layout),
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: true,
      selectionType: 'single',
      minZoom: 0.1,
      maxZoom: 3,
    });

    cyInstance.current = cy;

    // Add event listeners
    cy.on('tap', 'node', (event) => {
      const node = event.target;
      const nodeData = node.data();
      
      // Highlight connected nodes
      const connectedEdges = node.connectedEdges();
      const connectedNodes = connectedEdges.connectedNodes();
      
      cy.elements().removeClass('highlighted');
      node.addClass('highlighted');
      connectedNodes.addClass('highlighted');
      connectedEdges.addClass('highlighted');
    });

    cy.on('tap', (event) => {
      if (event.target === cy) {
        cy.elements().removeClass('highlighted');
      }
    });

    // Fit to viewport
    cy.fit();
    cy.center();

    return () => {
      if (cyInstance.current) {
        cyInstance.current.destroy();
        cyInstance.current = null;
      }
    };
  }, [data, layout]);

  const getCytoscapeStyles = () => [
    // Default node style
    {
      selector: 'node',
      style: {
        'label': 'data(label)',
        'text-valign': 'center',
        'text-halign': 'center',
        'background-color': '#1890ff',
        'color': '#fff',
        'font-size': '12px',
        'font-weight': 'bold',
        'width': 'label',
        'height': 'label',
        'padding': '8px',
        'shape': 'roundrectangle',
        'border-width': 2,
        'border-color': '#fff',
        'text-wrap': 'wrap',
        'text-max-width': '120px',
        'overlay-opacity': 0,
      }
    },
    // Table nodes
    {
      selector: 'node[type="table"]',
      style: {
        'background-color': '#1890ff',
        'border-color': '#0050b3',
      }
    },
    // View nodes
    {
      selector: 'node[type="view"]',
      style: {
        'background-color': '#52c41a',
        'border-color': '#389e0d',
      }
    },
    // Source nodes
    {
      selector: 'node[type="source"]',
      style: {
        'background-color': '#fa8c16',
        'border-color': '#d46b08',
      }
    },
    // Target nodes
    {
      selector: 'node[type="target"]',
      style: {
        'background-color': '#f5222d',
        'border-color': '#cf1322',
      }
    },
    // Column nodes (smaller)
    {
      selector: 'node[nodeType="column"]',
      style: {
        'width': '80px',
        'height': '20px',
        'font-size': '10px',
        'background-color': '#f0f0f0',
        'color': '#666',
        'border-width': 1,
        'border-color': '#d9d9d9',
        'padding': '4px',
      }
    },
    // Default edge style
    {
      selector: 'edge',
      style: {
        'width': 2,
        'line-color': '#1890ff',
        'target-arrow-color': '#1890ff',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        'label': 'data(label)',
        'font-size': '10px',
        'text-background-color': '#fff',
        'text-background-opacity': 0.8,
        'text-background-padding': '2px',
        'text-border-width': 1,
        'text-border-color': '#ddd',
        'text-border-opacity': 0.8,
        'edge-text-rotation': 'autorotate',
        'overlay-opacity': 0,
      }
    },
    // Different edge types
    {
      selector: 'edge[type="join"]',
      style: {
        'line-color': '#1890ff',
        'target-arrow-color': '#1890ff',
      }
    },
    {
      selector: 'edge[type="insert"]',
      style: {
        'line-color': '#f5222d',
        'target-arrow-color': '#f5222d',
      }
    },
    {
      selector: 'edge[type="view_dependency"]',
      style: {
        'line-color': '#52c41a',
        'target-arrow-color': '#52c41a',
      }
    },
    {
      selector: 'edge[type="foreign_key"]',
      style: {
        'line-color': '#722ed1',
        'target-arrow-color': '#722ed1',
        'line-style': 'dashed',
      }
    },
    // Highlighted elements
    {
      selector: '.highlighted',
      style: {
        'z-index': 999,
      }
    },
    {
      selector: 'node.highlighted',
      style: {
        'border-width': 4,
        'border-color': '#faad14',
        'box-shadow': '0 0 20px #faad14',
      }
    },
    {
      selector: 'edge.highlighted',
      style: {
        'width': 4,
        'line-color': '#faad14',
        'target-arrow-color': '#faad14',
      }
    },
  ];

  const getLayoutConfig = (layoutName: string) => {
    const configs: Record<string, any> = {
      dagre: {
        name: 'dagre',
        rankDir: 'TB',
        align: 'UL',
        nodeSep: 50,
        edgeSep: 10,
        rankSep: 80,
        marginX: 20,
        marginY: 20,
        acyclicer: 'greedy',
        ranker: 'tight-tree',
        animate: true,
        animationDuration: 500,
      },
      'cose-bilkent': {
        name: 'cose-bilkent',
        animate: true,
        animationDuration: 1000,
        refresh: 30,
        fit: true,
        padding: 50,
        randomize: false,
        nodeRepulsion: 4500,
        idealEdgeLength: 100,
        edgeElasticity: 0.45,
        nestingFactor: 0.1,
        gravity: 0.25,
        numIter: 2500,
        tile: true,
        tilingPaddingVertical: 10,
        tilingPaddingHorizontal: 10,
      },
      circle: {
        name: 'circle',
        fit: true,
        padding: 30,
        boundingBox: undefined,
        avoidOverlap: true,
        nodeDimensionsIncludeLabels: false,
        spacingFactor: undefined,
        radius: undefined,
        startAngle: 3 / 2 * Math.PI,
        sweep: undefined,
        clockwise: true,
        sort: undefined,
        animate: true,
        animationDuration: 500,
      },
      grid: {
        name: 'grid',
        fit: true,
        padding: 30,
        boundingBox: undefined,
        avoidOverlap: true,
        avoidOverlapPadding: 10,
        nodeDimensionsIncludeLabels: false,
        spacingFactor: undefined,
        condense: false,
        rows: undefined,
        cols: undefined,
        position: () => ({}),
        sort: undefined,
        animate: true,
        animationDuration: 500,
      }
    };

    return configs[layoutName] || configs.dagre;
  };

  const handleZoomIn = () => {
    if (cyInstance.current) {
      cyInstance.current.zoom(cyInstance.current.zoom() * 1.25);
    }
  };

  const handleZoomOut = () => {
    if (cyInstance.current) {
      cyInstance.current.zoom(cyInstance.current.zoom() * 0.8);
    }
  };

  const handleFit = () => {
    if (cyInstance.current) {
      cyInstance.current.fit();
      cyInstance.current.center();
    }
  };

  const handleReset = () => {
    if (cyInstance.current) {
      cyInstance.current.elements().removeClass('highlighted');
      cyInstance.current.fit();
      cyInstance.current.center();
    }
  };

  const handleLayoutChange = (newLayout: string) => {
    setLayout(newLayout);
  };

  const handleExportImage = () => {
    if (cyInstance.current) {
      const png64 = cyInstance.current.png({
        output: 'blob',
        bg: '#ffffff',
        full: true,
        scale: 2,
      });
      
      const url = URL.createObjectURL(png64);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'sqlflow-diagram.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  if (!data || (!data.nodes.length && !data.edges.length)) {
    return (
      <div className="visualization-empty">
        <div>No data to visualize</div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Controls */}
      <div style={{
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 6,
        padding: 8,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      }}>
        <Space direction="vertical" size="small">
          <Space size="small">
            <Tooltip title="Zoom In">
              <Button size="small" icon={<ZoomInOutlined />} onClick={handleZoomIn} />
            </Tooltip>
            <Tooltip title="Zoom Out">
              <Button size="small" icon={<ZoomOutOutlined />} onClick={handleZoomOut} />
            </Tooltip>
            <Tooltip title="Fit to Screen">
              <Button size="small" icon={<ExpandOutlined />} onClick={handleFit} />
            </Tooltip>
            <Tooltip title="Reset View">
              <Button size="small" icon={<ReloadOutlined />} onClick={handleReset} />
            </Tooltip>
          </Space>
          <Space size="small">
            <Tooltip title="Export as PNG">
              <Button size="small" icon={<DownloadOutlined />} onClick={handleExportImage} />
            </Tooltip>
          </Space>
        </Space>
      </div>

      {/* Layout Controls */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 6,
        padding: 8,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      }}>
        <Space size="small">
          <Button 
            size="small" 
            type={layout === 'dagre' ? 'primary' : 'default'}
            onClick={() => handleLayoutChange('dagre')}
          >
            Hierarchical
          </Button>
          <Button 
            size="small" 
            type={layout === 'cose-bilkent' ? 'primary' : 'default'}
            onClick={() => handleLayoutChange('cose-bilkent')}
          >
            Force
          </Button>
          <Button 
            size="small" 
            type={layout === 'circle' ? 'primary' : 'default'}
            onClick={() => handleLayoutChange('circle')}
          >
            Circle
          </Button>
          <Button 
            size="small" 
            type={layout === 'grid' ? 'primary' : 'default'}
            onClick={() => handleLayoutChange('grid')}
          >
            Grid
          </Button>
        </Space>
      </div>

      {/* Legend */}
      <div style={{
        position: 'absolute',
        bottom: 10,
        left: 10,
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 6,
        padding: 12,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        fontSize: 12,
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: 8 }}>Legend</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 16, height: 16, backgroundColor: '#1890ff', borderRadius: 2 }}></div>
            <span>Table</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 16, height: 16, backgroundColor: '#52c41a', borderRadius: 2 }}></div>
            <span>View</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 16, height: 16, backgroundColor: '#fa8c16', borderRadius: 2 }}></div>
            <span>Source</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 16, height: 16, backgroundColor: '#f5222d', borderRadius: 2 }}></div>
            <span>Target</span>
          </div>
        </div>
      </div>

      {/* Cytoscape Container */}
      <div 
        ref={cyRef} 
        className="cytoscape-container"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default FlowVisualization;