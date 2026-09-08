import { FIELD_STUDIES, fieldStudyFor } from './studies';
import './field-study.css';
export function FieldStudyInvitation({slug,lang,onOpen,onVoyage}:{slug:string;lang:'zh'|'en';onOpen:()=>void;onVoyage?:(slug:string)=>void}) {
  const study=fieldStudyFor(slug),zh=lang==='zh';
  return <div className="fi-study-invitation">
    {study&&<button type="button" className="fi-study-launch" onClick={onOpen} data-study-launch={study.kind}><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M6 24h20M9 20V8m14 12V8M9 10h14M13 10v7l-5 7m11-14v7l5 7M12 19h8"/><circle cx="16" cy="6" r="2"/></svg><span><strong>{study.invitation[lang]}</strong><small>{zh?'进入实验坊 · 自由考察':'Enter the workshop · explore freely'}</small></span><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 10h14m-5-5 5 5-5 5"/></svg></button>}
    {onVoyage&&<details className="fi-study-index"><summary>{zh?'十岛考察 · 选择一个前沿问题':'Ten island studies · choose a frontier question'}</summary><p>{zh?'每座岛有不同的可操作考察，可从任意一处开始。这是编辑选题，不表示岛屿之间已建立科学关系。':'Each island offers a different interactive study. Start anywhere. This is an editorial selection, not an established scientific relation between islands.'}</p><nav aria-label={zh?'十岛考察索引':'Ten island study index'}>{FIELD_STUDIES.map(item=><button type="button" key={item.slug} aria-current={item.slug===slug?'location':undefined} onClick={()=>item.slug===slug?onOpen():onVoyage(item.slug)}><strong>{item.island[lang]}</strong><span>{item.title[lang]}</span></button>)}</nav></details>}
  </div>;
}
