import { mapboxToken } from '../../secrets';
import { MapLayer, MapLayerTypes } from '../../WebViewLeaflet/models';

const mapLayers: MapLayer[] = [
  {
    color: '#123123',
    id: 1,
    coords: [
      [-77.1253967, 38.9759587],
      [-76.9180298, 38.968485],
      [-76.9139099, 38.7872749],
      [-77.1226501, 38.7915566]
    ],
    type: MapLayerTypes.GEOMETRY_LAYER
  },
  {
    name: 'OpenStreetMap',
    isChecked: true,
    type: MapLayerTypes.TILE_LAYER,
    isBaseLayer: true,
    url: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`,
    attribution:
      '&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors'
  },
  {
    name: 'streets',
    type: MapLayerTypes.TILE_LAYER,
    isBaseLayer: true,
    //url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    url: `https://api.tiles.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=${mapboxToken}`,
    attribution:
      '&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors'
  },
  {
    name: 'light',
    type: MapLayerTypes.TILE_LAYER,
    isBaseLayer: true,
    //url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    url: `https://api.tiles.mapbox.com/v4/mapbox.light/{z}/{x}/{y}.png?access_token=${mapboxToken}`,
    attribution:
      '&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors'
  },
  {
    name: 'dark',
    type: MapLayerTypes.TILE_LAYER,
    isBaseLayer: true,
    url: `https://api.tiles.mapbox.com/v4/mapbox.dark/{z}/{x}/{y}.png?access_token=${mapboxToken}`,
    attribution:
      '&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors'
  },
  /* {
     name: 'image',
     type: 'ImageOverlay',
     isBaseLayer: true,
     url: 'http://www.lib.utexas.edu/maps/historical/newark_nj_1922.jpg',
     bounds: [[40.712216, -74.22655], [40.773941, -74.12544]]
   }, */
  {
    name: 'WMS Tile Layer',
    type: MapLayerTypes.TILE_LAYER,
    url: 'https://demo.boundlessgeo.com/geoserver/ows',
    layers: 'nasa:bluemarble'
  }
  /* {
    type: 'VideoOverlay',
    name: 'video',
    isBaseLayer: true,
    url: 'https://www.mapbox.com/bites/00188/patricia_nasa.webm',
    bounds: [[32, -130], [13, -100]]
  } */
];

export default mapLayers;