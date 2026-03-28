import React, { useRef, useState, useEffect, useCallback, useImperativeHandle } from 'react';
import {
    MousePointer, Circle, Square, Triangle, Minus, Move,
    Undo2, Redo2, Trash2, Grid, ZoomIn, ZoomOut, Download,
    Ruler, CornerUpRight, PenTool, RotateCcw, Plus, X, Eye, EyeOff, FunctionSquare
} from 'lucide-react';
import type { ToolType, Point2D, GeometryObject, Measurement, CanvasState, FunctionExpression } from './types';

interface GeometryCanvasProps {
    width?: number;
    height?: number;
    onSave?: (data: CanvasState) => void;
    initialState?: CanvasState;
    readOnly?: boolean;
    showToolbar?: boolean;
    showFunctionPanel?: boolean;
    hideFunctionExpressions?: boolean;
    showCoordinates?: boolean;
    compactMode?: boolean;
    allowedTools?: ToolType[];
}

export interface GeometryCanvasHandle {
    getState: () => CanvasState;
}

const COLORS = ['#6366f1', '#ef4444', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'];
const FUNCTION_COLORS = ['#e11d48', '#0891b2', '#7c3aed', '#ea580c', '#16a34a', '#2563eb'];
const GRID_SIZE = 20;
const UNIT_SCALE = 40; // pixels per unit for coordinate system

const initialState: CanvasState = {
    objects: [],
    measurements: [],
    functions: [],
    selectedObjectId: null,
    currentTool: 'select',
    zoom: 1,
    pan: { x: 0, y: 0 },
    gridEnabled: true,
    snapToGrid: true
};

const mergeCanvasState = (savedState?: CanvasState): CanvasState => {
    if (!savedState) {
        return initialState;
    }

    return {
        ...initialState,
        ...savedState,
        objects: savedState.objects || [],
        measurements: savedState.measurements || [],
        functions: savedState.functions || []
    };
};

const getCanvasStateSignature = (canvasState?: CanvasState) =>
    JSON.stringify(mergeCanvasState(canvasState));

export const GeometryCanvas = React.forwardRef<GeometryCanvasHandle, GeometryCanvasProps>(({
    width = 800,
    height = 600,
    onSave,
    initialState: savedState,
    readOnly = false,
    showToolbar = true,
    showFunctionPanel = true,
    hideFunctionExpressions = false,
    showCoordinates = true,
    compactMode = false,
    allowedTools
}, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [state, setState] = useState<CanvasState>(() => mergeCanvasState(savedState));
    const [history, setHistory] = useState<{ past: CanvasState[]; future: CanvasState[] }>({ past: [], future: [] });
    const [isDrawing, setIsDrawing] = useState(false);
    const [tempPoints, setTempPoints] = useState<Point2D[]>([]);
    const [currentColor, setCurrentColor] = useState(COLORS[0]);
    const [mousePos, setMousePos] = useState<Point2D>({ x: 0, y: 0 });
    const [isMobile, setIsMobile] = useState(false);
    const [canvasWidth, setCanvasWidth] = useState(width);
    const [canvasHeight, setCanvasHeight] = useState(height);
    
    // Formula input state
    const [formulaInput, setFormulaInput] = useState('');
    const [formulaError, setFormulaError] = useState<string | null>(null);
    const buttonSize = compactMode ? 36 : 44;
    const iconSize = compactMode ? 18 : 20;
    const colorSwatchSize = compactMode ? 24 : 28;
    const onSaveRef = useRef<typeof onSave>(onSave);
    const lastExternalStateSignatureRef = useRef(getCanvasStateSignature(savedState));
    const stateSignature = getCanvasStateSignature(state);

    useImperativeHandle(ref, () => ({
        getState: () => state
    }), [state]);

    useEffect(() => {
        onSaveRef.current = onSave;
    }, [onSave]);

    useEffect(() => {
        const nextSignature = getCanvasStateSignature(savedState);
        if (nextSignature === lastExternalStateSignatureRef.current || nextSignature === stateSignature) {
            lastExternalStateSignatureRef.current = nextSignature;
            return;
        }

        lastExternalStateSignatureRef.current = nextSignature;
        setState(mergeCanvasState(savedState));
        setHistory({ past: [], future: [] });
    }, [savedState, stateSignature]);

    useEffect(() => {
        lastExternalStateSignatureRef.current = stateSignature;

        if (!onSaveRef.current) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            onSaveRef.current?.(state);
        }, 120);

        return () => window.clearTimeout(timeoutId);
    }, [state, stateSignature]);

    // Check for mobile and sync canvas dimensions with props
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile && containerRef.current) {
                setCanvasWidth(containerRef.current.clientWidth - 32 || 400);
                setCanvasHeight(400);
            } else {
                setCanvasWidth(width);
                setCanvasHeight(height);
            }
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, [width, height]);

    // Snap to grid helper
    const snapToGrid = useCallback((point: Point2D): Point2D => {
        if (!state.snapToGrid) return point;
        return {
            x: Math.round(point.x / GRID_SIZE) * GRID_SIZE,
            y: Math.round(point.y / GRID_SIZE) * GRID_SIZE
        };
    }, [state.snapToGrid]);

    // Convert screen to canvas coordinates
    const screenToCanvas = useCallback((clientX: number, clientY: number): Point2D => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const x = (clientX - rect.left - state.pan.x) / state.zoom;
        const y = (clientY - rect.top - state.pan.y) / state.zoom;
        return snapToGrid({ x, y });
    }, [state.pan, state.zoom, snapToGrid]);

    // Save state for undo
    const saveToHistory = useCallback(() => {
        setHistory(prev => ({
            past: [...prev.past.slice(-50), state],
            future: []
        }));
    }, [state]);

    // Undo
    const undo = useCallback(() => {
        if (history.past.length === 0) return;
        const previous = history.past[history.past.length - 1];
        setHistory(prev => ({
            past: prev.past.slice(0, -1),
            future: [state, ...prev.future]
        }));
        setState(previous);
    }, [history.past, state]);

    // Redo
    const redo = useCallback(() => {
        if (history.future.length === 0) return;
        const next = history.future[0];
        setHistory(prev => ({
            past: [...prev.past, state],
            future: prev.future.slice(1)
        }));
        setState(next);
    }, [history.future, state]);

    // Generate unique ID
    const generateId = () => `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Calculate distance between two points
    const getDistance = (p1: Point2D, p2: Point2D): number => {
        return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    };

    // Calculate angle between three points (in degrees)
    const getAngle = (p1: Point2D, vertex: Point2D, p2: Point2D): number => {
        const angle1 = Math.atan2(p1.y - vertex.y, p1.x - vertex.x);
        const angle2 = Math.atan2(p2.y - vertex.y, p2.x - vertex.x);
        let angle = Math.abs(angle1 - angle2) * (180 / Math.PI);
        if (angle > 180) angle = 360 - angle;
        return angle;
    };

    // Parse and evaluate math expression safely
    const evaluateExpression = (expr: string, x: number): number | null => {
        try {
            // Sanitize and prepare expression
            const sanitized = expr
                .replace(/\^/g, '**')           // Power operator
                .replace(/sin/g, 'Math.sin')
                .replace(/cos/g, 'Math.cos')
                .replace(/tan/g, 'Math.tan')
                .replace(/sqrt/g, 'Math.sqrt')
                .replace(/abs/g, 'Math.abs')
                .replace(/log/g, 'Math.log')
                .replace(/pi/gi, 'Math.PI')
                .replace(/e(?![a-z])/gi, 'Math.E');
            
            // Create function and evaluate
            const fn = new Function('x', `return ${sanitized}`);
            const result = fn(x);
            
            if (typeof result === 'number' && isFinite(result)) {
                return result;
            }
            return null;
        } catch {
            return null;
        }
    };

    // Add a new function to the canvas
    const addFunction = () => {
        if (readOnly) return;
        if (!formulaInput.trim()) return;
        
        // Parse expression (remove "y =" if present)
        let expr = formulaInput.trim();
        if (expr.toLowerCase().startsWith('y')) {
            expr = expr.replace(/^y\s*=\s*/i, '');
        }
        
        // Test if expression is valid
        const testResult = evaluateExpression(expr, 1);
        if (testResult === null) {
            setFormulaError('Rumus tidak valid');
            return;
        }
        
        // Create display name with nicer formatting
        const displayName = `y = ${formulaInput.trim().replace(/^y\s*=\s*/i, '')}`;
        
        const newFunc: FunctionExpression = {
            id: generateId(),
            expression: expr,
            displayName,
            color: FUNCTION_COLORS[state.functions.length % FUNCTION_COLORS.length],
            visible: true
        };
        
        saveToHistory();
        setState(prev => ({
            ...prev,
            functions: [...prev.functions, newFunc]
        }));
        setFormulaInput('');
        setFormulaError(null);
    };

    // Toggle function visibility
    const toggleFunctionVisibility = (id: string) => {
        if (readOnly) return;
        setState(prev => ({
            ...prev,
            functions: prev.functions.map(f => 
                f.id === id ? { ...f, visible: !f.visible } : f
            )
        }));
    };

    // Remove function
    const removeFunction = (id: string) => {
        if (readOnly) return;
        saveToHistory();
        setState(prev => ({
            ...prev,
            functions: prev.functions.filter(f => f.id !== id)
        }));
    };

    // Handle mouse/touch down
    const handlePointerDown = (e: React.PointerEvent) => {
        if (readOnly) {
            return;
        }

        const point = screenToCanvas(e.clientX, e.clientY);
        setMousePos(point);

        if (state.currentTool === 'pan') {
            setIsDrawing(true);
            return;
        }

        if (state.currentTool === 'select') {
            // Find clicked object
            // Simple hit detection - can be improved
            return;
        }

        // Drawing tools
        if (['point', 'line', 'segment', 'ray', 'circle', 'rectangle'].includes(state.currentTool)) {
            setIsDrawing(true);
            setTempPoints([point]);
        }

        // Multi-point tools
        if (['triangle', 'polygon', 'measure_distance', 'measure_angle'].includes(state.currentTool)) {
            setTempPoints(prev => [...prev, point]);
        }
    };

    // Handle mouse/touch move
    const handlePointerMove = (e: React.PointerEvent) => {
        const point = screenToCanvas(e.clientX, e.clientY);
        setMousePos(point);

        if (readOnly) {
            return;
        }

        if (isDrawing && state.currentTool === 'pan') {
            setState(prev => ({
                ...prev,
                pan: {
                    x: prev.pan.x + e.movementX,
                    y: prev.pan.y + e.movementY
                }
            }));
            return;
        }

        if (isDrawing && tempPoints.length > 0) {
            // Update preview
        }
    };

    // Handle mouse/touch up
    const handlePointerUp = () => {
        if (readOnly) {
            return;
        }

        if (!isDrawing && tempPoints.length === 0) return;

        const tool = state.currentTool;

        // Single-click tools that need two points
        if (['line', 'segment', 'ray', 'circle', 'rectangle'].includes(tool) && tempPoints.length >= 1) {
            const newObject: GeometryObject = {
                id: generateId(),
                type: tool,
                points: [...tempPoints, mousePos],
                color: currentColor,
                strokeWidth: 2
            };
            saveToHistory();
            setState(prev => ({
                ...prev,
                objects: [...prev.objects, newObject]
            }));
        }

        // Point tool
        if (tool === 'point' && tempPoints.length >= 1) {
            const newObject: GeometryObject = {
                id: generateId(),
                type: 'point',
                points: tempPoints,
                color: currentColor,
                strokeWidth: 2
            };
            saveToHistory();
            setState(prev => ({
                ...prev,
                objects: [...prev.objects, newObject]
            }));
        }

        // Triangle (needs 3 points)
        if (tool === 'triangle' && tempPoints.length >= 3) {
            const newObject: GeometryObject = {
                id: generateId(),
                type: 'triangle',
                points: tempPoints.slice(0, 3),
                color: currentColor,
                strokeWidth: 2
            };
            saveToHistory();
            setState(prev => ({
                ...prev,
                objects: [...prev.objects, newObject]
            }));
            setTempPoints([]);
            return;
        }

        // Measure Distance
        if (tool === 'measure_distance' && tempPoints.length >= 2) {
            const dist = getDistance(tempPoints[0], tempPoints[1]);
            const newMeasurement: Measurement = {
                id: generateId(),
                type: 'distance',
                points: tempPoints.slice(0, 2),
                value: Math.round(dist * 10) / 10,
                unit: 'units'
            };
            saveToHistory();
            setState(prev => ({
                ...prev,
                measurements: [...prev.measurements, newMeasurement]
            }));
            setTempPoints([]);
            return;
        }

        // Measure Angle
        if (tool === 'measure_angle' && tempPoints.length >= 3) {
            const angle = getAngle(tempPoints[0], tempPoints[1], tempPoints[2]);
            const newMeasurement: Measurement = {
                id: generateId(),
                type: 'angle',
                points: tempPoints.slice(0, 3),
                value: Math.round(angle * 10) / 10,
                unit: '°'
            };
            saveToHistory();
            setState(prev => ({
                ...prev,
                measurements: [...prev.measurements, newMeasurement]
            }));
            setTempPoints([]);
            return;
        }

        setIsDrawing(false);
        if (!['triangle', 'polygon', 'measure_distance', 'measure_angle'].includes(tool)) {
            setTempPoints([]);
        }
    };

    // Draw canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.translate(state.pan.x, state.pan.y);
        ctx.scale(state.zoom, state.zoom);

        // Draw grid
        if (state.gridEnabled) {
            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 1 / state.zoom;
            const startX = -state.pan.x / state.zoom;
            const startY = -state.pan.y / state.zoom;
            const endX = (canvas.width - state.pan.x) / state.zoom;
            const endY = (canvas.height - state.pan.y) / state.zoom;

            for (let x = Math.floor(startX / GRID_SIZE) * GRID_SIZE; x < endX; x += GRID_SIZE) {
                ctx.beginPath();
                ctx.moveTo(x, startY);
                ctx.lineTo(x, endY);
                ctx.stroke();
            }
            for (let y = Math.floor(startY / GRID_SIZE) * GRID_SIZE; y < endY; y += GRID_SIZE) {
                ctx.beginPath();
                ctx.moveTo(startX, y);
                ctx.lineTo(endX, y);
                ctx.stroke();
            }
        }

        // Draw objects
        state.objects.forEach(obj => {
            ctx.strokeStyle = obj.color;
            ctx.fillStyle = obj.color;
            ctx.lineWidth = obj.strokeWidth;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            switch (obj.type) {
                case 'point':
                    obj.points.forEach(p => {
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
                        ctx.fill();
                    });
                    break;

                case 'line':
                case 'segment':
                    if (obj.points.length >= 2) {
                        ctx.beginPath();
                        ctx.moveTo(obj.points[0].x, obj.points[0].y);
                        ctx.lineTo(obj.points[1].x, obj.points[1].y);
                        ctx.stroke();
                        // Draw endpoints for segment
                        if (obj.type === 'segment') {
                            obj.points.forEach(p => {
                                ctx.beginPath();
                                ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
                                ctx.fill();
                            });
                        }
                    }
                    break;

                case 'circle':
                    if (obj.points.length >= 2) {
                        const radius = getDistance(obj.points[0], obj.points[1]);
                        ctx.beginPath();
                        ctx.arc(obj.points[0].x, obj.points[0].y, radius, 0, Math.PI * 2);
                        ctx.stroke();
                        // Center point
                        ctx.beginPath();
                        ctx.arc(obj.points[0].x, obj.points[0].y, 3, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    break;

                case 'rectangle':
                    if (obj.points.length >= 2) {
                        const w = obj.points[1].x - obj.points[0].x;
                        const h = obj.points[1].y - obj.points[0].y;
                        ctx.strokeRect(obj.points[0].x, obj.points[0].y, w, h);
                    }
                    break;

                case 'triangle':
                    if (obj.points.length >= 3) {
                        ctx.beginPath();
                        ctx.moveTo(obj.points[0].x, obj.points[0].y);
                        ctx.lineTo(obj.points[1].x, obj.points[1].y);
                        ctx.lineTo(obj.points[2].x, obj.points[2].y);
                        ctx.closePath();
                        ctx.stroke();
                        // Vertices
                        obj.points.forEach(p => {
                            ctx.beginPath();
                            ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
                            ctx.fill();
                        });
                    }
                    break;
            }
        });

        // Draw measurements
        state.measurements.forEach(m => {
            ctx.strokeStyle = '#dc2626';
            ctx.fillStyle = '#dc2626';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([5, 5]);

            if (m.type === 'distance' && m.points.length >= 2) {
                ctx.beginPath();
                ctx.moveTo(m.points[0].x, m.points[0].y);
                ctx.lineTo(m.points[1].x, m.points[1].y);
                ctx.stroke();

                // Label
                const midX = (m.points[0].x + m.points[1].x) / 2;
                const midY = (m.points[0].y + m.points[1].y) / 2;
                ctx.setLineDash([]);
                ctx.font = `${14 / state.zoom}px sans-serif`;
                ctx.fillText(`${m.value} ${m.unit}`, midX + 5, midY - 5);
            }

            if (m.type === 'angle' && m.points.length >= 3) {
                // Draw angle arc
                const vertex = m.points[1];
                ctx.setLineDash([]);
                ctx.beginPath();
                const angle1 = Math.atan2(m.points[0].y - vertex.y, m.points[0].x - vertex.x);
                const angle2 = Math.atan2(m.points[2].y - vertex.y, m.points[2].x - vertex.x);
                ctx.arc(vertex.x, vertex.y, 30, angle1, angle2);
                ctx.stroke();

                // Label
                ctx.font = `${14 / state.zoom}px sans-serif`;
                ctx.fillText(`${m.value}${m.unit}`, vertex.x + 35, vertex.y);
            }

            ctx.setLineDash([]);
        });

        // Draw coordinate axes when functions are present
        if (state.functions.length > 0) {
            ctx.strokeStyle = '#475569';
            ctx.fillStyle = '#475569';
            ctx.lineWidth = 2 / state.zoom;
            ctx.setLineDash([]);
            
            const axisOriginX = canvasWidth / 2 + state.pan.x;
            const axisOriginY = canvasHeight / 2 + state.pan.y;
            
            // Draw X axis
            ctx.beginPath();
            ctx.moveTo(-canvasWidth, axisOriginY / state.zoom - state.pan.y / state.zoom);
            ctx.lineTo(canvasWidth * 2, axisOriginY / state.zoom - state.pan.y / state.zoom);
            ctx.stroke();
            
            // Draw Y axis
            ctx.beginPath();
            ctx.moveTo(axisOriginX / state.zoom - state.pan.x / state.zoom, -canvasHeight);
            ctx.lineTo(axisOriginX / state.zoom - state.pan.x / state.zoom, canvasHeight * 2);
            ctx.stroke();
            
            // Draw axis labels
            ctx.font = `bold ${12 / state.zoom}px sans-serif`;
            const originX = (canvasWidth / 2) / state.zoom;
            const originY = (canvasHeight / 2) / state.zoom;
            ctx.fillText('x', originX + (canvasWidth / 2 - 20) / state.zoom, originY + 15 / state.zoom);
            ctx.fillText('y', originX + 10 / state.zoom, originY - (canvasHeight / 2 - 20) / state.zoom);
            ctx.fillText('0', originX + 5 / state.zoom, originY + 15 / state.zoom);
            
            // Draw tick marks and numbers
            ctx.font = `${10 / state.zoom}px sans-serif`;
            ctx.lineWidth = 1 / state.zoom;
            for (let i = -10; i <= 10; i++) {
                if (i === 0) continue;
                const xPos = originX + (i * UNIT_SCALE) / state.zoom;
                const yPos = originY - (i * UNIT_SCALE) / state.zoom;
                
                // X axis ticks
                ctx.beginPath();
                ctx.moveTo(xPos, originY - 4 / state.zoom);
                ctx.lineTo(xPos, originY + 4 / state.zoom);
                ctx.stroke();
                ctx.fillText(String(i), xPos - 4 / state.zoom, originY + 15 / state.zoom);
                
                // Y axis ticks
                ctx.beginPath();
                ctx.moveTo(originX - 4 / state.zoom, yPos);
                ctx.lineTo(originX + 4 / state.zoom, yPos);
                ctx.stroke();
                ctx.fillText(String(i), originX + 8 / state.zoom, yPos + 3 / state.zoom);
            }
        }

        // Draw function graphs
        (state.functions || []).forEach(fn => {
            if (!fn.visible) return;
            
            ctx.strokeStyle = fn.color;
            ctx.lineWidth = 2.5 / state.zoom;
            ctx.setLineDash([]);
            ctx.beginPath();
            
            const originX = (canvasWidth / 2) / state.zoom;
            const originY = (canvasHeight / 2) / state.zoom;
            
            let firstPoint = true;
            // Draw from -10 to 10 in math coordinates
            for (let mathX = -15; mathX <= 15; mathX += 0.05) {
                const mathY = evaluateExpression(fn.expression, mathX);
                if (mathY === null || !isFinite(mathY) || Math.abs(mathY) > 100) {
                    firstPoint = true;
                    continue;
                }
                
                // Convert math coordinates to canvas coordinates
                const canvasX = originX + (mathX * UNIT_SCALE) / state.zoom;
                const canvasY = originY - (mathY * UNIT_SCALE) / state.zoom;
                
                if (firstPoint) {
                    ctx.moveTo(canvasX, canvasY);
                    firstPoint = false;
                } else {
                    ctx.lineTo(canvasX, canvasY);
                }
            }
            ctx.stroke();
        });

        // Draw temp points (preview)
        if (tempPoints.length > 0) {
            ctx.strokeStyle = currentColor;
            ctx.fillStyle = currentColor;
            ctx.globalAlpha = 0.5;
            
            tempPoints.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
                ctx.fill();
            });

            // Preview line to mouse
            if (isDrawing || ['triangle', 'polygon', 'measure_distance', 'measure_angle'].includes(state.currentTool)) {
                ctx.beginPath();
                ctx.moveTo(tempPoints[tempPoints.length - 1].x, tempPoints[tempPoints.length - 1].y);
                ctx.lineTo(mousePos.x, mousePos.y);
                ctx.stroke();
            }

            ctx.globalAlpha = 1;
        }

        ctx.restore();
    }, [state, tempPoints, mousePos, isDrawing, currentColor, canvasWidth, canvasHeight]);

    // Clear all
    const clearAll = () => {
        if (readOnly) return;
        saveToHistory();
        setState(prev => ({
            ...prev,
            objects: [],
            measurements: []
        }));
    };

    // Export as image
    const exportImage = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = 'geometry-canvas.png';
        link.href = canvas.toDataURL();
        link.click();
    };

    // Render tool button helper
    const renderToolButton = (tool: ToolType, icon: React.ReactNode, label: string) => (
        <button
            key={tool}
            disabled={readOnly}
            onClick={() => setState(prev => ({ ...prev, currentTool: tool }))}
            title={label}
            style={{
                width: `${buttonSize}px`,
                height: `${buttonSize}px`,
                background: state.currentTool === tool ? '#eff6ff' : 'transparent',
                color: state.currentTool === tool ? '#3b82f6' : '#64748b',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: readOnly ? 'not-allowed' : 'pointer',
                opacity: readOnly ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
            }}
        >
            {icon}
        </button>
    );

    return (
        <div ref={containerRef} style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: compactMode ? '0.75rem' : '1rem',
            background: '#f8fafc',
            borderRadius: '1rem',
            padding: compactMode ? '0.75rem' : '1rem',
            width: '100%',
            maxWidth: '100%',
            overflow: 'hidden'
        }}>
            {/* Toolbar */}
            {showToolbar && (
                <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'row' : 'column',
                gap: compactMode ? '0.375rem' : '0.5rem',
                flexWrap: 'wrap',
                justifyContent: isMobile ? 'center' : 'flex-start'
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'row' : 'column',
                    gap: '0.25rem',
                    padding: compactMode ? '0.375rem' : '0.5rem',
                    background: 'white',
                    borderRadius: '0.75rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    {(!allowedTools || allowedTools.includes('select')) && renderToolButton('select', <MousePointer size={iconSize} />, 'Select')}
                    {(!allowedTools || allowedTools.includes('pan')) && renderToolButton('pan', <Move size={iconSize} />, 'Pan')}
                </div>

                <div style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'row' : 'column',
                    gap: '0.25rem',
                    padding: compactMode ? '0.375rem' : '0.5rem',
                    background: 'white',
                    borderRadius: '0.75rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    {(!allowedTools || allowedTools.includes('point')) && renderToolButton('point', <PenTool size={iconSize} />, 'Point')}
                    {(!allowedTools || allowedTools.includes('segment')) && renderToolButton('segment', <Minus size={iconSize} />, 'Segment')}
                    {(!allowedTools || allowedTools.includes('circle')) && renderToolButton('circle', <Circle size={iconSize} />, 'Circle')}
                    {(!allowedTools || allowedTools.includes('rectangle')) && renderToolButton('rectangle', <Square size={iconSize} />, 'Rectangle')}
                    {(!allowedTools || allowedTools.includes('triangle')) && renderToolButton('triangle', <Triangle size={iconSize} />, 'Triangle')}
                </div>

                <div style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'row' : 'column',
                    gap: '0.25rem',
                    padding: compactMode ? '0.375rem' : '0.5rem',
                    background: 'white',
                    borderRadius: '0.75rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    {(!allowedTools || allowedTools.includes('measure_distance')) && renderToolButton('measure_distance', <Ruler size={iconSize} />, 'Measure Distance')}
                    {(!allowedTools || allowedTools.includes('measure_angle')) && renderToolButton('measure_angle', <CornerUpRight size={iconSize} />, 'Measure Angle')}
                </div>

                {/* Colors */}
                <div style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'row' : 'column',
                    gap: '0.25rem',
                    padding: compactMode ? '0.375rem' : '0.5rem',
                    background: 'white',
                    borderRadius: '0.75rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    {COLORS.map(color => (
                        <button
                            key={color}
                            disabled={readOnly}
                            onClick={() => setCurrentColor(color)}
                            style={{
                                width: `${colorSwatchSize}px`,
                                height: `${colorSwatchSize}px`,
                                borderRadius: '50%',
                                border: currentColor === color ? '3px solid #1e293b' : '2px solid #e2e8f0',
                                background: color,
                                cursor: readOnly ? 'not-allowed' : 'pointer',
                                opacity: readOnly ? 0.5 : 1
                            }}
                        />
                    ))}
                </div>

                {/* Actions */}
                <div style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'row' : 'column',
                    gap: '0.25rem',
                    padding: compactMode ? '0.375rem' : '0.5rem',
                    background: 'white',
                    borderRadius: '0.75rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <button onClick={undo} disabled={history.past.length === 0} title="Undo"
                        style={{ width: `${buttonSize}px`, height: `${buttonSize}px`, borderRadius: '0.5rem', border: 'none', background: 'white', color: history.past.length === 0 ? '#cbd5e1' : '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Undo2 size={iconSize} />
                    </button>
                    <button onClick={redo} disabled={history.future.length === 0} title="Redo"
                        style={{ width: `${buttonSize}px`, height: `${buttonSize}px`, borderRadius: '0.5rem', border: 'none', background: 'white', color: history.future.length === 0 ? '#cbd5e1' : '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Redo2 size={iconSize} />
                    </button>
                    <button onClick={clearAll} title="Clear All"
                        style={{ width: `${buttonSize}px`, height: `${buttonSize}px`, borderRadius: '0.5rem', border: 'none', background: 'white', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trash2 size={iconSize} />
                    </button>
                    <button onClick={exportImage} title="Export"
                        style={{ width: `${buttonSize}px`, height: `${buttonSize}px`, borderRadius: '0.5rem', border: 'none', background: 'white', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Download size={iconSize} />
                    </button>
                </div>

                {/* Zoom */}
                <div style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'row' : 'column',
                    gap: '0.25rem',
                    padding: compactMode ? '0.375rem' : '0.5rem',
                    background: 'white',
                    borderRadius: '0.75rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <button onClick={() => setState(prev => ({ ...prev, zoom: Math.min(prev.zoom * 1.2, 3) }))} title="Zoom In"
                        style={{ width: `${buttonSize}px`, height: `${buttonSize}px`, borderRadius: '0.5rem', border: 'none', background: 'white', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ZoomIn size={iconSize} />
                    </button>
                    <button onClick={() => setState(prev => ({ ...prev, zoom: Math.max(prev.zoom / 1.2, 0.3) }))} title="Zoom Out"
                        style={{ width: `${buttonSize}px`, height: `${buttonSize}px`, borderRadius: '0.5rem', border: 'none', background: 'white', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ZoomOut size={iconSize} />
                    </button>
                    <button onClick={() => setState(prev => ({ ...prev, zoom: 1, pan: { x: 0, y: 0 } }))} title="Reset View"
                        style={{ width: `${buttonSize}px`, height: `${buttonSize}px`, borderRadius: '0.5rem', border: 'none', background: 'white', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <RotateCcw size={iconSize} />
                    </button>
                </div>

                {/* Grid toggle */}
                <button
                    onClick={() => setState(prev => ({ ...prev, gridEnabled: !prev.gridEnabled }))}
                    title="Toggle Grid"
                    style={{
                        width: `${buttonSize}px`,
                        height: `${buttonSize}px`,
                        borderRadius: '0.5rem',
                        border: 'none',
                        background: state.gridEnabled ? 'var(--primary)' : 'white',
                        color: state.gridEnabled ? 'white' : '#64748b',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                >
                    <Grid size={iconSize} />
                </button>
                </div>
            )}

            {/* Canvas */}
            <div style={{
                flex: 1,
                background: 'white',
                borderRadius: '0.75rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                position: 'relative'
            }}>
                <canvas
                    ref={canvasRef}
                    width={canvasWidth}
                    height={canvasHeight}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                    style={{
                        display: 'block',
                        width: '100%',
                        height: `${canvasHeight}px`,
                        touchAction: 'none',
                        cursor: readOnly ? 'default' : state.currentTool === 'pan' ? 'grab' : 'crosshair'
                    }}
                />

                {/* Coordinates display */}
                {showCoordinates && (
                    <div style={{
                    position: 'absolute',
                    bottom: '0.5rem',
                    right: '0.5rem',
                    background: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem',
                    fontFamily: 'monospace'
                }}>
                    ({Math.round(mousePos.x)}, {Math.round(mousePos.y)}) | Zoom: {Math.round(state.zoom * 100)}%
                    </div>
                )}
            </div>

            {/* Formula Input Panel */}
            {showFunctionPanel && (
                <div style={{
                    width: isMobile ? '100%' : compactMode ? '240px' : '280px',
                    background: 'white',
                    borderRadius: '0.75rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    padding: compactMode ? '0.85rem' : '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    maxHeight: isMobile ? '300px' : 'auto',
                    overflow: 'auto'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FunctionSquare size={compactMode ? 18 : 20} color="var(--primary)" />
                        <h3 style={{ fontWeight: '600', fontSize: '0.9rem', color: '#1e293b' }}>Grafik Fungsi</h3>
                    </div>

                    {!readOnly && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                value={formulaInput}
                                onChange={(e) => setFormulaInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addFunction()}
                                placeholder="y = x^2"
                                style={{
                                    flex: 1,
                                    padding: '0.5rem 0.75rem',
                                    borderRadius: '0.5rem',
                                    border: '2px solid #e2e8f0',
                                    fontSize: '0.9rem',
                                    outline: 'none',
                                    fontFamily: 'monospace'
                                }}
                            />
                            <button
                                onClick={addFunction}
                                style={{
                                    width: compactMode ? '32px' : '36px',
                                    height: compactMode ? '32px' : '36px',
                                    borderRadius: '0.5rem',
                                    border: 'none',
                                    background: 'var(--primary)',
                                    color: 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    )}

                    {formulaError && (
                        <div style={{
                            padding: '0.5rem',
                            background: '#fef2f2',
                            borderRadius: '0.5rem',
                            fontSize: '0.8rem',
                            color: '#dc2626'
                        }}>
                            {formulaError}
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {(state.functions || []).length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '1rem',
                                color: '#94a3b8',
                                fontSize: '0.85rem'
                            }}>
                                Masukkan rumus di atas<br />
                                <span style={{ fontSize: '0.75rem' }}>
                                    Contoh: x^2, sin(x), 2*x+1
                                </span>
                            </div>
                        ) : hideFunctionExpressions ? (
                            <div style={{
                                padding: '0.75rem',
                                borderRadius: '0.75rem',
                                background: '#f8fafc',
                                color: '#475569',
                                fontSize: '0.82rem',
                                lineHeight: 1.6
                            }}>
                                Grafik aktif sebagai petunjuk visual.
                                Rumus fungsi disembunyikan sesuai pengaturan guru.
                            </div>
                        ) : (
                            (state.functions || []).map(fn => (
                                <div
                                    key={fn.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.5rem',
                                        background: '#f8fafc',
                                        borderRadius: '0.5rem',
                                        borderLeft: `4px solid ${fn.color}`
                                    }}
                                >
                                    <button
                                        disabled={readOnly}
                                        onClick={() => toggleFunctionVisibility(fn.id)}
                                        style={{
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '0.375rem',
                                            border: 'none',
                                            background: 'white',
                                            cursor: readOnly ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: fn.visible ? '#64748b' : '#cbd5e1'
                                        }}
                                    >
                                        {fn.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                                    </button>
                                    <span style={{
                                        flex: 1,
                                        fontFamily: 'monospace',
                                        fontSize: '0.85rem',
                                        color: fn.visible ? '#1e293b' : '#94a3b8',
                                        textDecoration: fn.visible ? 'none' : 'line-through'
                                    }}>
                                        {fn.displayName}
                                    </span>
                                    <button
                                        disabled={readOnly}
                                        onClick={() => removeFunction(fn.id)}
                                        style={{
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '0.375rem',
                                            border: 'none',
                                            background: 'transparent',
                                            cursor: readOnly ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#ef4444'
                                        }}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {!readOnly && state.functions.length === 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Contoh rumus:</p>
                            {['x^2', '2*x + 1', 'sin(x)', 'sqrt(x)', 'abs(x)'].map(ex => (
                                <button
                                    key={ex}
                                    onClick={() => { setFormulaInput(ex); }}
                                    style={{
                                        padding: '0.375rem 0.5rem',
                                        borderRadius: '0.375rem',
                                        border: '1px solid #e2e8f0',
                                        background: 'white',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        fontFamily: 'monospace',
                                        fontSize: '0.8rem',
                                        color: '#475569'
                                    }}
                                >
                                    y = {ex}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});

GeometryCanvas.displayName = 'GeometryCanvas';

export default GeometryCanvas;
