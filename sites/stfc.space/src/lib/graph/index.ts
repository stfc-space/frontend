import type { ElkCanvasLayoutOptions } from './elkLayout';
import type { EdgeData, NodeData } from './types';

export { elkLayout } from './elkLayout';

export interface ElkRoot {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  children?: object[];
  edges?: object[];
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
