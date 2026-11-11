    /* Domain age via RDAP: ask the registry for the domain's TLD (IANA bootstrap), fall back to rdap.org. */
    let RDAP_SERVICES = null;
    async function fetchT(url, ms) {
      const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), ms);
      try { const r = await fetch(url, { signal: ctl.signal, headers: { accept: 'application/rdap+json, application/json' } }); return r; } finally { clearTimeout(t); }
    }
    async function rdapBases(tld) {
      try {
        if (!RDAP_SERVICES) { const r = await fetchT('https://data.iana.org/rdap/dns.json', 4500); if (!r.ok) throw new Error(r.status); RDAP_SERVICES = (await r.json()).services || []; }
        const svc = RDAP_SERVICES.find(x => x[0].includes(tld)); return svc ? svc[1].filter(u => /^https:/.test(u)) : [];
      } catch (e) { return []; }
    }
    async function domainAge(host) {
      const reg = regDomain(host);
      if (freeHostOf(host) || /^\d/.test(reg)) return { skipped: true };
      const tld = reg.split('.').pop();
      const urls = (await rdapBases(tld)).slice(0, 2).map(b => b.replace(/\/?$/, '/') + 'domain/' + encodeURIComponent(reg));
      urls.push('https://rdap.org/domain/' + encodeURIComponent(reg));
      for (const u of urls) {
        try {
          const r = await fetchT(u, 5000); if (!r.ok) continue;
          const j = await r.json(); const ev = (j.events || []).find(e => /registration/i.test(e.eventAction));
          if (!ev || !ev.eventDate) continue;
          return { days: Math.max(0, Math.floor((Date.now() - new Date(ev.eventDate).getTime()) / 864e5)), date: ev.eventDate };
        } catch (e) { /* try the next source */ }
      }
      return { failed: true };
    }

