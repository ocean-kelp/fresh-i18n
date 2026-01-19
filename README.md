# Fresh i18n

A simple internationalization (i18n) plugin for [Fresh](https://fresh.deno.dev) with automatic locale detection and fallback support.

Previous name: @xingshuu-denofresh/fresh-i18n-plugin
New name: @xiayun/fresh-i18n

## Features

- **Client-side translation loading** - Zero-prop islands with route-based injection (NEW!)
- **Nested folder structure** - Organize translations with unlimited nesting
- **Namespaced translators** - Avoid repetitive prefixes with scoped translators
- Automatic locale detection from URL paths and Accept-Language headers
- Fallback system with configurable indicators for missing translations
- Development validation with detailed error messages and warnings
- Namespace support for organizing translations by feature
- Production optimized with silent failures and optional key display
- TypeScript native with full type safety
- Smart locale discovery - automatically finds your locales directory
- Flexible configuration - customize every aspect of translation behavior
- **Kebab-case to camelCase** - File names auto-converted for clean code

## Installation

```bash
deno add @xiayun/fresh-i18n
```

Or add to your `deno.json`:

```json
{
  "imports": {
    "@xiayun/fresh-i18n": "jsr:@xiayun/fresh-i18n@^1.0.0"
  }
}
```

## Quick Start

### 1. Create locale files

Organize your translations in a `locales` directory. You can use a flat structure or nest folders as deeply as needed:

**Flat structure (backwards compatible):**

```
locales/
├── en/
│   ├── common.json
│   ├── error.json
│   └── metadata.json
└── es/
    ├── common.json
    ├── error.json
    └── metadata.json
```

**Nested structure (recommended for larger apps):**

```
locales/
├── en/
│   ├── common/
│   │   ├── actions.json     → common.actions.*
│   │   ├── states.json      → common.states.*
│   │   └── labels.json      → common.labels.*
│   └── features/
│       ├── dashboard.json   → features.dashboard.*
│       └── users/
│           ├── list.json    → features.users.list.*
│           └── form.json    → features.users.form.*
└── es/
    └── ... (same structure)
```

**See [Nested Structure Guide](./docs/NESTED_STRUCTURE.md) for detailed documentation.**

**Example `locales/en/common.json` or `locales/en/common/actions.json`:**

```json
{
  "save": "Save",
  "cancel": "Cancel",
  "edit": "Edit"
}
```

### 2. Define your state type in `utils.ts`

Extend the `TranslationState` interface to include translation functionality in your app state:

```typescript
import { createDefine } from "fresh";
import type { TranslationState } from "@xiayun/fresh-i18n";

export interface State extends TranslationState {
  // Add your custom state properties here
}

export const define = createDefine<State>();
```

### 3. Configure the plugin in `main.ts`

```typescript
import { App } from "fresh";
import { i18nPlugin } from "@xiayun/fresh-i18n";
import { type State } from "./utils.ts";

export const app = new App<State>();

app.use(i18nPlugin({
  languages: ["en", "es"],
  defaultLanguage: "en",
  localesDir: "./locales",
}));

await app.listen();
```

### 4. Use translations in your routes

```typescript
import { PageProps } from "fresh";
import type { State } from "../utils.ts";

export default function HomePage({ state }: PageProps<unknown, State>) {
  return (
    <div>
      <h1>{state.t("common.welcome")}</h1>
      <nav>
        <a href={`/${state.locale}/about`}>{state.t("common.nav.about")}</a>
      </nav>
    </div>
  );
}
```

## Configuration

### Basic Options

```typescript
i18nPlugin({
  languages: ["en", "es", "fr"],
  defaultLanguage: "en",
  localesDir: "./locales",
});
```

### Advanced Configuration

```typescript
i18nPlugin({
  languages: ["en", "es"],
  defaultLanguage: "en",
  localesDir: "./locales",

  // Custom production detection
  isProduction: () => Deno.env.get("ENVIRONMENT") === "production",

  // Show translation keys in production for debugging
  showKeysInProd: false,

  // Fallback configuration
  fallback: {
    enabled: true,
    showIndicator: true,
    indicatorFormat: (text, locale) => `${text} · ${locale.toUpperCase()}`,
    shouldShowIndicator: (text, locale) => {
      const wordCount = text.split(/\s+/).filter((w) => w).length;
      return wordCount >= 2; // Only show indicator for multi-word translations
    },
    applyOnDev: false,
  },
});
```

## Translation File Structure

### Namespaces

The plugin automatically loads these namespaces:

- `common.json` - Shared translations across all pages
- `error.json` - Error messages
- `metadata.json` - SEO metadata
- Route-specific namespaces based on URL segments

### Key Format

All translation keys use dot notation with the namespace prefix:

```json
{
  "title": "Welcome",
  "nav": {
    "home": "Home",
    "about": "About"
  }
}
```

Access as: `t("common.title")` or `t("common.nav.home")`

## Client-Side Translation Loading (NEW!)

Eliminate prop-drilling and reduce payload size by automatically injecting translations into islands based on route patterns.

**📖 [Complete Migration Guide](./docs/MIGRATION_GUIDE.md)** - Step-by-step instructions for migrating existing apps with zero duplication.

### Why Use This?

**Before (prop-drilling approach):**

- 50KB of translation props passed to every island
- Verbose handler code for every route
- Large serialized data in HTML

**After (injection approach):**

- 5KB payload (only matched namespaces)
- Zero props needed in islands
- Clean, simple code

### Setup

Configure which translations to load for specific routes:

```typescript
app.use(i18nPlugin({
  languages: ["en", "es"],
  defaultLanguage: "en",
  localesDir: "./locales",

  clientLoad: {
    // Always load these namespaces on every page
    always: ["common"],

    // Route-specific namespaces (greedy wildcard matching)
    routes: {
      "/indicators/*": ["features.indicators"],
      "/matrix/indicators/*": ["features.matrix.indicators"],
      "/admin/*": ["features.admin", "features.users"],
      "/goals/*": ["features.goals"],
    },

    // Behavior when no route matches
    // "none" - No injection (best for gradual migration)
    // "always-only" - Load only 'always' namespaces
    // "all" - Load everything
    fallback: "none",

    // Optional: normalize trailing slashes before matching
    ignoreTrailingSlash: true,

    // Optional: warn in dev when multiple patterns match
    warnOnOverlap: true,
  },
}));
```

### Route Pattern Rules

- **Greedy wildcard:** `*` matches everything after the prefix
  - `/indicators/*` matches `/indicators/123` ✅
  - `/indicators/*` matches `/indicators/123/edit` ✅
  - `/indicators/*` matches `/indicators/a/b/c` ✅
- **Prefix must match exactly:**
  - `/indicators/*` does NOT match `/matrix/indicators/123` ❌
  - `/matrix/indicators/*` DOES match `/matrix/indicators/123` ✅
- **Multiple matches:** If multiple patterns match, all namespaces are merged

### IMPORTANT: Route Patterns ≠ File Structure

⚠️ **Route patterns control WHEN to load, not HOW to organize files:**

```typescript
// Pattern /indicators/* loads features.indicators.*
// But you should still have granular translation files:
routes: {
  "/indicators/*": ["features.indicators"],  // Loads ALL of these:
}

// Translation file structure (keep granular!):
locales/en/features/indicators/
├── list.json          // features.indicators.list.*
├── edit.json          // features.indicators.edit.*
├── form.json          // features.indicators.form.*
├── validations.json   // features.indicators.validations.*
└── tooltips.json      // features.indicators.tooltips.*
```

**Don't consolidate files just because you have a wildcard route!** Keep translations fragmented for maintainability, code splitting, and clarity.

### Usage in Islands

With `clientLoad` configured, islands can access translations without props:

```typescript
// Island component (zero props needed!)
import { useLocale, useTranslation } from "@xiayun/fresh-i18n/client";

export default function MyIsland() {
  const t = useTranslation();
  const locale = useLocale();

  return (
    <div>
      <h1>{t("features.indicators.title")}</h1>
      <button>{t("common.actions.save")}</button>
      <p>Current language: {locale}</p>
    </div>
  );
}
```

**No handler needed!** No props to pass! The plugin automatically injects matched translations into the HTML.

### Hybrid Approach (Recommended)

Support both patterns for maximum flexibility:

```typescript
// Route with clientLoad enabled - no props needed
export default function IndicatorsRoute() {
  return <IndicatorsList />; // Uses useTranslation() internally
}

// Route with custom translations - use props
export const handler = define.handlers({
  GET(ctx) {
    return {
      data: {
        translationData: customTranslations,
        translationConfig: { ... },
      },
    };
  },
});

export default function SpecialRoute({ data }) {
  return <SpecialIsland translations={data.translationData} />;
}
```

### Fallback Modes

**`fallback: "none"`** (best for migration)

- Don't inject script when no route matches
- Routes without patterns continue using props
- **Zero duplication during gradual migration**
- Perfect for hybrid approach

**`fallback: "always-only"`** (recommended after migration)

- Load only `always` namespaces when no route matches
- Minimal payload for unmatched routes
- Best for performance after full migration

**`fallback: "all"`**

- Load entire translation object when no route matches
- Ensures all translations available everywhere
- Backwards compatible with prop-based approach

### Migrating from Props to Injection (Zero Duplication)

Use `fallback: "none"` for clean, gradual migration with no wasted bytes:

```typescript
// Step 1: Enable clientLoad with empty routes
app.use(i18nPlugin({
  languages: ["en", "es"],
  defaultLanguage: "en",
  localesDir: "./locales",
  clientLoad: {
    always: [], // Empty! No automatic loading
    routes: {}, // Start empty
    fallback: "none", // 🔑 Key: No injection for unmapped routes
  },
}));
// All routes still use props - no change, no duplication
```

```typescript
// Step 2: Migrate one route at a time
clientLoad: {
  always: [],
  routes: {
    "/indicators/*": ["common", "features.indicators"],  // Migrate this route
  },
  fallback: "none",
}

// For /indicators/* pages:
export default function IndicatorsRoute() {
  return <IndicatorsList />;  // Uses useTranslation() - no props!
}

// For /admin/users (unmigrated):
export default function AdminRoute({ data }) {
  return <AdminPanel translationData={data.translationData} />;  // Still uses props
}
// Result: Zero duplication! Each route uses one approach.
```

```typescript
// Step 3: After migrating all routes, add common to always
clientLoad: {
  always: ["common"],           // Now safe to load everywhere
  routes: {
    "/indicators/*": ["features.indicators"],
    "/admin/*": ["features.admin"],
    // ... all routes mapped
  },
  fallback: "always-only",      // Change to always-only
}
// All routes now use injection, props completely removed
```

**Migration benefits:**

- ✅ No duplication at any stage
- ✅ Migrate route-by-route at your own pace
- ✅ Test each migration before moving to next
- ✅ Rollback is easy (just remove route from config)
- ✅ Performance improvement visible immediately per route

## Usage in Islands (Prop-Based Approach)

If you prefer explicit control or don't use `clientLoad`, islands can still receive translations as props:

### 1. Pass data from route handler:

```typescript
import { define } from "@/utils.ts";
import { PageProps } from "fresh";
import type { State } from "@/utils.ts";

export const handler = define.handlers({
  GET(ctx) {
    return {
      data: {
        translationData: ctx.state.translationData,
        translationConfig: {
          locale: ctx.state.locale,
          defaultLocale: ctx.state.translationConfig?.defaultLocale,
          fallbackKeys: Array.from(ctx.state.translationConfig?.fallbackKeys ?? []),
        },
      },
    };
  },
});
```

### 2. Pass to island in route component:

```typescript
export default function MyRoute({ data, state }: PageProps<RouteData, State>) {
  return (
    <div>
      <h1>{state.t("common.title")}</h1>
      <MyIsland
        translationData={data.translationData}
        translationConfig={data.translationConfig}
      />
    </div>
  );
}
```

### 3. Use in island:

```typescript
import { translate, TranslationConfig } from "@xiayun/fresh-i18n";

interface MyIslandProps {
  translationData: Record<string, unknown>;
  translationConfig?: {
    locale?: string;
    defaultLocale?: string;
    fallbackKeys?: string[];
  };
}

export default function MyIsland({ translationData, translationConfig }: MyIslandProps) {
  // Reconstruct config with Set for fallbackKeys
  const config: TranslationConfig | undefined = translationConfig
    ? {
      ...translationConfig,
      fallbackKeys: new Set(translationConfig.fallbackKeys ?? []),
    }
    : undefined;

  const t = translate(translationData ?? {}, config);

  return <button>{t("common.submit")}</button>;
}
```

**Key points:**

- Routes use `state.t` directly
- Islands receive `translationData` and `translationConfig` as props

## Namespaced Translators

Avoid repetitive namespace prefixes by creating scoped translators:

```typescript
import { createNamespacedTranslator } from "@xiayun/fresh-i18n";

// In a route or island
export default function MyComponent({ state }) {
  const t = state.t;

  // Create namespaced translators
  const tActions = createNamespacedTranslator(t, "common.actions");
  const tStates = createNamespacedTranslator(t, "common.states");
  const tForm = createNamespacedTranslator(t, "indicatorsPage.form");

  return (
    <div>
      <button>{tActions("save")}</button> {/* → t("common.actions.save") */}
      <button>{tActions("cancel")}</button> {/* → t("common.actions.cancel") */}
      <p>{tStates("loading")}</p> {/* → t("common.states.loading") */}
      <input placeholder={tForm("name")} /> {/* → t("indicatorsPage.form.name") */}
    </div>
  );
}
```

**Benefits:**

- No repetitive namespace prefixes in your code
- Better readability and maintainability
- Type-safe (still returns `string`)
- Can be nested for deeper namespaces

**Nested namespacing:**

```typescript
const tIndicators = createNamespacedTranslator(t, "indicatorsPage");
const tForm = createNamespacedTranslator(tIndicators, "form");

tForm("save"); // → t("indicatorsPage.form.save")
```

- Island creates its own `t()` function using `translate()`
- Never pass the `t()` function directly to islands

## Locale Detection

The plugin detects the user's language in this order:

1. **URL Path**: `/es/about` → Spanish (`es`)
2. **Accept-Language Header**: Falls back to browser preference
3. **Default Language**: Uses your configured default

## Development vs Production

### Development Mode

- Shows `[key.name]` for missing translations
- Logs detailed warnings to console
- Validates translation keys and structure
- Helps identify missing or incorrect translations

### Production Mode

- Returns empty string for missing translations
- Silent failures (no console warnings)
- Optional: Show keys with `showKeysInProd: true`
- Optimized performance

## Fallback System

When enabled, the fallback system loads your default language as a base and overlays the requested language:

```typescript
fallback: {
  enabled: true,           // Enable fallback
  showIndicator: true,     // Show indicator for fallback text
  indicatorFormat: (text, locale) => `${text} [${locale}]`,
  applyOnDev: false,       // Don't apply in development (show keys instead)
}
```

**Example**: If Spanish translation is missing for `common.welcome`, it shows the English version (optionally with an indicator).

## API Reference

### `i18nPlugin(options)`

Creates the i18n middleware.

**Options:**

- `languages` (string[]): Supported language codes
- `defaultLanguage` (string): Default language code
- `localesDir` (string): Path to locales directory
- `isProduction` (() => boolean): Custom production detection
- `showKeysInProd` (boolean): Show keys in production (default: false)
- `Use namespaces: Organize translations by feature (`common.json`,`auth.json`, etc.)

2. Keep keys descriptive: Use `common.nav.home` instead of `common.h1`
3. Enable fallback in production: Prevent blank UI when translations are missing
4. Test in development: Development mode shows all issues
5. Use TypeScript: Get autocomplete and type safety for your state
6. Routes use `state.t`, islands use `translate(translationData, config)`

**Parameters:**

- `translationData` (Record<string, unknown>): Flat translation object
- `config` (TranslationConfig): Optional configuration

**Returns:** `(key: string) => string`

### State Interface

The plugin adds these properties to Fresh's context state:

```typescript
interface State {
  t: (key: string) => string; // Translation function
  locale: string; // Current locale
  translationData: Record<string, unknown>; // Raw translation data
  path: string; // URL path without locale
}
```

## Best Practices

1. **Use namespaces**: Organize translations by feature (`common.json`, `auth.json`, etc.)
2. **Keep keys descriptive**: Use `common.nav.home` instead of `common.h1`
3. **Enable fallback in production**: Prevent blank UI when translations are missing
4. **Test in development**: Development mode shows all issues
5. **Use TypeScript**: Get autocomplete and type safety for your state

## Examples

See the `/examples` directory for complete working examples:

- Basic setup
- With fallback indicators
- Islands integration
- Multi-language navigation

## Migration Guide

### From other i18n solutions

Most i18n libraries use similar patterns. Key differences:

1. **No React context**: Uses Fresh's built-in state
2. **Flat key structure**: Access as `t("namespace.key.path")`
3. **Automatic namespace loading**: Based on URL path
4. **Server-first**: Translations loaded server-side for better performance

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) first.

## License

MIT License - see [LICENSE](LICENSE) for details

## Support

- Report issues: [GitHub Issues](https://github.com/yourorg/fresh-i18n-plugin/issues)
- Discussions: [GitHub Discussions](https://github.com/yourorg/fresh-i18n-plugin/discussions)
