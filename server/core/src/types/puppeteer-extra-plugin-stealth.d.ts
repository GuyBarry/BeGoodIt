declare module 'puppeteer-extra-plugin-stealth' {
  import { PuppeteerExtraPlugin } from 'puppeteer-extra';
  function StealthPlugin(): PuppeteerExtraPlugin;
  export = StealthPlugin;
}
