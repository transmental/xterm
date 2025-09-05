import { TwitterApi, EUploadMimeType } from "twitter-api-v2";
import type { StoredTokens } from "./config.js";

export type XEnv = {
  CLIENT_ID: string;
  CLIENT_SECRET?: string; // optional for PKCE, not used in token exchange on X
  REDIRECT_URI: string; // e.g. http://127.0.0.1:8787/callback
};

export const SCOPES = [
  "tweet.read",
  "tweet.write",
  "users.read",
  "media.write",
  "offline.access",
];

export function xClientApp(env: XEnv) {
  return new TwitterApi({
    clientId: env.CLIENT_ID,
    clientSecret: env.CLIENT_SECRET,
  });
}

export function xClientUser(tokens: StoredTokens) {
  return new TwitterApi(tokens.accessToken);
}

export async function refreshIfNeeded(
  app: TwitterApi,
  env: XEnv,
  tokens: StoredTokens
): Promise<StoredTokens> {
  const now = Date.now();
  if (now < tokens.expiresAt - 30_000) return tokens;
  const refreshed = await app.refreshOAuth2Token(tokens.refreshToken);
  return {
    accessToken: refreshed.accessToken,
    refreshToken: refreshed.refreshToken!,
    expiresAt: now + refreshed.expiresIn * 1000,
  };
}

export async function postText(client: TwitterApi, text: string) {
  const res = await client.v2.tweet(text);
  return res.data;
}

async function uploadImageV2(
  client: TwitterApi,
  imageBuffer: Buffer,
  mimeType: string | EUploadMimeType = EUploadMimeType.Png
) {
  // Use twitter-api-v2 built-in upload instead of manual fetch
  // This handles OAuth properly and avoids the 400 error

  // Convert string mime type to EUploadMimeType if needed
  let resolvedMimeType: EUploadMimeType;
  if (typeof mimeType === "string") {
    // Handle common formats
    const mimeMap: Record<string, EUploadMimeType> = {
      "image/png": EUploadMimeType.Png,
      "image/jpeg": EUploadMimeType.Jpeg,
      "image/jpg": EUploadMimeType.Jpeg,
      "image/gif": EUploadMimeType.Gif,
      "image/webp": EUploadMimeType.Webp,
      "video/mp4": EUploadMimeType.Mp4,
      "video/quicktime": EUploadMimeType.Mov,
      "video/mov": EUploadMimeType.Mov,
      // Also handle extension-only formats
      png: EUploadMimeType.Png,
      jpeg: EUploadMimeType.Jpeg,
      jpg: EUploadMimeType.Jpeg,
      gif: EUploadMimeType.Gif,
      webp: EUploadMimeType.Webp,
      mp4: EUploadMimeType.Mp4,
      mov: EUploadMimeType.Mov,
    };
    resolvedMimeType = mimeMap[mimeType.toLowerCase()] || EUploadMimeType.Png;
  } else {
    resolvedMimeType = mimeType;
  }

  // Determine media category from mime type
  let mediaCategory: string;
  if (
    [
      EUploadMimeType.Png,
      EUploadMimeType.Jpeg,
      EUploadMimeType.Gif,
      EUploadMimeType.Webp,
    ].includes(resolvedMimeType)
  ) {
    mediaCategory = "tweet_image";
  } else if (
    [EUploadMimeType.Mp4, EUploadMimeType.Mov].includes(resolvedMimeType)
  ) {
    mediaCategory = "tweet_video";
  } else {
    throw new Error(`Unsupported mime type: ${mimeType}`);
  }

  try {
    const mediaUpload = await client.v2.uploadMedia(imageBuffer, {
      media_type: resolvedMimeType,
      media_category: mediaCategory as any,
    });
    return mediaUpload;
  } catch (error) {
    throw new Error(`Media upload failed: ${error}`);
  }
}

export async function postWithImageV2(
  client: TwitterApi,
  text: string,
  image: Buffer,
  mimeType: string | EUploadMimeType = EUploadMimeType.Png
) {
  const mediaId = await uploadImageV2(client, image, mimeType);
  const posted = await client.v2.tweet({
    text,
    media: { media_ids: [mediaId] },
  });
  return posted.data;
}

export async function me(client: TwitterApi) {
  const u = await client.v2.me();
  return u.data;
}
