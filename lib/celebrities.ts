export interface CelebrityProfile {
  slug:        string
  name:        string
  searchName:  string   // term used to find articles about this celebrity
  category:    string
  nationality: string
  known_for:   string
  bio:         string
  tags:        string[]
}

export const CELEBRITIES: CelebrityProfile[] = [
  {
    slug:        'samuel-etoo',
    name:        "Samuel Eto'o",
    searchName:  "Eto'o",
    category:    'Sport Stars',
    nationality: 'Cameroonian',
    known_for:   'Footballer · FECAFOOT President · 4× Africa Cup of Nations winner',
    bio:         "Samuel Eto'o Fils is Cameroon's greatest footballer and one of the greatest African players in history. A four-time African Player of the Year, he won two UEFA Champions League titles with Barcelona and another with Inter Milan. He now serves as president of FECAFOOT, Cameroon's football federation, where he continues to shape the future of African football.",
    tags:        ['football', 'sport', 'FECAFOOT', 'Cameroon', 'Barcelona', 'Inter Milan'],
  },
  {
    slug:        'charlotte-dipanda',
    name:        'Charlotte Dipanda',
    searchName:  'Dipanda',
    category:    'Music',
    nationality: 'Cameroonian',
    known_for:   'Singer · R&B / Makossa · "La Voix du Cameroun"',
    bio:         "Charlotte Dipanda is one of Cameroon's most celebrated vocalists, known for blending contemporary R&B with traditional Makossa and Bikutsi rhythms. Her powerful voice and authentic Cameroonian storytelling have earned her a devoted following across Central and West Africa and the global diaspora. She is widely regarded as a leading voice of modern African soul music.",
    tags:        ['music', 'R&B', 'makossa', 'Cameroon', 'Afrobeats'],
  },
  {
    slug:        'locko',
    name:        'Locko',
    searchName:  'Locko',
    category:    'Music',
    nationality: 'Cameroonian',
    known_for:   'Singer · Afrobeats · Pop',
    bio:         "Locko is one of Cameroon's biggest Afrobeats stars, known for his silky vocals and infectious pop sensibility. With hits that have dominated charts across Central and West Africa, Locko has established himself as a key figure in the continent's growing pop music scene. His cross-regional appeal makes him a true pan-African entertainment star.",
    tags:        ['music', 'Afrobeats', 'pop', 'Cameroon'],
  },
  {
    slug:        'salatiel',
    name:        'Salatiel',
    searchName:  'Salatiel',
    category:    'Music',
    nationality: 'Cameroonian',
    known_for:   'Singer · Producer · Alpha Better Records',
    bio:         "Salatiel is a Cameroonian singer, songwriter, and record producer who co-founded Alpha Better Records, the label behind some of the most innovative sounds in African music. He gained international attention after collaborating with Beyoncé on 'The Lion King: The Gift' album. As both an artist and a tastemaker, Salatiel is at the forefront of elevating Cameroonian music to a global audience.",
    tags:        ['music', 'production', 'Afrobeats', 'Cameroon', 'Alpha Better Records', 'Beyonce'],
  },
  {
    slug:        'burna-boy',
    name:        'Burna Boy',
    searchName:  'Burna Boy',
    category:    'Music',
    nationality: 'Nigerian',
    known_for:   'Grammy-winning Afrobeats artist · "African Giant"',
    bio:         "Burna Boy is a Grammy Award-winning Nigerian Afrobeats superstar whose music has brought African sounds to the global mainstream. Known as the 'African Giant', he has collaborated with artists from Drake to Stormzy and performed at sold-out arenas worldwide. His influence extends across West and Central Africa, making him essential coverage for any African entertainment platform.",
    tags:        ['music', 'Afrobeats', 'Nigeria', 'Grammy', 'global'],
  },
]

export function getCelebrity(slug: string): CelebrityProfile | null {
  return CELEBRITIES.find(c => c.slug === slug) ?? null
}
