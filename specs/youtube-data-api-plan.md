# YouTube Data API channel + video resolution plan

Resolve a submitted YouTube watch URL to its channel id, channel name, video title, publish date
and duration with one call to the YouTube Data API v3 `videos.list` method, instead of scraping
YouTube HTML. Written 2026-09-04. Nothing here is implemented yet; section 9 tracks progress.

Supersedes `specs/fetch-channel-info.md`, which specified an HTML scraper. That file should be
deleted when section 6 lands.

## 1. Why

DB-001 needs a stable channel key. Supadata's `VideoMetadata` returns `author.displayName` and
`author.avatarUrl` but no channel id and no channel URL, so the ledger had no safe way to identify
a channel: names are not unique and a rename splits a channel's history.

The previous answer was to scrape the channel page. Measured 2026-09-04 against live YouTube HTML
with the proposed `Mozilla/5.0 (compatible; SupaTube/1.0)` User-Agent:

| Extraction | `/@mkbhd` | `/channel/UC4Qob...` |
|---|---|---|
| `"channelId":"` | match | match |
| `"externalId":"` | match | — |
| `rel="canonical"` channel href | match | — |
| `"channelName":"` | **no match** | **no match** |
| `<meta name="title"` | **no match** | **no match** |
| `<meta property="og:title"` | match | match |
| `"author":"` | **no match** | **no match** |

Three of the four name patterns are dead against current markup; name resolution rides entirely on
`og:title`, and the spec throws when nothing matches. Two further problems from the same run:

- The channel page came back **in Spanish** (`"Principal"`, `"Suscribirse"`). Markup varies with the
  caller's IP-derived locale, so what parses from a laptop may not parse from a server.
- All measurements were from a residential IP. YouTube throttles datacenter ranges, and this app
  deploys to Railway. The scraper could pass locally and fail in production.

`og:title` is also HTML-escaped, so a channel named "Rhett & Link" would be stored as
`Rhett &amp; Link`.

The API removes all four problems: one authenticated call, plain-text fields, no markup coupling,
no IP-reputation exposure.

## 2. Verified facts (YouTube Data API v3)

Fetched 2026-09-04 from `developers.google.com/youtube/v3/docs`.

| Fact | Source |
|---|---|
| `GET https://www.googleapis.com/youtube/v3/videos`. `part` required; filter is exactly one of `id`, `chart`, `myRating`. | videos/list, "Parameters" |
| `videos.list` costs **1 unit**. | videos/list, "Quota impact" |
| `snippet.channelId` — "The ID that YouTube uses to uniquely identify the channel that the video was uploaded to." | videos resource, "Properties" |
| `snippet.channelTitle` — "The name of the channel to which the video belongs." Plain text, not HTML-escaped. | videos resource |
| `snippet.title` — the video's name, max 100 chars. | videos resource |
| `snippet.publishedAt` — publish date and time, **ISO 8601**. | videos resource |
| `contentDetails.duration` — length in **ISO 8601 duration** format (`PT15M33S`, `P#DT#H#M#S`). Not seconds. | videos resource |
| Documented errors: `badRequest (400) videoChartNotFound`, `forbidden (403)`, `notFound (404) videoNotFound`. | videos/list, "Errors" |
| `channels.list` filters: one of `id`, `categoryId`, `mine`, `managedByMe`, `forHandle`, `forUsername`. `forHandle` takes a handle with or without a leading `@`. Cost 1 unit. | channels/list, "Parameters" |
| Public reads need only an API key as the `key` query parameter; OAuth is for private user data. | registering_an_application |
| Default quota is 10,000 units/day. All requests, including invalid ones, cost at least 1 unit. | getting-started, "Quota usage" |

**One call covers almost the whole `videos` + `channels` write.** `part=snippet,contentDetails`
with the video id returns channel id, channel name, video title, publish date and duration for
1 unit. Not covered: `channels.url` (build it as `https://www.youtube.com/channel/<id>`) and
`videos.transcript` (no source; INT-001).

