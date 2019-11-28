import * as React from 'react';
import { withLeaflet } from 'react-leaflet';
import {
  LatLngExpression,
  LeafletMouseEvent,
  LatLng,
  LatLngBounds
} from 'leaflet';
import {
  WebviewLeafletMessage,
  MapMarker,
  MapEvent,
  MapVectorLayerCircle,
  MapVectorLayerCircleMarker,
  MapVectorLayerPolyline,
  MapVectorLayerPolygon,
  MapVectorLayerRectangle,
  MapRasterLayer,
  AnimationType
} from './models';
import mockVectorLayers from './mocks/mockVectorLayers';
import mockMapLayers from './mocks/mockRasterLayers';
import mockMapMarkers from './mocks/mockMapMarkers';
import MapComponentView from './MapComponent.view';

require('react-leaflet-markercluster/dist/styles.min.css');
const util = require('util');

export enum MapComponentMessages {
  MAP_COMPONENT_MOUNTED = 'MAP_COMPONENT_MOUNTED',
  DOCUMENT_EVENT_LISTENER_ADDED = 'DOCUMENT_EVENT_LISTENER_ADDED',
  WINDOW_EVENT_LISTENER_ADDED = 'WINDOW_EVENT_LISTENER_ADDED',
  UNABLE_TO_ADD_EVENT_LISTENER = 'UNABLE_TO_ADD_EVENT_LISTENER',
  DOCUMENT_EVENT_LISTENER_REMOVED = 'DOCUMENT_EVENT_LISTENER_REMOVED',
  WINDOW_EVENT_LISTENER_REMOVED = 'WINDOW_EVENT_LISTENER_REMOVED'
}

interface State {
  vectorLayers: (
    | MapVectorLayerCircle
    | MapVectorLayerCircleMarker
    | MapVectorLayerPolyline
    | MapVectorLayerPolygon
    | MapVectorLayerRectangle
  )[];
  boundsOptions: any;
  bounds: LatLngBounds | null;
  panToLocation: any;
  showZoomControl: boolean;
  showAttributionControl: boolean;
  mapCenterCoords: LatLng | null;
  debugMessages: string[];
  isLoaded: boolean;
  lat: number;
  lng: number;
  rasterLayers?: MapRasterLayer[];
  mapMarkers?: MapMarker[];
  ownPositionMarker: MapMarker | null;
  useMarkerClustering: boolean;
  zoom: number;
}

interface Props {}
const SHOW_DEBUG_INFORMATION = true;
const ENABLE_BROWSER_TESTING = true;

class MapComponent extends React.Component<Props, State> {
  state: State;
  private mapRef: any = null;
  constructor(props: Props) {
    super(props);
    this.state = {
           bounds: null,
      debugMessages: ['test'],
      isLoaded: false,
      lat: 51.505,
      lng: -0.09,
      mapCenterCoords: null,
      mapMarkers: [],
      ownPositionMarker: null,
      panToLocation: null,
      rasterLayers: [],
      showAttributionControl: false,
      showZoomControl: false,
      useMarkerClustering: true,
      vectorLayers: [],
      zoom: 13
 boundsOptions: null,
    };
    console.log('Here');
  }

  componentDidMount = () => {
    console.log('componentDidMount');
    this.setState(
      { debugMessages: [...this.state.debugMessages, 'componentDidMount'] },
      () => {
        try {
          this.sendMessage({
            msg: 'MAP_READY'
          });
        } catch (error) {
          this.addDebugMessage(error);
        }

        if (document) {
          document.addEventListener('message', this.handleMessage), false;
          this.addDebugMessage('set document listeners');
          this.sendMessage({
            msg: 'DOCUMENT_EVENT_LISTENER_ADDED'
          });
        }
        if (window) {
          window.addEventListener('message', this.handleMessage);
          this.addDebugMessage('setting Window');
          this.sendMessage({
            msg: 'WINDOW_EVENT_LISTENER_ADDED'
          });
        }
        if (!document && !window) {
          this.sendMessage({
            error: 'UNABLE_TO_ADD_EVENT_LISTENER'
          });
          return;
        }
      }
    );

    if (ENABLE_BROWSER_TESTING) {
      this.setupBrowserTesting();
    }
  };

  componentDidUpdate = (prevProps: Props, prevState: State) => {
    const { debugMessages } = this.state;
    if (debugMessages !== prevState.debugMessages) {
      console.log(debugMessages);
    }
  };

  componentWillUnmount = () => {
    if (document) {
      document.removeEventListener('message', this.handleMessage);
      this.sendMessage({
        msg: 'DOCUMENT_EVENT_LISTENER_REMOVED'
      });
    }
    if (window) {
      window.removeEventListener('message', this.handleMessage);
      this.sendMessage({
        msg: 'WINDOW_EVENT_LISTENER_REMOVED'
      });
    }
  };

  private addDebugMessage = (msg: any) => {
    if (typeof msg === 'object') {
      this.addDebugMessage('STRINGIFIED');
      this.setState({
        debugMessages: [
          ...this.state.debugMessages,
          JSON.stringify(msg, null, 4)
        ]
      });
    } else {
      this.setState({ debugMessages: [...this.state.debugMessages, msg] });
    }
  };

