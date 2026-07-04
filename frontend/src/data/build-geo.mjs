import fs from 'fs';

const data = fs.readFileSync('indonesia-prov.json', 'utf8');

const header = `export interface IndonesiaFeature extends GeoJSON.Feature {
  properties: {
    Propinsi: string
  }
}

const geoData = `;

const footer = `;
export default geoData as GeoJSON.FeatureCollection<GeoJSON.Geometry, {Propinsi: string}>;
`;

fs.writeFileSync('indonesia-geo.ts', header + data + footer, 'utf8');
