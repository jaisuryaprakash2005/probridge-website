/**
 * Top Builders and Real Estate Developers Directory
 * Curated for ProBridge Website
 */

const getAssetUrl = (filename) => {
  const base = typeof window !== 'undefined' && window.location.pathname.startsWith('/probridge-website')
    ? '/probridge-website'
    : (process.env.PUBLIC_URL || '');
  return `${base}/${filename.replace(/^\/+/, '')}`;
};

export const BUILDERS = [
  {
    id: 'brigade',
    name: 'Brigade Group',
    logo: 'https://im.proptiger.com/3/100376/13/brigade-9778458.jpeg?height=120&width=320',
    experience: '35+ Years',
    established: '1986',
    headquarters: 'Bengaluru',
  },
  {
    id: 'puravankara',
    name: 'Puravankara Limited',
    logo: 'https://im.proptiger.com/3/100046/13/puravankara-4491843.jpeg?height=120&width=320',
    experience: '45+ Years',
    established: '1975',
    headquarters: 'Bengaluru',
  },
  {
    id: 'godrej',
    name: 'Godrej Properties',
    logo: getAssetUrl('godrej-logo.png'),
    experience: '32+ Years',
    established: '1990',
    headquarters: 'Mumbai',
  },
  {
    id: 'prestige',
    name: 'Prestige Group',
    logo: 'https://im.proptiger.com/3/365/13/prestige-183425.jpg?height=120&width=320',
    experience: '36+ Years',
    established: '1986',
    headquarters: 'Bengaluru',
  },
];
