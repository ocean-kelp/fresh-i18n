# 🌊 Fresh i18n

[![JSR](https://jsr.io/badges/@xiayun/fresh-i18n)](https://jsr.io/@xiayun/fresh-i18n)

The fastest, cleanest, and most developer-friendly i18n solution for [Fresh](https://fresh.deno.dev). Stop prop-drilling translations and start building.

## 🚀 Why choose Fresh i18n?

- **✨ Zero-Prop Islands**: Access translations in islands via hooks. No more passing `labels={...}` through 5 layers of components.
- **🏎️ Ultra-Lightweight**: Only injects the translations needed for the current route. 90% payload reduction vs. traditional providers.
- **📂 Infinite Nesting**: Organize your translations exactly how you want. Files auto-convert to namespaced keys.
- **🛠️ Developer First**: Namespaced translators, auto-kebab-to-camel conversion, and robust dev-mode validation.
- **🌍 SEO Native**: Server-side rendering by default for meta tags and headers, with instant client-side hydration for islands.

---

## ⚡ Quick Start (60s)

### 1. Structure your locales

```
locales/
├── en/
│   ├── common.json         → common.*
│   └── feature/            
│       └── modal.json     → feature.modal.*
└── es/
    └── ...
```

### 2. Configure `main.ts`

```typescript
import { i18nPlugin } from "@xiayun/fresh-i18n";

app.use(i18nPlugin({
  languages: ["en", "es"],
  defaultLanguage: "en",
  localesDir: "./locales",
  clientLoad: {
    always: ["common"],
    routes: {
      "/dashboard*": ["feature.dashboard"],
    },
  },
}));
```

### 3. Use it anywhere

**Server (Routes):**

```tsx
export default function Page({ state }: PageProps) {
  return <h1>{state.t("common.welcome")}</h1>;
}
```

**Client (Islands):**

```tsx
import { useTranslation } from "@xiayun/fresh-i18n/client";

export default function MyIsland() {
  const t = useTranslation(); // Magic! No props needed.
  return <button>{t("common.save")}</button>;
}
```

---

## 💎 Pro Features

### Scoped Translators

Stop typing `t("features.navigator.dashboard.actions.save")`. Use namespaced translators:

```tsx
const tLocal = createNamespacedTranslator(t, "features.navigator");
tLocal("dashboard.title"); // -> t("features.navigator.dashboard.title")
```

### Smart Fallbacks

Missing a Spanish translation? The system automatically falls back to English (configurable) and can even show a visual indicator in dev mode so you never miss a string.

### Production Optimized

In production, missing keys fail silently (or show fallback) to keep your UI clean. In development, you get clear console warnings and bracketed keys `[missing.key]` for instant visibility.

---

## 📖 Learn More

- [Complete Migration Guide (Props → Injection)](./docs/MIGRATION_GUIDE.md)
- [Nested Structure Patterns](./docs/NESTED_STRUCTURE.md)
- [Advanced API Reference](./docs/API_REFERENCE.md)

---

## 🤝 Contributing

Open for PRs! Check the [GitHub](https://github.com/ocean-kelp/fresh-i18n) and let's make i18n in Fresh effortless.

MIT License © 2026 ocean-kelp
