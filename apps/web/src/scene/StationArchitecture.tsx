import type { StationKind } from '@frontier-isles/core';
import type { IslandCharacter } from './islandCharacter';

/** Architectural navigation symbols. The open faces expose a place's purpose;
 * geometry is fixed by station kind, never by votes or a fabricated maturity. */
export const ARCHITECTURE_TOP: Record<StationKind, number> = {
  questions:126, library:165, canvas:118, workshop:148, data:101,
  gallery:130, tearoom:125, driftwood:78, dock:103,
};
const INK = '#433f35', PAPER = '#f6efd9', SHADE = '#ddd1b2', BLUE = '#37627b', GREEN = '#426c5c', OCHRE = '#a96337';
const roof = (d: string, color: string) => <path d={d} fill={color} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />;
function Plinth({ wide = 100 }: { wide?: number }) {
  return <><path d={`M${-wide} -10 L0 ${wide*.43-10} L${wide} -10 L0 ${-wide*.43-10}Z`} fill={SHADE}/><path d={`M${-wide} -17 L0 ${wide*.43-17} L${wide} -17 L0 ${-wide*.43-17}Z`} fill={PAPER} stroke={INK} strokeWidth="1.3"/></>;
}
function Window({ x, y, flip = false }: { x:number; y:number; flip?:boolean }) {
  return <g transform={`translate(${x} ${y}) skewY(${flip ? -26.565 : 26.565})`}><rect width="12" height="21" fill={BLUE} stroke={INK}/><path d="M6 0V21M0 10H12" stroke={PAPER} strokeWidth="1.4"/></g>;
}
function Shelf({ x, y }: { x:number; y:number }) {
  return <g transform={`translate(${x} ${y}) skewY(26.565)`}><rect width="46" height="43" fill="#655c46" stroke={INK}/>{[8,20,32].map((p)=><g key={p}><path d={`M3 ${p+7}H43`} stroke={PAPER}/>{[5,13,21,29,37].map((a,j)=><path key={a} d={`M${a} ${p-3}v9`} stroke={[PAPER,OCHRE,GREEN,BLUE,PAPER][j]} strokeWidth="4"/>)}</g>)}</g>;
}
export function StationArchitecture({ station, selected = false, character }: { station: StationKind; selected?:boolean; character?:IslandCharacter }) {
  const pigment = character?.accent ?? BLUE;
  const common = { stroke: INK, strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin:'round' as const };
  return <g data-architecture={station} data-character={character?.program}>
    <ellipse cx="5" cy="13" rx={station==='dock'?95:110} ry="39" fill="#433f3519"/>
    {selected && <ellipse cx="0" cy="8" rx="122" ry="49" fill="none" stroke={BLUE} strokeWidth="2"/>}
    {station === 'library' && <g {...common}>
      <Plinth/>
      <path d="M-82 -97 L0 -58 L0 22 L-82 -17Z" fill={PAPER}/><path d="M0 -58 L82 -97 L82 -17 L0 22Z" fill={SHADE}/>
      <Shelf x={-69} y={-75}/><Shelf x={-69} y={-29}/>
      {[24,52].map(x=><Window key={x} x={x} y={-57-x*.5} flip/>)}
      <path d="M18 -6V-32L37 -42V-16" fill="#75634c"/>
      {roof('M-97 -104 L0 -151 L97 -104 L0 -57Z',pigment)}
      <path d="M-97 -104L0 -158L97 -104M0 -158V-165" fill="none"/>
      <path d="M-65 -103L0 -133L64 -103M-34 -87L31 -117" fill="none" stroke={PAPER} opacity=".55"/>
      <path d="M19 9L45 -4L58 2L31 15Z" fill={PAPER}/>
    </g>}
    {station === 'questions' && <g {...common}>
      <Plinth wide={113}/>
      <path d="M-95 -24V-83Q-22 -123 68 -76V-17Q-8 -65 -95 -24Z" fill={PAPER}/>
      <path d="M-95 -83Q-22 -123 68 -76L76 -81Q-16 -132 -103 -88Z" fill={character?.accent ?? OCHRE}/>
      {[-77,-43,-9,25].map((x,i)=><g key={x} transform={`translate(${x} ${[-76,-87,-86,-77][i]})`}>
        <path d="M0 0L23 -4V35L0 39Z" fill={i===2?'#efdcb9':'#fcf8ed'}/><path d="M5 9L17 7M5 15L15 13M5 21L18 19" fill="none" stroke={i===2?OCHRE:BLUE} strokeWidth="1.6"/>
      </g>)}
      <path d="M-64 4Q4 -20 71 10M-51 18Q8 0 54 23" fill="none" stroke={OCHRE} strokeWidth="5"/>
      <path d="M82 -26V-86L99 -79V-20" fill={SHADE}/><path d="M82 -86V-116L101 -107V-78Z" fill={OCHRE}/>
    </g>}
    {station === 'workshop' && <g {...common}>
      <Plinth wide={106}/>
      <path d="M-87 -63L0 -20L85 -62V-4L0 37L-87 -6Z" fill={PAPER}/><path d="M0 -20L85 -62V-4L0 37Z" fill={SHADE}/>
      {roof('M-94 -66L-25 -118L-25 -88L36 -125L36 -96L94 -67L0 -21Z',character?.accent ?? OCHRE)}
      <path d="M-25 -118V-88L-1 -99V-120ZM36 -125V-96L58 -107V-127Z" fill="#a2b9ba"/>
      <path d="M62 -95V-143L76 -148L85 -143V-79" fill={SHADE}/><path d="M62 -143L75 -137L85 -143M75 -137V-84" fill="none"/>
      <path d="M-66 2V-42L-19 -18V26Z" fill="#78644b"/>
      <path d="M-73 9L-29 31L-8 21L-52 -1Z" fill={PAPER}/><path d="M-65 9L-65 25M-28 27V40M-16 20V32" fill="none"/>
      <circle cx="41" cy="-4" r="11" fill={BLUE}/><path d="M41 -11V3M34 -4H48" stroke={PAPER}/>
    </g>}
    {station === 'canvas' && <g {...common}>
      <Plinth/>
      <path d="M-80 0V-75M0 38V-37M80 0V-75" stroke={SHADE} strokeWidth="9"/>
      <path d="M-80 0V-75M0 38V-37M80 0V-75" fill="none"/>
      {roof('M-94 -78L0 -124L94 -78L0 -32Z',character?.accent ?? GREEN)}
      <path d="M-74 -33L-7 -2V-49L-74 -80Z" fill="#faf7e8"/>
      <path d="M-65 -62L-20 -41M-65 -50L-43 -40M-34 -35L-18 -27" stroke={BLUE} fill="none"/>
      <path d="M9 -41L66 -69V-28L9 0Z" fill="#e0e8db"/>
      <path d="M19 -34L32 -48L43 -36L55 -52" stroke={OCHRE} fill="none"/>
      <path d="M-38 5L0 24L44 3L7 -15Z" fill={SHADE}/>
    </g>}
    {station === 'data' && <g {...common}>
      <Plinth wide={114}/>
      <path d="M-91 -23L5 23L94 -19L1 -65Z" fill="#e7e9da"/>
      <path d="M-76 -22L-16 8L-16 -6L-76 -36ZM-16 8L17 -8V-21L-16 -6Z" fill={PAPER}/>
      {[-62,-43,-24].map((x,i)=><path key={x} d={`M${x} ${-27+i*9}v${-17-i*7}l9 4v${17+i*7}`} fill={[BLUE,GREEN,OCHRE][i]}/>)}
      <path d="M45 4V-48M29 12L45 4L62 12" fill="none"/>
      <ellipse cx="45" cy="-60" rx="24" ry="30" fill={PAPER}/><path d="M45 -82V-60L62 -51" fill="none" stroke={BLUE} strokeWidth="3"/>
      <path d="M-3 -63V-101M-12 -90H7M-10 -80H5" fill="none"/>
    </g>}
    {station === 'gallery' && <g {...common}>
      <Plinth wide={108}/>
      <path d="M-94 -58L0 -11L94 -58V-4L0 43L-94 -4Z" fill={PAPER}/><path d="M0 -11L94 -58V-4L0 43Z" fill={SHADE}/>
      {roof('M-105 -66L0 -119L105 -66L0 -13Z','#696856')}
      <path d="M-17 -109L10 -123L46 -106L19 -92Z" fill="#aac3c9"/>
      {[-77,-48,-19].map(x=><g key={x} transform={`translate(${x} ${-19+x*.5}) skewY(26.565)`}><rect width="20" height="26" fill="#fdf9ed"/><path d="M4 18L10 9L16 19" fill="none" stroke={BLUE}/></g>)}
      <path d="M24 30V-7Q37 -30 53 -21V14" fill="#6f624c"/><path d="M17 32L60 11L70 16L27 37Z" fill={PAPER}/>
    </g>}
    {station === 'tearoom' && <g {...common}>
      <Plinth wide={97}/>
      <path d="M-70 -70V9M70 -70V9M0 -38V40" stroke={SHADE} strokeWidth="8"/>
      {roof('M-94 -66Q-25 -70 0 -125Q25 -70 94 -66L0 -20Z',GREEN)}
      <path d="M-94 -66L0 -20L94 -66M0 -125V-137" fill="none"/>
      <ellipse cx="0" cy="-6" rx="38" ry="18" fill={PAPER}/><path d="M0 -6V16"/>
      <ellipse cx="-51" cy="-1" rx="11" ry="6" fill={OCHRE}/><ellipse cx="33" cy="19" rx="11" ry="6" fill={OCHRE}/><ellipse cx="33" cy="-29" rx="11" ry="6" fill={OCHRE}/>
      <path d="M-8 -9Q0 -19 8 -9V-2H-8Z" fill={BLUE}/>
    </g>}
    {station === 'driftwood' && <g {...common}>
      <path d="M-110 -14L0 40L110 -14L0 -68Z" fill="#d7dec7" strokeDasharray="6 4"/>
      <path d="M-75 0L-24 22M-59 -26L0 1M26 -24L73 -1" stroke="#a18e69" strokeWidth="10"/>
      <path d="M-75 0L-24 22M-59 -26L0 1M26 -24L73 -1" fill="none"/>
      <path d="M-4 -28V-74M-19 -63H16M-15 -54H10" stroke={BLUE} fill="none"/>
      <path d="M34 11L56 22L78 11L56 0Z" fill={PAPER}/><path d="M-89 -7V-45L-69 -54V-23" fill={SHADE}/>
      <path d="M79 -28q-19 -20 -8 -34q23 4 8 34M-26 19q-20 -25 -9 -35" fill={GREEN}/>
    </g>}
    {station === 'dock' && <g {...common}>
      <path d="M-69 -58L-6 -25L-6 42L-69 10Z" fill={SHADE}/>
      {[-40,-27,-14,0,14,27].map(y=><path key={y} d={`M-67 ${y}L-8 ${y+29}`} fill="none"/>)}
      <path d="M-63 -55V-100M-10 -25V-70" strokeWidth="5"/>
      <path d="M-63 -100L-10 -73L-10 -42L-63 -69Z" fill={PAPER}/><path d="M-51 -78L-27 -66M-48 -90L-38 -77L-22 -77" stroke={BLUE} fill="none"/>
      <path d="M20 21Q48 1 107 -5Q85 41 52 50Q30 44 20 21Z" fill={OCHRE}/><path d="M28 23L72 31L98 3" fill={PAPER}/><path d="M45 10L71 -2L90 9L65 23Z" fill={GREEN}/>
      <path d="M61 4V-55L94 -9L61 -3Z" fill={PAPER}/>
    </g>}
    {character && ['questions','data','workshop','library'].includes(station) && <ResearchInstrument program={character.program} accent={pigment} station={station}/>}
  </g>;
}

