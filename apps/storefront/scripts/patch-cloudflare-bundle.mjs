import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as nodeAsyncHooks from "node:async_hooks";
import * as nodeBuffer from "node:buffer";
import * as nodeCrypto from "node:crypto";
import * as nodeFs from "node:fs";
import * as nodeHttp from "node:http";
import * as nodeHttps from "node:https";
import * as nodeModule from "node:module";
import * as nodeNet from "node:net";
import * as nodeOs from "node:os";
import * as nodePath from "node:path";
import * as nodeStream from "node:stream";
import * as nodeStreamPromises from "node:stream/promises";
import * as nodeStreamWeb from "node:stream/web";
import * as nodeTimers from "node:timers";
import * as nodeTimersPromises from "node:timers/promises";
import * as nodeTls from "node:tls";
import * as nodeTty from "node:tty";
import * as nodeUtil from "node:util";
import * as nodeUrl from "node:url";
import * as nodeVm from "node:vm";
import * as nodeWorkerThreads from "node:worker_threads";
import * as nodeZlib from "node:zlib";

const appDirectory = dirname(fileURLToPath(import.meta.url));
const handlerPath = join(appDirectory, "../.open-next/server-functions/default/apps/storefront/handler.mjs");
const source = readFileSync(handlerPath, "utf8");
const fileLoggerImports = 'var _fs=_interop_require_default(require("fs")),_path=_interop_require_default(require("path"));';
const shimMarker = "/* sew-lovely-cloudflare-require-shim */";

if (source.includes(shimMarker)) {
  console.log("Cloudflare require shim is already present.");
  process.exit(0);
}

if (!source.includes("next/dist/server/dev/browser-logs/file-logger.js")) {
  throw new Error("Expected Next file-logger module was not found in the generated Cloudflare handler.");
}

if (!source.includes(fileLoggerImports)) {
  throw new Error("The Next file-logger import shape changed; refusing to deploy an unverified bundle.");
}

const safeImports = "var _fs={default:{mkdirSync(){},writeFileSync(){},dirname(p){return p},existsSync(){return false},appendFileSync(){}}},_path={default:{join(...parts){return parts.join(\"/\")},dirname(p){return p}}};";
let patched = source.replace(fileLoggerImports, safeImports);
const requireShim = `${shimMarker}
import * as nodeAsyncHooks from "node:async_hooks";
import * as nodeBuffer from "node:buffer";
import * as nodeCrypto from "node:crypto";
import * as nodeFs from "node:fs";
import * as nodeHttp from "node:http";
import * as nodeInspector from "node:inspector";
import * as nodeHttps from "node:https";
import * as nodeModule from "node:module";
import * as nodeNet from "node:net";
import * as nodeOs from "node:os";
import * as nodePath from "node:path";
import * as nodeStream from "node:stream";
import * as nodeStreamPromises from "node:stream/promises";
import * as nodeStreamWeb from "node:stream/web";
import * as nodeTimers from "node:timers";
import * as nodeTimersPromises from "node:timers/promises";
import * as nodeTls from "node:tls";
import * as nodeTty from "node:tty";
import * as nodeUtil from "node:util";
import * as nodeUrl from "node:url";
import * as nodeVm from "node:vm";
import * as nodeWorkerThreads from "node:worker_threads";
import * as nodeZlib from "node:zlib";
const __sewLovelyModules = {
  async_hooks: nodeAsyncHooks,
  buffer: nodeBuffer,
  crypto: nodeCrypto,
  fs: nodeFs,
  http: nodeHttp,
  https: nodeHttps,
  inspector: nodeInspector,
  module: nodeModule,
  net: nodeNet,
  os: nodeOs,
  path: nodePath,
  stream: nodeStream,
  "stream/promises": nodeStreamPromises,
  "stream/web": nodeStreamWeb,
  timers: nodeTimers,
  "timers/promises": nodeTimersPromises,
  tls: nodeTls,
  tty: nodeTty,
  util: nodeUtil,
  url: nodeUrl,
  vm: nodeVm,
  worker_threads: nodeWorkerThreads,
  zlib: nodeZlib,
};
const __sewLovelyRequire = (id) => {
  const normalizedId = id.startsWith("node:") ? id.slice(5) : id;
  const module = __sewLovelyModules[normalizedId];
  if (module) return module;
  throw new Error("Unsupported CommonJS require in Cloudflare Worker: " + id);
};
globalThis.require ??= __sewLovelyRequire;
`;
patched = requireShim + patched;
const nodeEnvironmentCalls = "require_node_environment_baseline();require_console_file();require_console_exit();require_console_dim_external();require_unhandled_rejection_external();require_random();require_date();require_web_crypto();require_node_crypto();require_fast_set_immediate_external()";
if (!patched.includes(nodeEnvironmentCalls)) {
  throw new Error("Expected Next node-environment extension sequence was not found; refusing to deploy an unverified bundle.");
}
patched = patched.replace(nodeEnvironmentCalls, "require_node_environment_baseline();");
writeFileSync(handlerPath, patched);
console.log("Removed incompatible Next Node environment extensions and added a complete CommonJS compatibility shim.");
