// Résout l'alias "@/" de tsconfig et ajoute l'extension .ts,
// pour exécuter les modules du projet hors du bundler Next.
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = pathToFileURL(process.cwd() + "/").href;

export function resolve(specifier, context, next) {
  let target = specifier.startsWith("@/") ? root + specifier.slice(2) : specifier;

  if (target.startsWith("file:") || target.startsWith(".") || target.startsWith("/")) {
    const url = target.startsWith("file:")
      ? target
      : new URL(target, context.parentURL ?? root).href;
    if (!/\.[a-z]+$/.test(url)) {
      for (const ext of [".ts", ".tsx", ".js", ".mjs"]) {
        if (existsSync(fileURLToPath(url + ext))) return next(url + ext, context);
      }
    }
    return next(url, context);
  }
  return next(target, context);
}