Confirm during setup (section 4, step 6): the exact response for a video id that does not exist.
Expect `200` with `items: []` and `totalResults: 0`, but treat a `404 videoNotFound` the same way.

## 3. Decisions

- **D-1 Official API, no scraping fallback.** A missing key or an API error throws. No silent
  fallback to HTML parsing — the global rule is fail fast, report the exact error, stop.
- **D-2 Node `fetch`, no HTTP library.** Server code on Node 26 under adapter-node. No axios for
  one GET.
- **D-3 `YOUTUBE_API_KEY` is a runtime secret** read through `$env/dynamic/private` at call time.
  It must never reach the browser, so it is **not** `PUBLIC_`-prefixed and must not be added to the
  `define` block in `vite.config.ts` — that block is what put `CHART_IMG_API_KEY` and
  `SUPADATA_API_KEY` in the client bundle (issue #3).
- **D-4 The watch URL is the entry point.** TradeScout only ever has a watch URL, so the primary
  helper is `fetchVideoInfo(watchUrl)` using `videos.list`. A channel-URL resolver is **not** built
  in this plan; nothing calls one.
- **D-5 Accept `watch?v=`, `youtu.be/`, `/shorts/`, `/live/`.** Anything else throws with a message
  naming the accepted formats. Ids are validated against `/^[\w-]{11}$/` before the call.
- **D-6 Validate the channel id the API returns** against `/^UC[\w-]{22}$/`. It should never fail;
  it guards against a response-shape change.
- **D-7 `part=snippet,contentDetails` only.** Still 1 unit. Do not request `statistics`,
  `status`, or `player`.
- **D-8 Never put the request URL in an error message or a log line** — it carries the key. Build
  messages from the watch URL and the API's `error.message`.
- **D-9 Duration is converted to seconds** at the boundary. `contentDetails.duration` is ISO 8601
  (`PT15M33S`), and `videos.durationSeconds` is a number.

## 4. Manual setup in Google Cloud

No billing account, OAuth consent screen, or domain verification is needed for the default quota
with an API key.

1. Sign in at `https://console.cloud.google.com/`.
2. Project selector → **New project** → name it `tradescout` → **Create**, then select it.
3. **APIs & Services → Library** → search `YouTube Data API v3` → **Enable**. Verify under
   **Enabled APIs & services** that it is listed and ON.
4. **APIs & Services → Credentials → Create credentials → API key**. Copy it.
5. Restrict the key on its edit page:
   - **Application restrictions:** None. Railway's egress IP is not fixed, and the key never
     reaches a browser.
   - **API restrictions:** Restrict key → tick only **YouTube Data API v3** → **Save**.
   Restrictions take a few minutes to apply.
6. Verify from a shell, and record the unknown-video result in section 2:

   ```bash
   export YOUTUBE_API_KEY=...

   # a real video: expect channelId, channelTitle, title, publishedAt, duration
   curl -s "https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=jNQXAC9IVRw&key=$YOUTUBE_API_KEY" \
     | jq '{total: .pageInfo.totalResults, channelId: .items[0].snippet.channelId,
            channelTitle: .items[0].snippet.channelTitle, title: .items[0].snippet.title,
            publishedAt: .items[0].snippet.publishedAt, duration: .items[0].contentDetails.duration}'

   # a video id that does not exist; record status and body in section 2
   curl -s -w '\nstatus %{http_code}\n' \
     "https://www.googleapis.com/youtube/v3/videos?part=snippet&id=aaaaaaaaaaa&key=$YOUTUBE_API_KEY"
   ```

   A `403` with `forbidden` or `keyInvalid` means the key is wrong or the API is not enabled on its
   project. `403 quotaExceeded` means the daily 10,000 is spent.
7. Store the key. Local: `YOUTUBE_API_KEY=` in `.env.local`. Railway: app service → **Variables**
   → add `YOUTUBE_API_KEY` and seal it. Runtime variable, so a restart is enough — no rebuild.

## 5. Environment variables

Add to `.env.example`:

```bash
# ---------------------------------------------------------------- YouTube Data API
# [runtime, server-only] Resolves a submitted watch URL to its channel id, channel name, video
# title, publish date and duration (videos.list, 1 unit of 10,000/day). Google Cloud project with
# "YouTube Data API v3" enabled, key restricted to that API. Seal on Railway.
# No PUBLIC_ prefix and not in vite.config.ts define — this key must never reach the browser.
# Unset means submitting a URL fails with "Could not resolve YouTube video".
YOUTUBE_API_KEY=
```

CLAUDE.md gains a row under a new "Environment Variables" table:

| Variable | When | Purpose |
|---|---|---|
| `YOUTUBE_API_KEY` | runtime, server-only | Resolves watch URLs through `videos.list`; unset makes submitting a URL fail |

## 6. Code changes

### 6.1 New: `src/lib/server/youtube.ts`

`src/lib/server/` does not exist yet — this is the first server-only module in the app.

```ts
import { env } from '$env/dynamic/private';

export interface VideoInfo {
    videoId: string;
    title: string;
    publishedAt: string;      // ISO 8601 datetime
    durationSeconds: number;
    channelId: string;
    channelName: string;
}

/** YouTube channel ids are "UC" followed by 22 base64url characters. */
export const CHANNEL_ID_RE = /^UC[\w-]{22}$/;
/** YouTube video ids are 11 base64url characters. */
export const VIDEO_ID_RE = /^[\w-]{11}$/;

/**
 * Extract the video id from a watch URL.
 * Accepts youtube.com/watch?v=ID, youtu.be/ID, youtube.com/shorts/ID, youtube.com/live/ID.
 */
export function videoIdFromUrl(videoUrl: string): string {
    const url = new URL(videoUrl);
    const parts = url.pathname.split('/').filter(Boolean);

    const id =
        url.searchParams.get('v') ??
        (url.hostname === 'youtu.be' ? parts[0] : undefined) ??
        (parts[0] === 'shorts' || parts[0] === 'live' ? parts[1] : undefined);

    if (!id || !VIDEO_ID_RE.test(id)) {
        throw new Error(
            `Not a YouTube video URL: ${videoUrl}. Expected youtube.com/watch?v=ID, ` +
                'youtu.be/ID, youtube.com/shorts/ID or youtube.com/live/ID'
        );
    }
    return id;
}

/** Convert an ISO 8601 duration (PT15M33S, P1DT2H3M4S) to seconds. */
export function durationToSeconds(iso: string): number {
    const m = /^P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso);
    if (!m) throw new Error(`Unrecognised ISO 8601 duration: ${iso}`);
    const [, d, h, min, s] = m;
    return +(d ?? 0) * 86400 + +(h ?? 0) * 3600 + +(min ?? 0) * 60 + +(s ?? 0);
}

interface VideoListResponse {
    pageInfo?: { totalResults: number };
    items?: {
        id: string;
        snippet: { title: string; publishedAt: string; channelId: string; channelTitle: string };
        contentDetails: { duration: string };
    }[];
    error?: { code: number; message: string };
}

/**
 * Resolve a watch URL to its video and channel facts with the YouTube Data API
 * (videos.list, part=snippet,contentDetails, 1 quota unit). Throws when YOUTUBE_API_KEY is unset,
 * the URL is not a video URL, the API rejects the request, or nothing matches.
 * Error messages never include the request URL because it carries the key.
 */
export async function fetchVideoInfo(videoUrl: string): Promise<VideoInfo> {
    const apiKey = env.YOUTUBE_API_KEY;
    if (!apiKey) throw new Error('YOUTUBE_API_KEY not set');

    const videoId = videoIdFromUrl(videoUrl);
    const params = new URLSearchParams({
        part: 'snippet,contentDetails',
        id: videoId,
        key: apiKey
    });
    const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?${params}`, {
        signal: AbortSignal.timeout(10_000)
    });
    const body = (await response.json()) as VideoListResponse;

    if (!response.ok) {
        throw new Error(
            `YouTube Data API ${response.status}: ${body.error?.message ?? response.statusText}`
        );
    }

    const item = body.items?.[0];
    if (!item) throw new Error(`No YouTube video matches ${videoUrl}`);
    if (!CHANNEL_ID_RE.test(item.snippet.channelId)) {
        throw new Error(`Unexpected channel id from the YouTube Data API: ${item.snippet.channelId}`);
    }

    return {
        videoId: item.id,
        title: item.snippet.title,
        publishedAt: item.snippet.publishedAt,
        durationSeconds: durationToSeconds(item.contentDetails.duration),
        channelId: item.snippet.channelId,
        channelName: item.snippet.channelTitle
    };
}
```

Notes:

- `AbortSignal.timeout` needs Node 17.3+; the app runs Node 26. The scraper had no timeout.
- `response.json()` on a non-JSON body (a proxy error page) throws, which surfaces as the same
  failure in the caller and logs the parse error.
- `snippet.channelTitle` is plain text, so "Rhett & Link" stores as typed.

### 6.2 Delete `specs/fetch-channel-info.md`

Superseded. Nothing implemented it.

### 6.3 `.env.example` and Railway

Section 5.

### 6.4 Nothing else in `src/` changes

There is no existing channel resolver to replace — no `src/lib/server/` and no server routes at
all. The consumer of `fetchVideoInfo` is the DB-001 write-through endpoint, which is its own goal.

## 7. Overlap with Supadata — open question

`videos.list` returns title, publish date and duration, which is most of what
`fetchVideoMetadata` is called for today. Supadata still uniquely provides `stats` (views, likes,
comments, shares), `media.thumbnailUrl`, `description` and `tags`, which `VideoMetadataCard`
renders, and INT-001 plans to use it for transcripts.

So the two overlap but neither is redundant. **Decide before wiring the write-through:** does the
`videos` row get its title/publishedAt/duration from the API (one call, already needed for the
channel id) or from Supadata (already called, richer)? Writing from the API and keeping Supadata
for the UI card is the smaller change and removes a failure mode from the ledger path.

This plan does not remove or modify `supadataService.ts`.

## 8. Verification

There is no `npm run check` or `npm run lint` in this repo — the scripts are `dev`, `build`,
`preview`.

1. `npm run build` exits 0.
2. With `YOUTUBE_API_KEY` unset, calling `fetchVideoInfo` throws `YOUTUBE_API_KEY not set`.
   Nothing is written.
3. With the key set, `fetchVideoInfo('https://www.youtube.com/watch?v=jNQXAC9IVRw')` returns
   channel id `UC4QobU6STFB0P71PMvOGN5A`, channel name `jawed`, and a positive
   `durationSeconds`.
4. `youtu.be/jNQXAC9IVRw` returns the identical object.
5. A channel URL (`https://www.youtube.com/@mkbhd`) and a bare string both throw with the
   "Expected youtube.com/watch?v=ID" message, and no API call is made.
6. A well-formed but non-existent video id throws `No YouTube video matches ...` (or the 404
   variant recorded in section 4 step 6).
7. `durationToSeconds('PT15M33S')` is 933; `durationToSeconds('P1DT2H3M4S')` is 93784.
8. The Google Cloud quota page shows single-digit usage after the above.
9. `grep -rn "YOUTUBE_API_KEY" .svelte-kit/output/client` returns nothing — the key is not in the
   client bundle.

## 9. Status

- [ ] Google Cloud project, API enabled, key created and restricted (section 4)
- [ ] Unknown-video-id behaviour recorded in section 2
- [ ] `YOUTUBE_API_KEY` in `.env.local` and on Railway
- [ ] `src/lib/server/youtube.ts` (section 6.1) and `.env.example`
- [ ] `specs/fetch-channel-info.md` deleted
- [ ] Supadata overlap decided (section 7)
- [ ] CLAUDE.md environment variable row
- [ ] Verification (section 8)