/** Architectural exhibits, not measured data. Each family has a distinct
 * instrument silhouette; shared station footprints remain the hit targets. */
function ResearchInstrument({program,accent,station}:{program:IslandCharacter['program'];accent:string;station:StationKind}) {
  return <g transform={station==='library'?'translate(62 -115) scale(.55)':'translate(86 3) scale(.7)'} stroke={INK} strokeWidth="2" strokeLinejoin="round" fill={PAPER}>
    <path d="M-22 4L0 15L24 3L2 -8Z" fill={SHADE}/>
    {program==='living' && <><path d="M-22 1V-42L0 -63L22 -42V1L0 12Z" fill="#b7d0bc"/><path d="M0 -63V12M-22 -42L0 -31L22 -42" fill="none"/><path d="M0 -5V-34M0 -21Q-18 -41 -14 -17Q-7 -11 0 -12M0 -29Q18 -47 15 -25Q8 -20 0 -21" fill={accent}/></>}
    {program==='sensing' && <><path d="M0 7V-58M-20 8L0 -13L20 8" fill="none"/><path d="M-29 -63Q-22 -19 19 -50Z" fill={accent}/><path d="M-12 -42L9 -71M9 -71l7 -5" fill="none"/><circle cx="9" cy="-71" r="4" fill={PAPER}/></>}
    {program==='commons' && <><path d="M-23 0V-56L20 -77V-21Z" fill={accent}/>{[-47,-30,-13].map(y=><path key={y} d={`M-18 ${y}L15 ${y-16}`} stroke={PAPER}/>)}<path d="M-2 -10V-65" stroke={PAPER}/></>}
    {program==='transfer' && <><path d="M-28 -8V-34L-3 -46L17 -36V-11L-7 1Z" fill={accent}/><path d="M-3 -46V-21L-28 -8M-3 -21L17 -36" fill="none"/><path d="M2 -34V-59L23 -69L43 -59V-34L22 -23Z" fill={PAPER}/><path d="M23 -69V-44L2 -34M23 -44L43 -59" fill="none"/></>}
    {program==='simulation' && <><path d="M-23 7V-65H24V7M-28 7H29" fill="none"/>{[-13,14].map((x,i)=><g key={x}><path d={`M${x} -65L${x+(i?9:-9)} -18`} fill="none"/><circle cx={x+(i?9:-9)} cy="-18" r="9" fill={i?accent:PAPER}/></g>)}</>}
    {program==='unknowns' && <><path d="M-22 3V-36L-7 -67L-3 -26V12Z" fill={accent}/><path d="M8 10V-30L18 -59L27 -22V0Z" fill={SHADE}/><path d="M-5 -45L8 -49" stroke={accent} strokeDasharray="2 4"/></>}
  </g>;
}

export function StationPortrait({ station, className, character }: { station:StationKind; className?:string; character?:IslandCharacter }) {
  return <svg className={className} viewBox="-145 -180 290 245" aria-hidden="true"><StationArchitecture station={station} character={character}/></svg>;
}
