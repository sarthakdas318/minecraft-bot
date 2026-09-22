import { config } from "../config/index.js";
import { logger } from "../utils/logger.js";

export async function getServerStatus() {
  const { host, port, platform, version: configuredVersion } = config.mc;
  const url = `https://minecraft-serverhub.com/api/ping?host=${host}&port=${port}&platform=${platform}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // Dynamic versioning: prefer live version from ping response,
    // fallback to configured version (config.mc.version -> env MC_VERSION or constants)
    // Handles cases where version may be string, object, or missing - never hardcoded.
    let liveVersion = data?.version;

    // Some ping APIs return version as object e.g. { minecraftVersion: "...", version: 2193 }
    if (liveVersion && typeof liveVersion === "object") {
      liveVersion = liveVersion.minecraftVersion ?? liveVersion.version ?? null;
    }

    const resolvedVersion = liveVersion
      ? String(liveVersion)
      : configuredVersion
        ? String(configuredVersion)
        : undefined;

    return {
      ...data,
      // only override version if we have a resolved dynamic value, otherwise keep live value
      ...(resolvedVersion ? { version: resolvedVersion } : {}),
    };
  } catch (err) {
    logger.error("Failed to fetch server status:", err.message);
    // Return offline status with dynamic version (from env/config or undefined -> auto)
    // Do not hardcode version string - use configuredVersion from config
    return {
      online: false,
      players: { online: 0, max: 0 },
      version: configuredVersion ? String(configuredVersion) : undefined,
      motd: null,
      favicon: null,
      ping: null,
    };
  }
}
