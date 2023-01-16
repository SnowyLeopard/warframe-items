import * as cheerio from 'cheerio';
import fetch from 'node-fetch';

function defaultMapper($, element, section) {
  const name = $(element).find('div:last-child a span').text();
  const value = $(element).find('p span').text();
  const rank = $(element).find('div:nth-of-type(3)').text();
  return { name, value, rank, section };
}

function galleryMapper($, element, section) {
  const text = $(element).find('.lightbox-caption').text();
  const numberIndex = text.search(/(?=\d)/g);

  const name = text.slice(0, numberIndex);
  const value = text.slice(numberIndex);
  const rank = undefined;
  return { name, value, rank, section };
}

function archimedeanMapper($, element, section) {
  const name = $(element).find('div:nth-of-type(3) > a > span').text();
  const value = $(element).find('div:nth-of-type(1) > div > a > span').text();
  const rank = undefined;
  return { name, value: `${value} Thrax Plasm`, rank, section };
}

const SYNDICATES = [
  {
    name: 'Steel Meridian',
    url: 'https://warframe.fandom.com/wiki/Steel_Meridian',
    sections: {
      '': '#mw-customcollapsible-SteelMeridian > div > div',
    },
  },
  {
    name: 'Arbiters of Hexis',
    url: 'https://warframe.fandom.com/wiki/Arbiters_of_Hexis',
    sections: {
      '': '#mw-customcollapsible-ArbitersofHexis > div > div',
    },
  },
  {
    name: 'Cephalon Suda',
    url: 'https://warframe.fandom.com/wiki/Cephalon_Suda',
    sections: {
      '': '#mw-customcollapsible-CephalonSuda > div > div',
    },
  },
  {
    name: 'The Perrin Sequence',
    url: 'https://warframe.fandom.com/wiki/The_Perrin_Sequence',
    sections: {
      '': '#mw-customcollapsible-ThePerrinSequence > div > div',
    },
  },
  {
    name: 'Red Veil',
    url: 'https://warframe.fandom.com/wiki/Red_Veil',
    sections: {
      '': '#mw-customcollapsible-RedVeil > div > div',
    },
  },
  {
    name: 'New Loka',
    url: 'https://warframe.fandom.com/wiki/New_Loka',
    sections: {
      '': '#mw-customcollapsible-NewLoka > div > div',
    },
  },
  {
    name: 'Conclave',
    url: 'https://warframe.fandom.com/wiki/Conclave',
    sections: {
      '': '.flex-container > div',
    },
  },
  {
    name: 'Cephalon Simaris',
    url: 'https://warframe.fandom.com/wiki/Cephalon_Simaris',
    sections: {
      '': '#mw-customcollapsible-Simaris > div > div',
    },
  },
  {
    name: 'Ostron',
    url: 'https://warframe.fandom.com/wiki/Ostron',
    sections: {
      Hok: '#mw-customcollapsible-Hok > div > div',
      'Old Man Suumbaat': '#mw-customcollapsible-Suumbaat > div > div',
      'Fisher Hai-Luk': '#mw-customcollapsible-Hai-Luk > div > div',
      'Master Teasonai': '#mw-customcollapsible-BeastmasterWares > div > div',
      Nakak: '#mw-customcollapsible-Nakak > div > div',
    },
  },
  {
    name: 'The Quills',
    url: 'https://warframe.fandom.com/wiki/The_Quills',
    sections: {
      '': '#mw-customcollapsible-Onkko > div > div',
    },
  },
  {
    name: 'Solaris United',
    url: 'https://warframe.fandom.com/wiki/Solaris_United',
    sections: {
      'Rude Zuud': '#mw-customcollapsible-Zuud > div > div',
      Legs: '#mw-customcollapsible-Legs > div > div',
      'The Business': '#mw-customcollapsible-Biz > div > div',
      Smokefinger: '#mw-customcollapsible-Smoke > div > div',
    },
  },
  {
    name: 'Vox Solaris',
    url: 'https://warframe.fandom.com/wiki/Vox_Solaris_(Syndicate)',
    sections: {
      '': '#mw-customcollapsible-LittleDuck > div > div',
    },
  },
  {
    name: 'Ventkids',
    url: 'https://warframe.fandom.com/wiki/Ventkids',
    sections: {
      '': '#mw-customcollapsible-Ventkids > div > div',
    },
  },
  {
    name: 'Entrati',
    url: 'https://warframe.fandom.com/wiki/Entrati',
    sections: {
      Father: '#mw-customcollapsible-Father > div > div',
      Daughter: '#mw-customcollapsible-Daughter > div > div',
      Son: '#mw-customcollapsible-Son > div > div',
      Otak: '.flex-container:eq(3) > div',
      Grandmother: [['#mw-customcollapsible-Grandmother #gallery-1 > div', galleryMapper]],
    },
  },
  {
    name: 'NecraLoid',
    url: 'https://warframe.fandom.com/wiki/Necraloid',
    sections: {
      Loid: '#mw-customcollapsible-Loid > div > div',
    },
  },
  {
    name: 'The Holdfasts',
    url: 'https://warframe.fandom.com/wiki/The_Holdfasts',
    sections: {
      Archimedean: [
        ['#mw-customcollapsible-Yonta #gallery-0 > div', galleryMapper],
        ['#mw-customcollapsible-Yonta > p + div, #mw-customcollapsible-Yonta > p + div ~ div', archimedeanMapper],
      ],
      Hombask:
        '#mw-customcollapsible-HombaskOfferings1 > div > div, #mw-customcollapsible-HombaskOfferings2 > div > div',
      Cavalero: '#mw-customcollapsible-Cavalero > div > div',
    },
  },
  {
    name: "Kahl's Garrison",
    url: 'https://warframe.fandom.com/wiki/Kahl%27s_Garrison',
    sections: {
      Chipper: '#mw-customcollapsible-Chipper > div > div',
    },
  },
  {
    name: 'Operational Supply',
    url: 'https://warframe.fandom.com/wiki/Operational_Supply',
    sections: {
      '': '.flex-container > div',
    },
  },
];

export default class SyndicateScraper {
  async scrape() {
    const syndicates = {};
    await Promise.all(
      SYNDICATES.map(async (syndicate) => {
        const data = await fetch(syndicate.url).then((res) => res.text());
        const $ = cheerio.load(data);
        syndicates[syndicate.name] = [];

        Object.keys(syndicate.sections).forEach((section) => {
          let sectionMapping = syndicate.sections[section];
          if (typeof sectionMapping === 'string') {
            sectionMapping = [[sectionMapping, defaultMapper]];
          }
          sectionMapping.forEach((m) => {
            syndicates[syndicate.name] = [
              ...syndicates[syndicate.name],
              ...$(m[0])
                .map((index, element) => m[1]($, element, section))
                .toArray(),
            ];
          });
        });
        return undefined;
      })
    );

    return syndicates;
  }
}
