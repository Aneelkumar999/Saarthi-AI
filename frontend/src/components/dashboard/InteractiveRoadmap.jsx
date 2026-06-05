import { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const StepNode = ({ data }) => {
  const isCompleted = data.status === 'Completed' || data.status === 'Verified';
  const isActive = data.status === 'Ready' || data.status === 'In Progress';
  
  return (
    <div className={`px-4 py-3 shadow-lg rounded-xl border-2 min-w-[200px] transition-all duration-300 ${
      isCompleted ? 'bg-green-50 border-green-200' : 
      isActive ? 'bg-navy-50 border-saffron-400 scale-105' : 
      'bg-white border-navy-100 opacity-80'
    }`}>
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-navy-200" />
      
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-navy-400">Step {data.id}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
            isCompleted ? 'bg-green-200 text-green-700' : 
            isActive ? 'bg-saffron-100 text-saffron-700' : 
            'bg-navy-100 text-navy-600'
          }`}>
            {data.status}
          </span>
        </div>
        <h3 className="text-sm font-bold text-navy-900 leading-tight mb-1">{data.title}</h3>
        <p className="text-[11px] text-navy-500 font-medium">{data.dept}</p>
        
        {data.days && (
          <div className="mt-2 flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-navy-300"></div>
            <span className="text-[10px] text-navy-400">{data.days}</span>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-navy-200" />
    </div>
  );
};

const nodeTypes = {
  step: StepNode,
};

export default function InteractiveRoadmap({ steps = [] }) {
  const { nodes, edges } = useMemo(() => {
    // Ensure each step has an ID, use index as fallback
    const processedSteps = steps.map((s, i) => ({
      ...s,
      id: s.id || s.step_order || (i + 1),
      title: s.title || s.name || 'Step',
      dept: s.dept || s.department || 'Government'
    }));

    const initialNodes = processedSteps.map((step, index) => ({
      id: `step-${step.id}`,
      type: 'step',
      position: { x: 250, y: index * 150 + 50 },
      data: { ...step },
    }));

    const initialEdges = processedSteps.slice(0, -1).map((step, index) => ({
      id: `edge-${step.id}-${processedSteps[index + 1].id}`,
      source: `step-${step.id}`,
      target: `step-${processedSteps[index + 1].id}`,
      animated: processedSteps[index + 1].status === 'Ready' || processedSteps[index + 1].status === 'In Progress',
      style: { stroke: '#1e3a8a', strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#1e3a8a',
      },
    }));

    return { nodes: initialNodes, edges: initialEdges };
  }, [steps]);

  if (!steps || steps.length === 0) return null;

  return (
    <div className="h-[500px] w-full bg-navy-50/30 rounded-2xl border border-navy-100 overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        draggable={false}
        nodesConnectable={false}
        nodesDraggable={true}
        zoomOnScroll={false}
      >
        <Background color="#cbd5e1" gap={20} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
