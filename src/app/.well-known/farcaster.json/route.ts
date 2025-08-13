import { PROJECT_TITLE } from "~/lib/constants";

export async function GET() {
  const appUrl =
    process.env.NEXT_PUBLIC_URL ||
    `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;

  const config = {
    accountAssociation: {
      header:
        "eyJmaWQiOjg2OTk5OSwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDc2ZDUwQjBFMTQ3OWE5QmEyYkQ5MzVGMUU5YTI3QzBjNjQ5QzhDMTIifQ",
      payload:
        "eyJkb21haW4iOiJsZXZlcnR6LW5mdG9mZmVyLnZlcmNlbC5hcHAifQ",
      signature:
        "MHhmODE0MDhlODQ5NTczYTJlMWUzMGUzNTYyOGZlMTRlZGJiYWExNzNlZjEyOWU1M2VkYjFmZDE2ODQ0ZGNiNmZmMzk5NjA3ZmFhYzgxOWIxMDcwM2IxNmRhMjRlMzI1MmM4OTJjZGFkNzY2M2RlMGMwOTZmMDQ3YWNjZDU3YzI4YjFj",
    },
    frame: {
      version: "1",
      name: PROJECT_TITLE,
      iconUrl: `${appUrl}/icon.png`,
      homeUrl: appUrl,
      imageUrl: `${appUrl}/frames/hello/opengraph-image`,
      ogImageUrl: `${appUrl}/frames/hello/opengraph-image`,
      buttonTitle: "Open",
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#f7f7f7",
      webhookUrl: `${appUrl}/api/webhook`,
    },
  };

  return Response.json(config);
}
