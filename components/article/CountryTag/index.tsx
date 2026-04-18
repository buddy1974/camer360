interface CountryMeta {
  name:  string
  color: string
  bg:    string
}

export const COUNTRIES: Record<string, CountryMeta> = {
  CM:  { name: 'Cameroon',       color: '#fff', bg: '#007A5E' },
  NG:  { name: 'Nigeria',        color: '#fff', bg: '#008751' },
  GH:  { name: 'Ghana',          color: '#fff', bg: '#006B3F' },
  CI:  { name: "Côte d'Ivoire",  color: '#fff', bg: '#F77F00' },
  SN:  { name: 'Senegal',        color: '#fff', bg: '#00853F' },
  ML:  { name: 'Mali',           color: '#fff', bg: '#14B53A' },
  BF:  { name: 'Burkina Faso',   color: '#fff', bg: '#EF2B2D' },
  BJ:  { name: 'Benin',          color: '#fff', bg: '#008751' },
  TG:  { name: 'Togo',           color: '#fff', bg: '#006A4E' },
  GN:  { name: 'Guinea',         color: '#fff', bg: '#CE1126' },
  SL:  { name: 'Sierra Leone',   color: '#fff', bg: '#1EB53A' },
  LR:  { name: 'Liberia',        color: '#fff', bg: '#BF0A30' },
  DIA: { name: 'Diaspora',       color: '#1A1A1A', bg: '#D4AF37' },
}

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
