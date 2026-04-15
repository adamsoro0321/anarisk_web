declare module 'react-cytoscapejs' {
  import { Component } from 'react';
  import cytoscape from 'cytoscape';

  interface CytoscapeComponentProps {
    elements: cytoscape.ElementDefinition[];
    style?: React.CSSProperties;
    layout?: cytoscape.LayoutOptions;
    stylesheet?: cytoscape.Stylesheet[] | cytoscape.Stylesheet | string;
    cy?: (cy: cytoscape.Core) => void;
    className?: string;
    id?: string;
    pan?: cytoscape.Position;
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    wheelSensitivity?: number;
    boxSelectionEnabled?: boolean;
    autoungrabify?: boolean;
    autounselectify?: boolean;
  }

  export default class CytoscapeComponent extends Component<CytoscapeComponentProps> {}
}