  private handleMessage = (event) => {
    this.addDebugMessage(event.data);
    try {
      // this.setState({ ...this.state, ...event.data });
    } catch (error) {
      this.addDebugMessage({ error: JSON.stringify(error) });
    }
  };

  protected sendMessage = (message: WebviewLeafletMessage) => {
    // @ts-ignore
    if (window.ReactNativeWebView) {
      // @ts-ignore
      window.ReactNativeWebView.postMessage(JSON.stringify(message));
      console.log('sendMessage  ', JSON.stringify(message));
    }
  };

  private onMapEvent = (event: MapEvent, payload?: any) => {
    // build a payload if one is not provided
    if (this.mapRef && this.state.isLoaded) {
      try {
        const mapCenterPosition: LatLngExpression = [
          this.mapRef.leafletElement.getCenter().lat,
          this.mapRef.leafletElement.getCenter().lng
        ];

        const mapBounds = this.mapRef.leafletElement.getBounds();
        const mapZoom = this.mapRef.leafletElement.getZoom();

        if (!payload) {
          payload = {
            center: mapCenterPosition,
            bounds: mapBounds,
            zoom: mapZoom
          };
        }
        /* this.printElement(
          `onMapEvent: event = ${event}, payload = ${JSON.stringify(payload)}`
        ); */

        this.sendMessage({
          event,
          payload
        });

        // update the map's center in state if it has moved
        // The map's center in state (mapCenterCoords) is used by react.leaflet
        // to center the map.  Centering the map component on the actual
        // map center will allow us to recenter the map by updating the mapCenterCoords
        // item in state ourself
        if (event === MapEvent.ON_MOVE_END) {
          this.setState(
            {
              mapCenterCoords: new LatLng(
                mapCenterPosition[0],
                mapCenterPosition[1]
              )
            },
            () => {
              /*  this.printElement(
          `************** Updated mapCenterCoords = ${this.state.mapCenterCoords}`
        ); */
            }
          );
        }
        if (event === MapEvent.ON_ZOOM_END) {
          this.setState({ zoom: mapZoom }, () => {
            /*  this.printElement(
          `************** Updated mapZoom = ${this.state.zoom}`
        ); */
          });
        }
      } catch (error) {
        console.warn('ERROR onMapEvent', error);
      }
    }
  };

  // print passed information in an html element; useful for debugging
  // since console.log and debug statements won't work in a conventional way
  private printElement = (data) => {
    if (SHOW_DEBUG_INFORMATION) {
      let message = '';
      if (typeof data === 'object') {
        message = util.inspect(data, { showHidden: false, depth: null });
      } else if (typeof data === 'string') {
        message = data;
      }
      this.setState({
        debugMessages: [...this.state.debugMessages, message]
      });
      console.log(message);
    }
  };

  private setupBrowserTesting = () => {
    this.setState({
      mapMarkers: [] as MapMarker[],
      ownPositionMarker: {
        coords: new LatLng(36.56, -76.17),
        icon: '🎃',
        size: [24, 24],
        animation: {
          duration: 0.5,
          delay: 0,
          iterationCount: 'infinite',
          type: AnimationType.BOUNCE
        }
      },
      vectorLayers: mockVectorLayers,
      rasterLayers: mockMapLayers,
      useMarkerClustering: true
    });

    setTimeout(() => {
      this.setState({
        bounds: new LatLngBounds(
          [36.8859965, -76.4096793],
          [39.07467659353497, -76.91253011988012]
        ),
        boundsOptions: { padding: [0, 0] }
      });
    }, 5000);
  };

  onClick = (event: LeafletMouseEvent) => {
    this.onMapEvent(MapEvent.ON_MAP_CLICKED, {
      coords: [event.latlng.lat, event.latlng.lng]
    });
  };

  onWhenReady = () => {
    this.setState({ isLoaded: true });
    this.printElement(`******* map loaded *******`);
  };

  onMapRef = (ref: any) => {
    if (this.mapRef === null) {
      this.mapRef = ref;
    }
  };

  render() {
    return (
      <MapComponentView
        addDebugMessage={this.addDebugMessage}
        boundsOptions={this.state.boundsOptions}
        bounds={this.state.bounds}
        panToLocation={this.state.panToLocation}
        showZoomControl={this.state.showZoomControl}
        showAttributionControl={this.state.showAttributionControl}
        mapCenterCoords={this.state.mapCenterCoords}
        debugMessages={this.state.debugMessages}
        isLoaded={this.state.isLoaded}
        lat={this.state.lat}
        lng={this.state.lng}
        mapRasterLayers={this.state.rasterLayers}
        mapMarkers={this.state.mapMarkers}
        onClick={this.onClick}
        onWhenReady={this.onWhenReady}
        onMapEvent={this.onMapEvent}
        onMapRef={this.onMapRef}
        ownPositionMarker={this.state.ownPositionMarker}
        useMarkerClustering={this.state.useMarkerClustering}
        vectorLayers={this.state.vectorLayers}
        zoom={this.state.zoom}
      />
    );
  }
}

export default withLeaflet(MapComponent);
