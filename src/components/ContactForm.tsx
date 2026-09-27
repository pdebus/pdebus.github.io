import { useEffect, useState } from 'react';
import { site } from '../data/site';
import { ui, type Lang } from '../i18n/ui';
import './contact.css';

type Status = 'idle' | 'sending' | 'sent' | 'error';
type Kind = keyof (typeof ui)['en']['contact']['types'];

export default function ContactForm({ lang, privacyHref }: { lang: Lang; privacyHref: string }) {
  const t = ui[lang].contact;
  const configured = !site.web3formsKey.startsWith('YOUR-');
  const [kind, setKind] = useState<Kind>('talk');
  const [status, setStatus] = useState<Status>('idle');

  // Links like /contact/?type=consulting preselect the topic.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('type');
    if (q && q in t.types) setKind(q as Kind);
  }, []);

  async function onSubmit(e: { preventDefault(): void; currentTarget: HTMLFormElement }) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    if (data.botcheck) return; // honeypot filled in: silently drop
    setStatus('sending');
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          ...data,
          access_key: site.web3formsKey,
          subject: `[pdebus.github.io] ${t.types[kind]}${data.organisation ? ` · ${data.organisation}` : ''}`,
          from_name: 'pdebus.github.io',
          topic: t.types[kind],
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success !== false) {
        setStatus('sent');
        form.reset();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return <p className="form-note ok" role="status">{t.sent}</p>;
  }

  return (
    <form className="contact-form" onSubmit={onSubmit} noValidate={false}>
      {!configured && <p className="form-note warn">{t.notConfigured}</p>}

      <fieldset className="kinds">
        <legend>{t.type}</legend>
        {(Object.keys(t.types) as Kind[]).map((k) => (
          <label key={k} className={kind === k ? 'on' : ''}>
            <input type="radio" name="kind" id={`kind-${k}`} value={k} checked={kind === k} onChange={() => setKind(k)} />
            {t.types[k]}
          </label>
        ))}
      </fieldset>

      <div className="row2">
        <div className="field">
          <label htmlFor="cf-name">{t.name}</label>
          <input id="cf-name" name="name" required autoComplete="name" />
        </div>
        <div className="field">
          <label htmlFor="cf-email">{t.email}</label>
          <input id="cf-email" name="email" type="email" required autoComplete="email" />
        </div>
      </div>

      <div className="row2">
        <div className="field">
          <label htmlFor="cf-org">{t.org} <span className="opt">({t.optional})</span></label>
          <input id="cf-org" name="organisation" autoComplete="organization" />
        </div>
        {kind === 'talk' ? (
          <div className="field">
            <label htmlFor="cf-date">{t.date} <span className="opt">({t.optional})</span></label>
            <input id="cf-date" name="event_date" type="date" />
          </div>
        ) : <div />}
      </div>

      <div className="field">
        <label htmlFor="cf-msg">{t.message}</label>
        <textarea id="cf-msg" name="message" rows={7} required aria-describedby="cf-msg-hint" />
        <small id="cf-msg-hint" className="hint">{t.messageHint}</small>
      </div>

      <input type="checkbox" name="botcheck" id="cf-botcheck" className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />

      <div className="actions">
        <button type="submit" className="submit" disabled={!configured || status === 'sending'}>
          {status === 'sending' ? t.sending : t.send}
        </button>
        <small className="hint">
          {t.privacy} <a href={privacyHref}>{t.privacyLink}</a>.
        </small>
      </div>
      {status === 'error' && <p className="form-note err" role="alert">{t.error}</p>}
    </form>
  );
}
