/**
 * Top Builders and Real Estate Developers Directory
 * Curated for ProBridge Website matching PropTiger style
 */

const getAssetUrl = (filename) => {
  const base = typeof window !== 'undefined' && window.location.pathname.startsWith('/probridge-website')
    ? '/probridge-website'
    : (process.env.PUBLIC_URL || '');
  return `${base}/${filename.replace(/^\/+/, '')}`;
};

export const BUILDERS = [
  {
    id: 'puravankara',
    name: 'Puravankara Limited',
    logo: 'https://im.proptiger.com/3/100046/13/puravankara-4491843.jpeg?height=120&width=320',
    experience: '45+ Years',
    established: '1975',
    headquarters: 'Bengaluru',
    totalProjects: 13,
    ongoingProjects: 10,
  },
  {
    id: 'godrej',
    name: 'Godrej Properties',
    logo: getAssetUrl('godrej-logo.png'),
    experience: '32+ Years',
    established: '1990',
    headquarters: 'Mumbai',
    totalProjects: 52,
    ongoingProjects: 32,
  },
  {
    id: 'kolte-patil',
    name: 'Kolte Patil Developers',
    logo: 'https://im.proptiger.com/3/100067/13/kolte-patil-developers-4490899.jpeg?height=120&width=320',
    experience: '33+ Years',
    established: '1991',
    headquarters: 'Pune',
    totalProjects: 156,
    ongoingProjects: 55,
  },
  {
    id: 'kohinoor-group',
    name: 'Kohinoor Group Pune',
    logo: 'https://im.proptiger.com/3/100657/13/kohinoor-group-pune-7080649.jpeg?height=120&width=320',
    experience: '39+ Years',
    established: '1983',
    headquarters: 'Pune',
    totalProjects: 63,
    ongoingProjects: 27,
  },
  {
    id: 'lodha',
    name: 'Lodha Group',
    logo: 'https://im.proptiger.com/3/100040/13/lodha-group-10025345.jpeg?height=120&width=320',
    experience: '42+ Years',
    established: '1980',
    headquarters: 'Mumbai',
    totalProjects: 53,
    ongoingProjects: 33,
  },
  {
    id: 'prestige',
    name: 'Prestige Group',
    logo: 'https://im.proptiger.com/3/365/13/prestige-183425.jpg?height=120&width=320',
    experience: '36+ Years',
    established: '1986',
    headquarters: 'Bengaluru',
    totalProjects: 68,
    ongoingProjects: 29,
  },
  {
    id: 'brigade',
    name: 'Brigade Group',
    logo: 'https://im.proptiger.com/3/100376/13/brigade-9778458.jpeg?height=120&width=320',
    experience: '35+ Years',
    established: '1986',
    headquarters: 'Bengaluru',
    totalProjects: 45,
    ongoingProjects: 22,
  },
];
