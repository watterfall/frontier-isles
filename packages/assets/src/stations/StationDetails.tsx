/** Fixed architectural details, shared by the island, portraits and SVG twin.
 * These describe a place's use, never occupancy, activity or research progress. */
export function StationDetails({ station, ink = '#433f35', paper = '#f6efd9', shade = '#ddd1b2', accent = '#37627b' }: {
  station: string; ink?: string; paper?: string; shade?: string; accent?: string;
}) {
  return <g stroke={ink} strokeWidth="1.25" strokeLinejoin="round" strokeLinecap="round" fill={paper} data-station-details={station}>
    {station === 'library' && <>
      <path d="M14 13L46 -3L66 7L34 23ZM21 17L53 1M28 20L60 4" fill={shade}/>
      <g transform="translate(-43 5) skewY(26.565)"><path d="M-16 0Q-8 -5 0 0Q8 -5 16 0V14Q8 9 0 14Q-8 9 -16 14ZM0 0V14"/><path d="M-12 4L-4 4M4 4H12M-12 8H-4M4 8H12" stroke={accent}/></g>
      <path d="M-79 -109L0 -147L78 -109M-66 -103L11 -140M-51 -96L25 -133M-36 -88L40 -125M-20 -80L55 -118" fill="none" stroke={paper} opacity=".3"/>
    </>}
    {station === 'questions' && <>
      <path d="M-57 15L-12 37L2 30L-43 8ZM-49 19V29M-9 38V47M-2 31V39" fill={shade}/>
      <g transform="translate(45 -22) skewY(-26.565)"><path d="M0 0H23V14H0Z"/><path d="M4 4H17M4 8H13" stroke={accent}/><path d="M8 -2L18 -9" strokeWidth="2"/></g>
      <path d="M-76 -70l2 2M-42 -81l2 2M-8 -80l2 2M26 -71l2 2" stroke={accent} strokeWidth="3"/>
    </>}
    {station === 'workshop' && <>
      <g transform="translate(-46 7) skewY(26.565)"><path d="M-12 -3H12V8H-12Z" fill={shade}/><path d="M-4 -3V-8H4V-3M-12 1H12" fill="none"/><path d="M14 -7L22 -12M18 -16L25 -9" stroke={accent} strokeWidth="2.5"/></g>
      <path d="M8 34L47 14L64 22L25 42M18 38L56 18" fill={shade}/>
      <path d="M65 -119L81 -126M65 -105L81 -112M65 -91L81 -98" fill="none"/>
    </>}
    {station === 'canvas' && <>
      <path d="M-35 9L2 27L36 10M-35 9V19M2 27V36M36 10V19" fill="none"/>
      <path d="M-15 3L3 -6L20 2L3 10Z"/><path d="M-10 3L2 9M3 -3L14 2" stroke={accent}/>
      <path d="M-57 -26L-22 -10M17 -11L55 -30" stroke={shade} strokeWidth="3"/>
    </>}
    {station === 'data' && <>
      <path d="M-6 29L41 6L66 18L19 41Z" fill={shade}/>
      {[0,1,2,3,4].map(i=><path key={i} d={`M${4+i*8} ${28-i*4}l${i%2?5:9} ${i%2?2.5:4.5}`} fill="none"/>)}
      <path d="M-88 -9L-66 2L-52 -5L-74 -16Z"/><path d="M-78 -9L-66 -3" stroke={accent}/>
    </>}
    {station === 'gallery' && <>
      <path d="M18 34L58 14L76 23L36 43M27 38L67 18" fill={shade}/>
      <g transform="translate(-66 4) skewY(26.565)"><path d="M0 10L4 -18H25L30 10M5 -14H24V2H5Z"/><path d="M8 -9H21M8 -4H17" stroke={accent}/></g>
    </>}
    {station === 'tearoom' && <>
      {[-22,18].map(x=><g key={x} transform={`translate(${x} -6)`}><ellipse rx="5" ry="2.5"/><path d="M-4 0V5Q0 8 4 5V0M5 1Q10 0 8 5H4" fill="none"/></g>)}
      <path d="M-67 10L-39 24L-28 18L-56 4ZM-63 14V24M-38 26V34" fill={shade}/>
    </>}
    {station === 'driftwood' && <>
      <path d="M-50 7L-27 -4L-6 6L-29 18ZM-45 8L-27 0L-12 7" fill={shade}/>
      <path d="M47 -26V-44L69 -33V-17ZM51 -36L64 -30"/>
      <path d="M-87 -19L-65 -8M-81 -25L-59 -14" fill="none" stroke={accent}/>
    </>}
    {station === 'dock' && <>
      <path d="M-60 3V-13M-17 25V9" strokeWidth="5"/>
      <path d="M-60 -9Q-42 -7 -17 14M-17 19Q1 38 31 29" fill="none"/>
      <ellipse cx="-41" cy="5" rx="10" ry="5" fill="none"/><ellipse cx="-41" cy="5" rx="6" ry="2.5" fill="none"/>
      <path d="M59 36L83 24M49 31L74 18" stroke={shade}/>
    </>}
  </g>;
}
