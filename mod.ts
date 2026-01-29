/**
 * @module fresh-i18n-plugin
 *
 * A powerful internationalization (i18n) plugin for Fresh framework
 * with automatic locale detection, fallback support, and translation validation.
 */

export { i18n } from "./src/middleware.ts";
export { translate, createNamespacedTranslator } from "./src/translator.ts";
export { findLocalesDirectory, getEffectiveLocalesDir } from "./src/locales-finder.ts";
export type { ClientLoadConfig, I18nOptions, TranslationState } from "./src/types.ts";
export type { FallbackConfig } from "./src/middleware.ts";
export type { TranslationConfig } from "./src/translator.ts";
