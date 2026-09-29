import { useState } from 'react';
import pubs from '../data/publications.json';
import { site } from '../data/site';
import { ui, type Lang } from '../i18n/ui';
import './lists.css';

const ME = 'P. Debus';

// One filter per tag used in publications.json, most frequent first (ties alphabetically).
const TAG_COUNTS = pubs.flatMap((p) => p.tags).reduce<Record<string, number>>((acc, tag) => {
  acc[tag] = (acc[tag] ?? 0) + 1;
  return acc;
}, {});
const TAGS = Object.keys(TAG_COUNTS).sort((a, b) => a.localeCompare(b));

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
  const label = (tag: string) => (t.pubTags as Record<string, string>)[tag] ?? tag;
  const [filter, setFilter] = useState<string>('all');
  const shown = pubs.filter((p) => filter === 'all' || p.tags.includes(filter));
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
      </div>
      <div className="filters pub-filters" role="group" aria-label={t.filterPubs}>
        <button type="button" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>
          {t.filters.all} <span className="n">{pubs.length}</span>
        </button>
        {TAGS.map((tag) => (
          <button key={tag} type="button" aria-pressed={filter === tag} onClick={() => setFilter(tag)}>
            {label(tag)}
            {/*<span className="n">{TAG_COUNTS[tag]}</span>*/}
          </button>
        ))}
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
                  {p.tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className="ttag"
                      aria-pressed={filter === tag}
                      onClick={() => setFilter(filter === tag ? 'all' : tag)}
                    >
                      {label(tag)}
                    </button>
                  ))}
                  {'doi' in p && p.doi && (
                    <a href={`https://doi.org/${p.doi}`} target="_blank" rel="noopener noreferrer">DOI</a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}
