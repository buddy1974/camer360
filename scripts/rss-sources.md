# Camer360 RSS Sources for n8n Ingestion

## Core African Entertainment (English)

| Source | Feed URL | Language | Coverage |
|--------|----------|----------|----------|
| Linda Ikeji Blog | https://www.lindaikejisblog.com/feeds/posts/default | EN | Nigerian celebrities, gossip |
| Pulse Nigeria | https://www.pulse.ng/rss | EN | Nigerian entertainment, music |
| Pulse Ghana | https://www.pulse.com.gh/rss | EN | Ghanaian entertainment |
| BellaNaija | https://www.bellanaija.com/feed/ | EN | Pan-African lifestyle, weddings, celebrity |
| The Net NG | https://thenet.ng/feed/ | EN | Nigerian entertainment, tech |
| Canal+ Cameroon | https://www.canalplus.com/cm/rss | EN/FR | Cameroonian entertainment, football |

## Music & Culture

| Source | Feed URL | Language | Coverage |
|--------|----------|----------|----------|
| OkayAfrica | https://www.okayafrica.com/rss/ | EN | Pan-African music, culture |
| NotJustOk | https://notjustok.com/feed/ | EN | Nigerian/Ghanaian music |
| TooXclusive | https://www.tooxclusive.com/feed/ | EN | Nigerian music, videos |
| Trace Africa | http://fr.trace.tv/trace-africa/feed/ | FR | African music, Afrobeats, culture |

## TODO: Research needed

- Wizkid / Davido / Burna Boy dedicated coverage feeds
- French entertainment magazines covering Aya Nakamura / Tayc / MHD
- Cameroonian French-language entertainment blogs
- Diaspora-focused feeds (UK, France, US Afrobeats scenes)

## n8n Workflow Notes

- Poll interval: every 30 minutes
- Dedup by: article URL + title hash
- Route to queue table: `ingested_content`
- AI classify: category + language + sentiment before insert
- Filter: skip articles older than 48h on first ingest
