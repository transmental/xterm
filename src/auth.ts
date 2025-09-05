import http from "http";
import { URL } from "url";
import open from "open";
import { xClientApp, SCOPES } from "./x.js";
import { saveOAuthTemp, loadOAuthTemp, saveTokens } from "./config.js";

export async function login(opts: {
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  port?: number;
}) {
  const app = xClientApp({
    CLIENT_ID: opts.clientId,
    CLIENT_SECRET: opts.clientSecret,
    REDIRECT_URI: opts.redirectUri,
  });

  const { url, codeVerifier, state } = app.generateOAuth2AuthLink(
    opts.redirectUri,
    {
      scope: SCOPES,
    }
  );

  saveOAuthTemp({ codeVerifier, state });

  await open(url);

  const port = opts.port ?? Number(new URL(opts.redirectUri).port || 8787);

  const tokens = await new Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }>((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        if (!req.url) return;
        const full = new URL(req.url, `http://127.0.0.1:${port}`);
        if (full.pathname !== new URL(opts.redirectUri).pathname) return;

        const code = full.searchParams.get("code");
        const returnedState = full.searchParams.get("state");

        const temp = loadOAuthTemp();
        if (!temp || !code || !returnedState || temp.state !== returnedState) {
          res.writeHead(400, { "Content-Type": "text/plain" });
          res.end("OAuth failed. You can close this window.");
          reject(new Error("Invalid state or missing code."));
          server.close();
          return;
        }

        const { codeVerifier } = temp;
        const { accessToken, refreshToken, expiresIn } =
          await app.loginWithOAuth2({
            code,
            codeVerifier,
            redirectUri: opts.redirectUri,
          });

        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Login successful. You can close this window.");
        resolve({ accessToken, refreshToken: refreshToken!, expiresIn });
        server.close();
      } catch (e) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("OAuth error. You can close this window.");
        reject(e);
      }
    });
    server.listen(port, "127.0.0.1");
  });

  const expiresAt = Date.now() + tokens.expiresIn * 1000;
  saveTokens({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresAt,
  });
}
