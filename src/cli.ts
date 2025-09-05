#!/usr/bin/env node
import yargs, { Argv } from "yargs";
import { hideBin } from "yargs/helpers";
import { loadTokens, saveTokens } from "./config.js";
import { login } from "./auth.js";
import {
  me,
  postText,
  postWithImageV2,
  xClientApp,
  xClientUser,
  refreshIfNeeded,
} from "./x.js";
import { readFileSync, existsSync } from "fs";
import readline from "readline";
import { basename } from "path";
import { EUploadMimeType } from "twitter-api-v2";

// Minimal .env loader (avoids extra dependency). Only parses KEY=VALUE lines.
function loadDotEnv() {
  const envPath = ".env";
  if (!existsSync(envPath)) return;
  try {
    const txt = readFileSync(envPath, "utf8");
    for (const line of txt.split(/\r?\n/)) {
      if (!line || line.startsWith("#")) continue;
      const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (!m) continue;
      let [, k, v] = m;
      v = v.trim();
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1);
      }
      if (!(k in process.env)) process.env[k] = v;
    }
  } catch {
    /* ignore */
  }
}

loadDotEnv();

async function getAuthedClient() {
  const CLIENT_ID =
    process.env.X_CLIENT_ID || "cjVHaDdhTW5FUGJTZmo0eUJIcUw6MTpjaQ";
  const CLIENT_SECRET = process.env.X_CLIENT_SECRET; // optional for PKCE; kept for compatibility

  const REDIRECT_URI =
    process.env.X_REDIRECT_URI || "http://127.0.0.1:8787/callback";

  let tokens = loadTokens();
  if (!tokens) {
    console.error("No tokens found. Run: xpost login");
    process.exit(1);
  }

  const app = xClientApp({ CLIENT_ID, CLIENT_SECRET, REDIRECT_URI });
  tokens = await refreshIfNeeded(
    app,
    { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI },
    tokens
  );
  saveTokens(tokens);
  return xClientUser(tokens);
}

async function interactiveShell() {
  console.log(
    "xterm interactive shell. Type 'help' for commands, 'exit' to quit.\n"
  );
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    historySize: 200,
  });
  const prompt = () => {
    rl.setPrompt("xterm> ");
    rl.prompt();
  };

  async function ensureClient() {
    try {
      return await getAuthedClient();
    } catch (e) {
      console.error((e as Error).message);
      return null;
    }
  }

  rl.on("line", async (line) => {
    const raw = line.trim();
    if (!raw) return prompt();
    if (raw === "exit" || raw === "quit") {
      rl.close();
      return;
    }
    if (raw === "help") {
      console.log(`Commands:
  login                      Authorize account
  whoami                     Show authorized account
  post <text>                Post text
  post-media <path> <text>   Post image + text
  exit|quit                  Leave shell`);
      prompt();
      return;
    }
    const [cmd, ...rest] = raw.split(/\s+/);
    try {
      switch (cmd) {
        case "login": {
          const CLIENT_ID =
            process.env.X_CLIENT_ID || "cjVHaDdhTW5FUGJTZmo0eUJIcUw6MTpjaQ";
          const CLIENT_SECRET = process.env.X_CLIENT_SECRET;
          const REDIRECT_URI =
            process.env.X_REDIRECT_URI || "http://127.0.0.1:8787/callback";
          await login({
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            redirectUri: REDIRECT_URI,
          });
          console.log("Logged in.");
          break;
        }
        case "whoami": {
          const client = await ensureClient();
          if (!client) break;
          const u = await me(client);
          console.log(`${u.name} (@${u.username}) — ${u.id}`);
          break;
        }
        case "post": {
          if (rest.length === 0) {
            console.error("Usage: post <text>");
            break;
          }
          const client = await ensureClient();
          if (!client) break;
          const text = raw.slice(5).trim();
          const res = await postText(client, text);
          console.log(`Posted: id=${res.id}`);
          break;
        }
        case "post-media": {
          if (rest.length < 2) {
            console.error("Usage: post-media <path> <text>");
            break;
          }
          const client = await ensureClient();
          if (!client) break;
          const path = rest[0];
          const text = raw.split(/\s+/).slice(2).join(" "); // simple split; path can't contain spaces
          const data = readFileSync(path);
          const lower = basename(path).toLowerCase();
          let mime: EUploadMimeType | undefined;
          if (lower.endsWith(".png")) mime = EUploadMimeType.Png;
          else if (lower.endsWith(".jpg") || lower.endsWith(".jpeg"))
            mime = EUploadMimeType.Jpeg;
          else if (lower.endsWith(".gif")) mime = EUploadMimeType.Gif;
          else if (lower.endsWith(".mp4")) mime = EUploadMimeType.Mp4;
          else if (lower.endsWith(".mov")) mime = EUploadMimeType.Mov;
          if (!mime) {
            console.error("Unsupported image type. Use PNG/JPG/GIF/MP4/MOV.");
            break;
          }
          const res = await postWithImageV2(client, text, data, mime);
          console.log(`Posted with media: id=${res.id}`);
          break;
        }
        default:
          console.error("Unknown command. Type 'help'.");
      }
    } catch (e) {
      console.error("Error:", (e as Error).message);
    } finally {
      prompt();
    }
  });
  rl.on("close", () => {
    console.log("Bye.");
    process.exit(0);
  });
  prompt();
}

