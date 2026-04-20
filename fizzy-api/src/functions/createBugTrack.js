const { app } = require("@azure/functions");
const { createHash } = require("crypto");

const ALLOWED_DOMAINS = ["koblesystems.com", "lumetrasolutions.ca", "ebmscanada.com"];

async function uploadScreenshot(fizzyToken, accountSlug, screenshot) {
  const buffer = Buffer.from(screenshot.data, "base64");
  const checksum = createHash("md5").update(buffer).digest("base64");

  const directUploadRes = await fetch(
    `https://app.fizzy.do/${accountSlug}/rails/active_storage/direct_uploads`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${fizzyToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        blob: {
          filename: screenshot.name,
          byte_size: screenshot.size,
          content_type: screenshot.type,
          checksum,
        },
      }),
    }
  );

  if (!directUploadRes.ok) {
    const err = await directUploadRes.text();
    throw new Error(`Direct upload request failed (${directUploadRes.status}): ${err}`);
  }

  const { signed_id, direct_upload } = await directUploadRes.json();

  const storageRes = await fetch(direct_upload.url, {
    method: "PUT",
    headers: direct_upload.headers,
    body: buffer,
  });

  if (!storageRes.ok) {
    const storageErr = await storageRes.text().catch(() => "(unreadable)");
    throw new Error(`Storage upload failed (${storageRes.status}): ${storageErr}`);
  }

  return signed_id;
}

app.http("createBugTrack", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    try {
      const payload = await request.json();

      const boardId = payload?.boardId?.trim?.() || "";
      const title = payload?.title?.trim?.() || "";
      let body = payload?.body?.trim?.() || "";
      const screenshots = Array.isArray(payload?.screenshots) ? payload.screenshots : [];
      const submitterEmail = payload?.submitterEmail?.trim?.() || "";

      if (!boardId || !title || !body) {
        return {
          status: 400,
          jsonBody: { ok: false, error: "boardId, title, and body are required." },
        };
      }

      const emailDomain = submitterEmail.split("@")[1]?.toLowerCase();
      if (!submitterEmail || !ALLOWED_DOMAINS.includes(emailDomain)) {
        return {
          status: 403,
          jsonBody: { ok: false, error: "Submitter email must be from an authorized domain." },
        };
      }

      const fizzyToken = process.env.FIZZY_API_TOKEN;
      const accountSlug = process.env.FIZZY_ACCOUNT_SLUG || "6102307";

      if (!fizzyToken) {
        return {
          status: 500,
          jsonBody: { ok: false, error: "Missing FIZZY_API_TOKEN in environment." },
        };
      }

      const screenshotResults = { uploaded: 0, failed: 0, errors: [] };

      if (screenshots.length > 0) {
        const signedIds = [];

        for (const screenshot of screenshots) {
          try {
            const signedId = await uploadScreenshot(fizzyToken, accountSlug, screenshot);
            signedIds.push({ signedId, screenshot });
            screenshotResults.uploaded++;
          } catch (err) {
            context.warn(`Screenshot upload failed for "${screenshot.name}":`, err.message);
            screenshotResults.failed++;
            screenshotResults.errors.push(`${screenshot.name}: ${err.message}`);
          }
        }

        if (signedIds.length > 0) {
          const attachmentTags = signedIds
            .map(({ signedId, screenshot }) => {
              const url = `https://app.fizzy.do/${accountSlug}/rails/active_storage/blobs/redirect/${signedId}/${encodeURIComponent(screenshot.name)}`;
              return `<action-text-attachment sgid="${signedId}" content-type="${screenshot.type}" filename="${screenshot.name}" filesize="${screenshot.size}" url="${url}"></action-text-attachment>`;
            })
            .join("");
          body += `<div style="margin-top:16px;"><p><strong>Screenshots:</strong></p>${attachmentTags}</div>`;
        }
      }

      const fizzyUrl = `https://app.fizzy.do/${accountSlug}/boards/${boardId}/cards`;

      const cardPayload = { card: { title, description: body } };

      const fizzyResponse = await fetch(fizzyUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${fizzyToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cardPayload),
      });

      const text = await fizzyResponse.text();
      let fizzyBody;
      try {
        fizzyBody = JSON.parse(text);
      } catch {
        fizzyBody = text;
      }

      if (!fizzyResponse.ok) {
        context.error("Fizzy API error:", { status: fizzyResponse.status, body: fizzyBody });
        return {
          status: fizzyResponse.status,
          jsonBody: {
            ok: false,
            error: "Fizzy API request failed.",
            fizzyStatus: fizzyResponse.status,
            details: fizzyBody,
          },
        };
      }

      return {
        status: 200,
        jsonBody: {
          ok: true,
          message: "Card created successfully in Fizzy.",
          fizzy: fizzyBody,
          screenshots: screenshotResults,
        },
      };
    } catch (error) {
      return {
        status: 500,
        jsonBody: {
          ok: false,
          error: "Server error while creating Fizzy card.",
          details: error.message,
        },
      };
    }
  },
});
