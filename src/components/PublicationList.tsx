import { useState } from 'react';
import pubs from '../data/publications.json';
import { site } from '../data/site';
import { ui, type Lang } from '../i18n/ui';
import './lists.css';

type Filter = 'all' | 'ai' | 'q';
const ME = 'P. Debus';

function Authors({ text }: { text: string }) {
  const parts = text.split(ME);
  return (
    <div className="au">
      {parts.map((p, i) => (
        <span key={i}>{p}{i < parts.length - 1 && <b>{ME}</b>}</span>
      ))}
    </div>
  );
}

export default function PublicationList({ lang }: { lang: Lang }) {
  const t = ui[lang];
  const [filter, setFilter] = useState<Filter>('all');
  const shown = pubs.filter((p) => filter === 'all' || p.topics.includes(filter));
  const years = [...new Set(shown.map((p) => p.year))].sort((a, b) => b - a);

  return (
    <>
      <div className="sechead">
        <div>
          <h2>{t.nav.publications}</h2>
          {/*<div className="metrics">*/}
          {/*  <span><b>{site.metrics.citations}</b> {t.citations}</span>*/}
          {/*  <span>h-index <b>{site.metrics.hIndex}</b></span>*/}
          {/*  <a href={site.links.scholar}>{t.viaScholar}</a>*/}
          {/*</div>*/}
        </div>
        <div className="filters" role="group" aria-label={t.filterPubs}>
          {(['all', 'ai', 'q'] as const).map((f) => (
            <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}>
              {f === 'q' ? t.filters.qml : t.filters[f]}
            </button>
          ))}
        </div>
      </div>
      {years.map((year) => (
        <div className="year" key={year}>
          <h3>{year}</h3>
          <ul className="pubs">
            {shown.filter((p) => p.year === year).map((p) => (
              <li className="pub" key={p.title}>
                <div className="pt">{p.title}</div>
                <Authors text={p.authors} />
                <div className="ve">
                  <em>{p.venue}</em>
                  {p.topics.map((tp) => (
                    <span key={tp} className={tp === 'ai' ? 'ttag ai' : 'ttag'}>
                      {tp === 'ai' ? t.filters.ai : t.filters.qml}
                    </span>
                  ))}
                  {'doi' in p && p.doi && <a href={`https://doi.org/${p.doi}`}>DOI</a>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}
