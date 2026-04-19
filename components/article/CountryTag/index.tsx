interface CountryMeta {
  name:  string
  color: string
  bg:    string
}

export const COUNTRIES: Record<string, CountryMeta> = {
  // ── Central Africa ──────────────────────────────────
  CM:  { name: 'Cameroon',              color: '#fff', bg: '#007A5E' },
  GA:  { name: 'Gabon',                 color: '#fff', bg: '#009E60' },
  TD:  { name: 'Chad',                  color: '#fff', bg: '#003082' },
  GQ:  { name: 'Equatorial Guinea',     color: '#fff', bg: '#3E9A00' },
  CG:  { name: 'Congo (Brazzaville)',   color: '#fff', bg: '#009543' },
  CD:  { name: 'Congo (DRC)',           color: '#fff', bg: '#007FFF' },
  CF:  { name: 'Central African Rep.',  color: '#fff', bg: '#289728' },

  // ── West Africa ──────────────────────────────────────
  NG:  { name: 'Nigeria',               color: '#fff', bg: '#008751' },
  GH:  { name: 'Ghana',                 color: '#fff', bg: '#006B3F' },
  SN:  { name: 'Senegal',               color: '#fff', bg: '#00853F' },
  ML:  { name: 'Mali',                  color: '#fff', bg: '#14B53A' },
  CI:  { name: "Côte d'Ivoire",         color: '#fff', bg: '#F77F00' },
  GN:  { name: 'Guinea',                color: '#fff', bg: '#CE1126' },
  SL:  { name: 'Sierra Leone',          color: '#fff', bg: '#1EB53A' },
  LR:  { name: 'Liberia',               color: '#fff', bg: '#BF0A30' },
  BF:  { name: 'Burkina Faso',          color: '#fff', bg: '#EF2B2D' },
  NE:  { name: 'Niger',                 color: '#fff', bg: '#E05206' },
  BJ:  { name: 'Benin',                 color: '#fff', bg: '#008751' },
  TG:  { name: 'Togo',                  color: '#fff', bg: '#006A4E' },
  GW:  { name: 'Guinea-Bissau',         color: '#fff', bg: '#CE1126' },
  GM:  { name: 'Gambia',                color: '#fff', bg: '#3A7728' },

  // ── East & Southern Africa ───────────────────────────
  KE:  { name: 'Kenya',                 color: '#fff', bg: '#006600' },
  UG:  { name: 'Uganda',                color: '#fff', bg: '#000000' },
  TZ:  { name: 'Tanzania',              color: '#fff', bg: '#1EB53A' },
  ZA:  { name: 'South Africa',          color: '#fff', bg: '#007A4D' },
  RW:  { name: 'Rwanda',                color: '#fff', bg: '#20603D' },

  // ── International / Diaspora ─────────────────────────
  USA: { name: 'USA',                   color: '#fff', bg: '#3C3B6E' },
  GB:  { name: 'United Kingdom',        color: '#fff', bg: '#012169' },
  FR:  { name: 'France',                color: '#fff', bg: '#002395' },
  DE:  { name: 'Germany',               color: '#fff', bg: '#1A1A1A' },
  CA:  { name: 'Canada',                color: '#fff', bg: '#CC0000' },
  EU:  { name: 'Europe',                color: '#1A1A1A', bg: '#D4AF37' },
  DIA: { name: 'Diaspora',              color: '#1A1A1A', bg: '#D4AF37' },
}

// Grouped structure for admin dropdown <optgroup>
export const COUNTRY_GROUPS: { label: string; codes: string[] }[] = [
  {
    label: 'Central Africa',
    codes: ['CM', 'GA', 'TD', 'GQ', 'CG', 'CD', 'CF'],
  },
  {
    label: 'West Africa',
    codes: ['NG', 'GH', 'SN', 'ML', 'CI', 'GN', 'SL', 'LR', 'BF', 'NE', 'BJ', 'TG', 'GW', 'GM'],
  },
  {
    label: 'East & Southern Africa',
    codes: ['KE', 'UG', 'TZ', 'ZA', 'RW'],
  },
  {
    label: 'International / Diaspora',
    codes: ['USA', 'GB', 'FR', 'DE', 'CA', 'EU', 'DIA'],
  },
]

interface Props {
  country: string | null | undefined
  size?: 'sm' | 'md'
}

export function CountryTag({ country, size = 'sm' }: Props) {
  if (!country) return null
  const meta = COUNTRIES[country.toUpperCase()]
  if (!meta) return null

  const pad = size === 'md' ? '5px 12px' : '3px 8px'
  const fs  = size === 'md' ? '11px' : '10px'

  return (
    <span style={{
      display:       'inline-block',
      background:    meta.bg,
      color:         meta.color,
      padding:       pad,
      fontSize:      fs,
      fontWeight:    700,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      borderRadius:  '3px',
      lineHeight:    1,
      whiteSpace:    'nowrap',
      flexShrink:    0,
    }}>
      {meta.name}
    </span>
  )
}
