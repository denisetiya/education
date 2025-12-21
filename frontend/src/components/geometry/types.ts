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

export interface CanvasState {
    objects: GeometryObject[];
    measurements: Measurement[];
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
