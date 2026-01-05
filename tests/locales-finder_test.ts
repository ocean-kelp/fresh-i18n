import { assertEquals } from "jsr:@std/assert@^1.0.0";
import { findLocalesDirectory, getEffectiveLocalesDir } from "../src/locales-finder.ts";

Deno.test("findLocalesDirectory - finds locales in current directory", async () => {
  // Create temp directory structure
  const tempDir = await Deno.makeTempDir();
  const localesPath = `${tempDir}/locales`;
  await Deno.mkdir(localesPath);

  try {
    // Change to temp directory
    const originalCwd = Deno.cwd();
    Deno.chdir(tempDir);

    const result = await findLocalesDirectory();
    assertEquals(result, "./locales");

    // Restore original directory
    Deno.chdir(originalCwd);
  } finally {
    // Cleanup
    await Deno.remove(tempDir, { recursive: true });
  }
});

Deno.test("findLocalesDirectory - returns null when not found", async () => {
  // Create temp directory without locales
  const tempDir = await Deno.makeTempDir();

  try {
    const originalCwd = Deno.cwd();
    Deno.chdir(tempDir);

    const result = await findLocalesDirectory();
    assertEquals(result, null);

    Deno.chdir(originalCwd);
  } finally {
    await Deno.remove(tempDir, { recursive: true });
  }
});

Deno.test("getEffectiveLocalesDir - uses preferred path when exists", async () => {
  const tempDir = await Deno.makeTempDir();
  const customPath = `${tempDir}/custom-locales`;
  await Deno.mkdir(customPath);

  try {
    const result = await getEffectiveLocalesDir(customPath);
    assertEquals(result, customPath);
  } finally {
    await Deno.remove(tempDir, { recursive: true });
  }
});

Deno.test("getEffectiveLocalesDir - falls back to search when preferred not found", async () => {
  const tempDir = await Deno.makeTempDir();
  const localesPath = `${tempDir}/locales`;
  await Deno.mkdir(localesPath);

  try {
    const originalCwd = Deno.cwd();
    Deno.chdir(tempDir);

    const result = await getEffectiveLocalesDir("./nonexistent");
    assertEquals(result, "./locales");

    Deno.chdir(originalCwd);
  } finally {
    await Deno.remove(tempDir, { recursive: true });
  }
});
