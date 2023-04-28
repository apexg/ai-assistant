import { NextRequest } from "next/server";

const OPENAI_URL = "api.openai.com";
const DEFAULT_PROTOCOL = "https";
const PROTOCOL = process.env.PROTOCOL ?? DEFAULT_PROTOCOL;
const BASE_URL = process.env.BASE_URL ?? OPENAI_URL;

export async function requestOpenai(req: NextRequest) {
  const apiKey = req.headers.get("token");
  const openaiPath = req.headers.get("path");

  let baseUrl = BASE_URL;

  if (!baseUrl.startsWith("http")) {
    baseUrl = `${PROTOCOL}://${baseUrl}`;
  }

  console.log("[Proxy] ", openaiPath);
  console.log("[Base Url]", baseUrl);

  if (process.env.OPENAI_ORG_ID) {
    console.log("[Org ID]", process.env.OPENAI_ORG_ID);
  }

  return fetch(`${baseUrl}/${openaiPath}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...(process.env.OPENAI_ORG_ID && {
        "OpenAI-Organization": process.env.OPENAI_ORG_ID,
      }),
    },
    method: req.method,
    body: req.body,
  });
}

export async function request(options: {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  data?: any;
}) {
  try {
    let opt: Record<string, any> = {
      method: options.method || "GET",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    };

    if (options.headers) {
      opt.headers = Object.assign(opt.headers, options.headers);
    }
    if (options.data) {
      opt.body = JSON.stringify(options.data);
    }

    return await fetch(options.url, opt).then((res) => res.json());
  } catch (err) {
    console.error(err);
    return {
      error: true,
      msg: JSON.stringify(err),
    };
  }
}
