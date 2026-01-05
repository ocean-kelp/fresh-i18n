import { App } from "fresh";
import { i18nPlugin } from "@xingshuu-denofresh/fresh-i18n-plugin";

export const app = new App();

// Configure i18n plugin
app.use(i18nPlugin({
  languages: ["en", "es"],
  defaultLanguage: "en",
  localesDir: "./locales",
}));

await app.listen();
