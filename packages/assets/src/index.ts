// Frontier Isles — parameterized SVG art extracted from the design
// prototype (design/handoff/问题群岛-原型 v3.dc.html), per
// docs/architecture.md §1: "Extract the prototype's hand-drawn SVG into
// parameterized components (packages/assets). No hardcoded scenes."
//
// Import `@frontier-isles/assets/tokens.css` once at the app root for the
// --fi-* custom properties these components read via `var(--x,fallback)`.

export * from './palettes';
export * from './SceneDefs';
export * from './IslandMound';
export * from './NameCard';

export * from './stations/StationLibrary';
export * from './stations/StationWhiteboardHall';
export * from './stations/StationQuestionWall';
export * from './stations/StationDataBench';
export * from './stations/StationWorkshop';
export * from './stations/StationGallery';
export * from './stations/StationTearoom';
export * from './stations/DriftwoodGarden';
export * from './stations/FerryDock';

export * from './scenery/IsoTree';
export * from './scenery/Bamboo';
export * from './scenery/StoneLantern';
export * from './scenery/HangingLantern';
export * from './scenery/LotusPond';
export * from './scenery/SteppingStones';
export * from './scenery/Reef';
export * from './scenery/Jetty';
export * from './scenery/Boat';
export * from './scenery/CreationStone';
export * from './scenery/DesirePath';

export * from './figures/ResidentFigure';

export * from './night/GhostArtifact';
export * from './night/Fireflies';
export * from './night/NightSky';
export * from './night/DaySky';

export * from './chart/ChartBridge';
export * from './chart/LineageLine';
export * from './chart/Compass';
export * from './chart/WaveGroup';
export * from './chart/MountainRange';
export * from './chart/SettlementText';
export * from './chart/islandSilhouette';
export * from './chart/Lighthouse';
export * from './chart/IslandFingerprint';

// Sea plane — v2 海即数据 (depth-plan-v2 §3/§4: currents · climate · depth · legend · list twin)
export * from './sea/ClimateField';
export * from './sea/SeaDepth';
export * from './sea/Current';
export * from './sea/FlowLegend';
export * from './sea/RelationsList';