const argvInput = hideBin(process.argv);
if (argvInput.length === 0) {
  await (async () => {
    await interactiveShell();
  })();
} else {
  yargs(argvInput)
    .scriptName("xterm")
    .command(
      "login",
      "Authorize this CLI with your X account",
      {},
      async () => {
        const CLIENT_ID =
          process.env.X_CLIENT_ID || "cjVHaDdhTW5FUGJTZmo0eUJIcUw6MTpjaQ";
        const CLIENT_SECRET = process.env.X_CLIENT_SECRET;
        const REDIRECT_URI =
          process.env.X_REDIRECT_URI || "http://127.0.0.1:8787/callback";
        await login({
          clientId: CLIENT_ID,
          clientSecret: CLIENT_SECRET,
          redirectUri: REDIRECT_URI,
        });
        console.log("Logged in.");
      }
    )
    .command("whoami", "Show the authorized account", {}, async () => {
      const client = await getAuthedClient();
      const u = await me(client);
      console.log(`${u.name} (@${u.username}) — ${u.id}`);
    })
    .command(
      "post <text>",
      "Post a text update",
      (y: Argv) => y.positional("text", { type: "string", demandOption: true }),
      async (argv: { text: string }) => {
        const client = await getAuthedClient();
        const res = await postText(client, String(argv.text));
        console.log(`Posted: id=${res.id}`);
      }
    )
    .command(
      "post-media <path> <text>",
      "Post with media (image/video) and text",
      (y: Argv) =>
        y
          .positional("path", { type: "string", demandOption: true })
          .positional("text", { type: "string", demandOption: true }),
      async (argv: { path: string; text: string }) => {
        const client = await getAuthedClient();
        const p = String(argv.path);
        const data = readFileSync(p);
        const lower = basename(p).toLowerCase();
        let mime: EUploadMimeType;
        if (lower.endsWith(".png")) mime = EUploadMimeType.Png;
        else if (lower.endsWith(".jpg") || lower.endsWith(".jpeg"))
          mime = EUploadMimeType.Jpeg;
        else if (lower.endsWith(".gif")) mime = EUploadMimeType.Gif;
        else if (lower.endsWith(".mp4")) mime = EUploadMimeType.Mp4;
        else if (lower.endsWith(".mov")) mime = EUploadMimeType.Mov;
        else {
          console.error("Unsupported media type. Use PNG/JPG/GIF/MP4/MOV.");
          process.exit(1);
          return;
        }
        const res = await postWithImageV2(client, String(argv.text), data);
        console.log(`Posted with media: id=${res.id}`);
      }
    )
    // interactive mode handles empty invocation; don't demand when args provided
    .strict()
    .help()
    .parse();
}
