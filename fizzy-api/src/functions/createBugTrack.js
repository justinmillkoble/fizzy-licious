const { app } = require("@azure/functions");

app.http("createBugTrack", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    try {
      const payload = await request.json();

      const boardId = payload?.boardId?.trim?.() || "";
      const title = payload?.title?.trim?.() || "";
      const body = payload?.body?.trim?.() || "";

      if (!boardId || !title || !body) {
        return {
          status: 400,
          jsonBody: {
            ok: false,
            error: "boardId, title, and body are required.",
          },
        };
      }

      const fizzyToken = process.env.FIZZY_API_TOKEN;
      const accountSlug = process.env.FIZZY_ACCOUNT_SLUG || "6102307";

      if (!fizzyToken) {
        return {
          status: 500,
          jsonBody: {
            ok: false,
            error: "Missing FIZZY_API_TOKEN in local.settings.json",
          },
        };
      }

      const fizzyUrl = `https://app.fizzy.do/${accountSlug}/boards/${boardId}/cards`;

      const fizzyResponse = await fetch(fizzyUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${fizzyToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          card: {
            title,
            description: body,
          },
        }),
      });

      const text = await fizzyResponse.text();
      let fizzyBody;

      try {
        fizzyBody = JSON.parse(text);
      } catch {
        fizzyBody = text;
      }

      if (!fizzyResponse.ok) {
        context.error("Fizzy API error:", {
          status: fizzyResponse.status,
          body: fizzyBody,
        });

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