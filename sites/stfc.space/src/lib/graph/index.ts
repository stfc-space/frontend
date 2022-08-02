import type { ElkCanvasLayoutOptions } from './elkLayout';
import type { EdgeData, NodeData } from './types';

export { elkLayout } from './elkLayout';

export interface ElkRootChild {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  labels: { x: number; y: number; text: string; originalText?: string }[];
}

export interface ElkRootEdge {
  sections: {
    bendPoints?: { x: number; y: number }[];
    startPoint: { x: number; y: number };
    endPoint: { x: number; y: number };
  }[];
}

export interface ElkRoot {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  children?: ElkRootChild[];
  edges?: ElkRootEdge[];
  direction?: CanvasDirection;
}

export interface LayoutProps {
  maxHeight: number;
  maxWidth: number;
  nodes: NodeData[];
  edges: EdgeData[];
  layoutOptions?: ElkCanvasLayoutOptions;
  direction: CanvasDirection;
  onLayoutChange?: (layout: ElkRoot) => void;
}

export interface LayoutResult {
  /**
   * ELK Layout object.
   */
  layout: ElkRoot;

  /**
   * Height of the svg.
   */
  canvasHeight?: number;

  /**
   * Width of the svg.
   */
  canvasWidth?: number;

  /**
   * Width of the container div.
   */
  containerWidth?: number;

  /**
   * Height of the container div.
   */
  containerHeight?: number;

  /**
   * Center the canvas to the viewport.
   */
  centerCanvas?: () => void;

  /**
   * Fit the canvas to the viewport.
   */
  fitCanvas?: () => void;
}
