# Watershed Insight

**Geo-Spatial Intelligence for Watershed Development**

Watershed Insight is a React prototype for exploring watershed monitoring information in one place. It demonstrates how geocoded field images, watershed boundaries, GIS layers, remote-sensing indicators, and intervention records can support watershed assessment and planning.

## Project aim

The aim is to help planners and monitoring teams move from field evidence and spatial layers to a clearer picture of watershed conditions. The central demo flow is:

1. Open the GIS Explorer and inspect watershed boundaries and map layers.
2. Select a watershed or click any map location to see coordinates and nearby watershed context.
3. Explore geocoded field images and intervention markers.
4. Review land use, vegetation, water, drainage, and change indicators.
5. Use the analysis and report screens to present the findings.

## Pages

- **Overview (`/`)** — summary indicators, monitoring trend, intervention distribution, and recent activity.
- **Watersheds (`/watersheds`)** — searchable watershed inventory; select a row to open its profile.
- **Watershed details (`/watersheds/:id`)** — selected watershed metadata and analysis sections.
- **Geo-Coded Images (`/geo-images`)** — searchable and filterable field image gallery with location and interpretation details.
- **Spatial Analysis (`/spatial-analysis`)** — land use, vegetation, water, drainage, and intervention summaries.
- **GIS Explorer (`/gis`)** — interactive Leaflet map with OpenStreetMap tiles, layer visibility controls, watershed selection, image/intervention markers, and click-to-inspect coordinates.
- **Change Detection (`/change-detection`)** — illustrative comparison of watershed indicators across two periods.
- **Analytics (`/analytics`)** — cross-watershed charts and summary metrics.
- **Reports (`/reports`)** — assessment report preview and prototype export actions.
- **Settings (`/settings`)** — appearance and prototype data-source preferences.

More detail about each screen and its purpose is in [`PAGES_AND_AIM.txt`](PAGES_AND_AIM.txt).

## Run locally

```sh
npm install
npm run dev
```

Create a production build with:

```sh
npm run build
```

## Technology

- React, TypeScript, and Vite
- Tailwind CSS with project-specific component styles
- React Router
- Leaflet and React-Leaflet with OpenStreetMap tiles
- Recharts and Lucide React

## Prototype data note

Watershed boundaries, image records, intervention points, land-use classifications, and analysis values are mock demonstration data. The prototype does **not** connect to live SRISHTI-DRISHTI satellite data and does not use a production computer-vision model. Image interpretation is labeled as prototype/demo output in the interface.
