import * as cheerio from 'cheerio';
import fetch from 'node-fetch';

function wareMapper($, element) {
  const name = $(element).find('div:last-child a span').text();
  const value = $(element).find('p span').text();
  const rank = $(element).find('div:nth-of-type(3)').text();
  return { name, value, rank };
}

export default class SyndicateScraper {
  async scrape() {
    const syndicates = {};
    const steelMeridian = await fetch('https://warframe.fandom.com/wiki/Steel_Meridian').then((res) => res.text());
    const $ = cheerio.load(steelMeridian);
    syndicates['Steel Meridian'] = $('#mw-customcollapsible-SteelMeridian > div > div')
      .map((index, element) => wareMapper($, element))
      .toArray();

    console.log(syndicates);
    return syndicates;
  }
}
