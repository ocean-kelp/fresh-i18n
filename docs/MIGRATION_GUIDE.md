# Migration Guide: Props → Client-Side Injection

## Overview

Migrate from prop-drilling to automatic client-side translation injection with **zero duplication** using the `fallback: "none"` strategy.

## Strategy: Zero-Duplication Gradual Migration

### Phase 1: Enable with Empty Config

```typescript
// main.ts
app.use(i18nPlugin({
  languages: ["en", "es"],
  defaultLanguage: "en",
  localesDir: "./locales",
  clientLoad: {
    always: [], // Empty - no automatic loading
    routes: {}, // Empty - no routes yet
    fallback: "none", // 🔑 Key: Skip injection for unmapped routes
  },
}));
```

**Result:**

- ✅ No script injection anywhere
- ✅ All routes continue using props
- ✅ No changes to existing code
- ✅ Zero duplication

### Phase 2: Migrate Route-by-Route

Pick one route (e.g., `/indicators`) and migrate it:

#### 2.1 Add Route to Config

```typescript
clientLoad: {
  always: [],
  routes: {
    "/indicators/*": ["common", "features.indicators"],  // Add this
  },
  fallback: "none",
}
```

#### 2.2 Update Island to Use Hook

**Before:**

```typescript
import { translate } from "@xiayun/fresh-i18n";

interface Props {
  translationData: Record<string, unknown>;
  translationConfig?: { ... };
}

export default function IndicatorsList({ translationData, translationConfig }: Props) {
  const config = translationConfig ? {
    ...translationConfig,
    fallbackKeys: new Set(translationConfig.fallbackKeys ?? []),
  } : undefined;
  
  const t = translate(translationData, config);
  return <button>{t("common.actions.save")}</button>;
}
```

**After:**

```typescript
import { useTranslation } from "@xiayun/fresh-i18n/client";

export default function IndicatorsList() {
  const t = useTranslation();
  return <button>{t("common.actions.save")}</button>;
}
```

#### 2.3 Remove Props from Route

**Before:**

```typescript
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

export default function IndicatorsPage({ data, state }: PageProps<RouteData, State>) {
  return (
    <div>
      <h1>{state.t("features.indicators.title")}</h1>
      <IndicatorsList
        translationData={data.translationData}
        translationConfig={data.translationConfig}
      />
    </div>
  );
}
```

**After:**

```typescript
// No handler needed!

export default function IndicatorsPage({ state }: PageProps<unknown, State>) {
  return (
    <div>
      <h1>{state.t("features.indicators.title")}</h1>
      <IndicatorsList /> {/* No props! */}
    </div>
  );
}
```

#### 2.4 Test the Route

1. Visit `/indicators/123`
2. Verify translations load correctly
3. Check browser console for script injection: `window.__I18N__`
4. Check network tab: Should see reduced HTML payload

**Result for this route:**

- ✅ 90% payload reduction (50KB → 5KB)
- ✅ Cleaner code (no handler, no props)
- ✅ Still works with `state.t` in route component

#### 2.5 Other Routes Unchanged

Routes like `/admin/users` (not yet migrated):

- ✅ No script injection (fallback is "none")
- ✅ Still use props as before
- ✅ No duplication

### Phase 3: Repeat for All Routes

Continue adding routes one at a time:

```typescript
clientLoad: {
  always: [],
  routes: {
    "/indicators/*": ["common", "features.indicators"],
    "/goals/*": ["common", "features.goals"],           // Week 2
    "/matrix/*": ["common", "features.matrix"],          // Week 3
    "/admin/*": ["common", "features.admin"],            // Week 4
  },
  fallback: "none",
}
```

### Phase 4: Final Optimization

After all routes migrated, optimize the config:

```typescript
clientLoad: {
  always: ["common"],                  // Now load common everywhere
  routes: {
    "/indicators/*": ["features.indicators"],  // Remove "common" (in always)
    "/goals/*": ["features.goals"],
    "/matrix/*": ["features.matrix"],
    "/admin/*": ["features.admin"],
  },
  fallback: "always-only",             // Change from "none" to "always-only"
}
```

**Why this change?**

- "common" is needed everywhere, so put it in `always`
- Remove "common" from route patterns (no duplication)
- Change fallback to "always-only" since all routes are mapped

## Benefits Summary

### During Migration (fallback: "none")

- ✅ Zero duplication (no wasted bytes)
- ✅ Migrate at your own pace
- ✅ Easy rollback (remove from routes)
- ✅ Test each route independently

### After Migration (fallback: "always-only")

- ✅ 90% payload reduction across entire app
- ✅ No prop-drilling code anywhere
- ✅ Cleaner, more maintainable codebase
- ✅ Better performance

## Rollback Strategy

If you need to rollback a migrated route:

1. Remove route from `clientLoad.routes`
2. Add handler back to route
3. Add props back to island
4. Deploy

The old code pattern still works - nothing breaks!

## Common Issues

### Issue: "Translation data not found"

**Cause:** Island uses `useTranslation()` but route isn't in `clientLoad.routes`

**Fix:** Either:

- Add route to config: `"/your-route/*": ["namespace"]`
- OR revert island to use props

### Issue: Translations duplicated in HTML

**Cause:** Using `fallback: "always-only"` or `fallback: "all"` during migration

**Fix:** Change to `fallback: "none"` until all routes migrated

### Issue: Some translations missing in island

**Cause:** Route pattern doesn't include all needed namespaces

**Fix:** Add missing namespaces to route config:

```typescript
"/indicators/*": ["common", "features.indicators", "features.shared"]
```

## Timeline Example

**Week 1:** Enable config, migrate `/indicators` → Test → Verify savings

**Week 2:** Migrate `/goals` → Test

**Week 3:** Migrate `/matrix` → Test

**Week 4:** Migrate `/admin` → Test

**Week 5:** Optimize config (move common to `always`, change fallback)

**Total:** ~5 weeks for complete migration with thorough testing

## Checklist

- [ ] Enable `clientLoad` with `fallback: "none"`
- [ ] Pick first route to migrate
- [ ] Add route pattern to config
- [ ] Update island to use `useTranslation()`
- [ ] Remove handler/props from route
- [ ] Test thoroughly
- [ ] Repeat for remaining routes
- [ ] Optimize config after full migration
- [ ] Remove old prop-based code
- [ ] Celebrate 90% payload reduction! 🎉
