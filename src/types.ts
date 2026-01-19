import type { TranslationConfig } from "./translator.ts";

/**
 * State object extended by the i18n plugin middleware.
 * This type should be extended by your app's State interface.
 *
 * @example
 * ```typescript
 * import { TranslationState } from "@xiayun/fresh-i18n";
 *
 * export interface State extends TranslationState {
 *   // Your custom state properties
 * }
 * ```
 */
export interface TranslationState extends Record<string, unknown> {
  /** Flat translation data object with dot-separated keys */
  translationData: Record<string, unknown>;
  /** Configuration for translation behavior */
  translationConfig: TranslationConfig;
  /** Current route path */
  path: string;
  /** Current locale code (e.g., "en", "es") */
  locale: string;
  /** Translation function that takes a key and returns translated text */
  t: (key: string) => string;
}

/**
 * Configuration for client-side translation loading.
 * Allows fine-grained control over which translation namespaces are loaded for specific routes.
 *
 * @example
 * ```typescript
 * clientLoad: {
 *   always: ["common"],
 *   routes: {
 *     "/indicators/*": ["features.indicators"],
 *     "/matrix/indicators/*": ["features.matrix.indicators"],
 *   },
 *   fallback: "always-only",
 *   ignoreTrailingSlash: true,
 *   warnOnOverlap: true,
 * }
 * ```
 */
export interface ClientLoadConfig {
  /**
   * Namespaces to always load on every page (e.g., common UI elements).
   * These will be included regardless of route matching.
   *
   * @example ["common", "navigation"]
   */
  always: string[];

  /**
   * Route pattern to namespace mapping.
   * Patterns use greedy wildcard matching where * matches any path segment(s).
   *
   * IMPORTANT: Route patterns are about WHEN to load translations, not HOW to organize files.
   * A pattern like "/indicators/*" might load "features.indicators.*" which could include:
   * - features.indicators.list
   * - features.indicators.edit
   * - features.indicators.form
   * - features.indicators.validations
   * Keep your translation files as granular as possible regardless of route patterns!
   *
   * @example
   * {
   *   "/indicators/*": ["features.indicators"],  // Loads ALL features.indicators.* files
   *   "/admin/*": ["features.admin", "features.users"],
   * }
   */
  routes: Record<string, string[]>;

  /**
   * Behavior when no route pattern matches the current URL.
   * - "none": Load nothing - no script injection (best for hybrid migration)
   * - "always-only": Load only the namespaces from the 'always' array
   * - "all": Load all available translations (backwards compatible)
   *
   * Use "none" for zero-duplication gradual migration: routes with patterns use injection,
   * routes without patterns continue using props.
   *
   * @default "always-only"
   */
  fallback?: "none" | "always-only" | "all";

  /**
   * If true, normalize URLs by removing trailing slashes before matching.
   * Set to false if your app has trailing slash middleware that already handles this.
   *
   * @default false
   */
  ignoreTrailingSlash?: boolean;

  /**
   * If true, show warnings in development mode when multiple route patterns match the same URL.
   * Helps identify potential configuration issues.
   *
   * @default true
   */
  warnOnOverlap?: boolean;
}

/**
 * Fresh framework context object.
 * @template State - The application state type
 */
export interface FreshContext<State> {
  /** The incoming HTTP request */
  req: Request;
  /** Shared state object passed through middleware chain */
  state: State;
  /** Function to call the next middleware in the chain */
  next: () => Promise<Response | void>;
  /** Current URL object */
  url: URL;
}

/**
 * Middleware function type for Fresh framework.
 * @template State - The application state type
 */
export type MiddlewareFn<State> = (
  ctx: FreshContext<State>,
) => Response | Promise<Response | void>;

/**
 * Configuration options for the i18n plugin.
 *
 * @example
 * ```typescript
 * const options: I18nOptions = {
 *   languages: ["en", "es", "ja"],
 *   defaultLanguage: "en",
 *   localesDir: "./locales",
 * };
 * ```
 */
export interface I18nOptions {
  /** Array of supported language codes */
  languages: string[];
  /** Default language to use when no preference is detected */
  defaultLanguage: string;
  /** Path to the directory containing locale folders */
  localesDir: string;
}
