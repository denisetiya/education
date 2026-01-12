// Geometry Canvas Types

export type ToolType = 
    | 'select'
    | 'point'
    | 'line'
    | 'segment'
    | 'ray'
    | 'triangle'
    | 'rectangle'
    | 'circle'
    | 'polygon'
    | 'measure_distance'
    | 'measure_angle'
    | 'transform'
    | 'function_graph'
    | 'pan';

export interface Point2D {
    x: number;
    y: number;
}

export interface GeometryObject {
    id: string;
    type: ToolType;
    points: Point2D[];
    color: string;
    strokeWidth: number;
    label?: string;
    data?: Record<string, unknown>; // For additional data like function expressions
}

export interface Measurement {
    id: string;
    type: 'distance' | 'angle';
    points: Point2D[];
    value: number;
    unit: string;
}

export interface FunctionExpression {
    id: string;
    expression: string;       // e.g., "x^2", "2*x+1", "sin(x)"
    displayName: string;      // e.g., "y = x²"
    color: string;
    visible: boolean;
}

export interface CanvasState {
    objects: GeometryObject[];
    measurements: Measurement[];
    functions: FunctionExpression[];
    selectedObjectId: string | null;
    currentTool: ToolType;
    zoom: number;
    pan: Point2D;
    gridEnabled: boolean;
    snapToGrid: boolean;
}

export interface HistoryState {
    past: CanvasState[];
    present: CanvasState;
    future: CanvasState[];
}
