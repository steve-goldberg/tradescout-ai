# Spec: `fetchChannelInfo`

Resolves a YouTube channel URL to its canonical channel ID and display name by
scraping the channel page. **No YouTube Data API, no API key, no third-party
library.**

```ts
async function fetchChannelInfo(channelUrl: string): Promise<{ id: string; name: string }>
```

## 1. Parse the input

Parse with `new URL(channelUrl)`. Strip leading and trailing slashes from
`pathname` and split on `/`:

- If the first segment is `channel` and a second segment exists, take that
  second segment as the channel ID and set an `isDirectId` flag.
- Otherwise look for a segment starting with `@`.
- If there is no `@` segment, throw an error naming the two accepted formats:
  `https://www.youtube.com/@username` and
  `https://www.youtube.com/channel/CHANNEL_ID`.

## 2. Fetch the page

`fetch(channelUrl)` **unconditionally** — the page is needed for the name even
when the ID was already in the URL.

- Header: `User-Agent: Mozilla/5.0 (compatible; SupaTube/1.0)`
- Throw on a non-OK response, with the status code included in the message.
- Read the body as text.

## 3. Extract the ID (only when `isDirectId` is false)

Test these against the HTML in order; take the first match's capture group:

1. `/"channelId":"([^"]+)"/`
2. `/"externalId":"([^"]+)"/`
3. `/<link rel="canonical" href="https:\/\/www\.youtube\.com\/channel\/([^"]+)"/`
4. `/<meta property="og:url" content="https:\/\/www\.youtube\.com\/channel\/([^"]+)"/`

Throw if none match.

## 4. Extract the name

Same approach, in order:

1. `/"channelName":"([^"]+)"/`
2. `/<meta name="title" content="([^"]+)">/`
3. `/<meta property="og:title" content="([^"]+)">/`
4. `/"author":"([^"]+)"/`

Strip a trailing `" - YouTube"` suffix from the result. Throw if none match.

## 5. Return

`{ id, name }`

## Error policy

Fail fast throughout — no fallbacks, no partial results, no swallowed errors.
Every failure path throws with a message saying **which extraction step
failed**, since the caller's job is to turn that into a user-facing "could not
resolve channel" error.

## Open gap: the app has a video URL, not a channel URL

The analysis pipeline starts from a YouTube *watch* URL, and Supadata's
`VideoMetadata` returns only `author.displayName` / `avatarUrl` — no channel ID
and no channel URL. A `/watch?v=...` URL throws at step 1 by design.

So the caller must resolve video URL to channel URL first. The watch page
carries the same `"channelId":"..."` marker, so the bridge is: fetch the watch
page, extract the channel ID, build `https://www.youtube.com/channel/<id>`, and
pass that to `fetchChannelInfo`. This double-fetches, which is consistent with
step 2 already fetching even when the ID is known.
