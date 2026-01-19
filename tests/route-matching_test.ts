import { assertEquals } from "jsr:@std/assert";

// Import the functions we need to test - they're not exported so we'll test via the module
// For now, we'll create standalone versions for testing
// In real implementation, consider exporting these from plugin.ts for testing

function normalizeUrlPath(path: string): string {
  if (path === "/" || !path.endsWith("/")) return path;
  return path.slice(0, -1);
}

function matchRoutePattern(urlPath: string, pattern: string): boolean {
  if (urlPath === pattern) return true;

  if (pattern.includes("*")) {
    const prefix = pattern.substring(0, pattern.indexOf("*"));
    if (!urlPath.startsWith(prefix)) return false;
    return true;
  }

  return false;
}

function extractNamespaces(
  allTranslations: Record<string, unknown>,
  namespaces: string[],
): Record<string, unknown> {
  // Handle special skip injection signal
  if (namespaces.length === 1 && namespaces[0] === "__SKIP_INJECTION__") {
    return {};
  }

  if (namespaces.length === 0) {
    return allTranslations;
  }

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(allTranslations)) {
    const matches = namespaces.some((ns) =>
      key === ns || key.startsWith(`${ns}.`)
    );

    if (matches) {
      result[key] = value;
    }
  }

  return result;
}

Deno.test("normalizeUrlPath - removes trailing slash", () => {
  assertEquals(normalizeUrlPath("/indicators/"), "/indicators");
  assertEquals(normalizeUrlPath("/matrix/indicators/"), "/matrix/indicators");
});

Deno.test("normalizeUrlPath - keeps root slash", () => {
  assertEquals(normalizeUrlPath("/"), "/");
});

Deno.test("normalizeUrlPath - preserves paths without trailing slash", () => {
  assertEquals(normalizeUrlPath("/indicators"), "/indicators");
  assertEquals(normalizeUrlPath("/matrix/indicators/123"), "/matrix/indicators/123");
});

Deno.test("matchRoutePattern - exact match", () => {
  assertEquals(matchRoutePattern("/indicators", "/indicators"), true);
  assertEquals(matchRoutePattern("/matrix/indicators", "/matrix/indicators"), true);
});

Deno.test("matchRoutePattern - wildcard greedy match", () => {
  assertEquals(matchRoutePattern("/indicators/123", "/indicators/*"), true);
  assertEquals(matchRoutePattern("/indicators/123/edit", "/indicators/*"), true);
  assertEquals(matchRoutePattern("/indicators/a/b/c/d", "/indicators/*"), true);
});

Deno.test("matchRoutePattern - wildcard prefix must match", () => {
  assertEquals(matchRoutePattern("/matrix/indicators/123", "/indicators/*"), false);
  assertEquals(matchRoutePattern("/admin/users", "/users/*"), false);
});

Deno.test("matchRoutePattern - specific vs general patterns", () => {
  // More specific pattern
  assertEquals(matchRoutePattern("/matrix/indicators/123", "/matrix/indicators/*"), true);
  
  // General pattern doesn't match specific URL with different prefix
  assertEquals(matchRoutePattern("/matrix/indicators/123", "/indicators/*"), false);
});

Deno.test("matchRoutePattern - no wildcard requires exact match", () => {
  assertEquals(matchRoutePattern("/indicators/123", "/indicators"), false);
  assertEquals(matchRoutePattern("/indicators", "/indicators"), true);
});

Deno.test("matchRoutePattern - root path", () => {
  assertEquals(matchRoutePattern("/", "/"), true);
  assertEquals(matchRoutePattern("/indicators", "/"), false);
  assertEquals(matchRoutePattern("/anything", "/*"), true);
});

Deno.test("extractNamespaces - filters by prefix match", () => {
  const allTranslations = {
    "common.save": "Save",
    "common.cancel": "Cancel",
    "features.indicators.title": "Indicators",
    "features.indicators.list.empty": "No indicators",
    "features.admin.users": "Users",
  };

  const result = extractNamespaces(allTranslations, ["common", "features.indicators"]);

  assertEquals(result, {
    "common.save": "Save",
    "common.cancel": "Cancel",
    "features.indicators.title": "Indicators",
    "features.indicators.list.empty": "No indicators",
  });
});

Deno.test("extractNamespaces - empty namespaces returns all", () => {
  const allTranslations = {
    "common.save": "Save",
    "features.indicators.title": "Indicators",
  };

  const result = extractNamespaces(allTranslations, []);

  assertEquals(result, allTranslations);
});

Deno.test("extractNamespaces - exact namespace match", () => {
  const allTranslations = {
    "common": "Common Root",
    "common.save": "Save",
    "commonExtra": "Should not match",
  };

  const result = extractNamespaces(allTranslations, ["common"]);

  assertEquals(result, {
    "common": "Common Root",
    "common.save": "Save",
  });
});

Deno.test("extractNamespaces - no matches returns empty", () => {
  const allTranslations = {
    "common.save": "Save",
    "features.indicators.title": "Indicators",
  };

  const result = extractNamespaces(allTranslations, ["admin"]);

  assertEquals(result, {});
});

Deno.test("extractNamespaces - multiple namespace prefixes", () => {
  const allTranslations = {
    "common.save": "Save",
    "features.indicators.title": "Indicators",
    "features.admin.users": "Users",
    "features.goals.create": "Create Goal",
  };

  const result = extractNamespaces(allTranslations, [
    "common",
    "features.admin",
    "features.goals",
  ]);

  assertEquals(result, {
    "common.save": "Save",
    "features.admin.users": "Users",
    "features.goals.create": "Create Goal",
  });
});

Deno.test("extractNamespaces - skip injection signal returns empty", () => {
  const allTranslations = {
    "common.save": "Save",
    "features.indicators.title": "Indicators",
  };

  const result = extractNamespaces(allTranslations, ["__SKIP_INJECTION__"]);

  assertEquals(result, {});
});
