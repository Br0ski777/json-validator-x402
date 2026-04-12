import type { ApiConfig } from "./shared";

export const API_CONFIG: ApiConfig = {
  name: "json-validator",
  slug: "json-validator",
  description: "JSON validator with optional JSON Schema validation and structure stats.",
  version: "1.0.0",
  routes: [
    {
      method: "POST",
      path: "/api/validate",
      price: "$0.001",
      description: "Validate JSON and optionally check against a JSON Schema",
      toolName: "data_validate_json",
      toolDescription: "Use this when you need to validate JSON syntax or validate JSON data against a JSON Schema. Returns validity status, parse errors, formatted JSON, and structure stats (depth, key count, arrays, total size). Do NOT use for password checking — use security_check_password. Do NOT use for hash generation — use crypto_generate_hash. Do NOT use for cron expressions — use util_parse_cron.",
      inputSchema: {
        type: "object",
        properties: {
          json: { type: "string", description: "JSON string to validate" },
          schema: { type: "object", description: "Optional JSON Schema to validate against" },
        },
        required: ["json"],
      },
    },
  ],
};
