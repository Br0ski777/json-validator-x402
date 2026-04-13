import type { ApiConfig } from "./shared";

export const API_CONFIG: ApiConfig = {
  name: "json-validator",
  slug: "json-validator",
  description: "Validate JSON syntax and schemas instantly. Returns validity, parse errors, formatted output, and structure stats (depth, keys, size).",
  version: "1.0.0",
  routes: [
    {
      method: "POST",
      path: "/api/validate",
      price: "$0.001",
      description: "Validate JSON and optionally check against a JSON Schema",
      toolName: "data_validate_json",
      toolDescription: `Use this when you need to validate JSON syntax or check JSON data against a JSON Schema. Returns validity status, parse errors, formatted JSON, and structure statistics.

1. valid -- boolean indicating if the JSON is syntactically correct
2. errors -- array of parse errors with line/column positions
3. formatted -- pretty-printed JSON string
4. stats -- structure stats: depth, keyCount, arrayCount, totalSize in bytes

Example output: {"valid":true,"errors":[],"formatted":"{...}","stats":{"depth":3,"keyCount":12,"arrayCount":2,"totalSize":256}}

Use this BEFORE processing untrusted JSON payloads. Essential FOR validating API request bodies, config files, or LLM-generated JSON against a schema.

Do NOT use for password checking -- use security_check_password instead. Do NOT use for hash generation -- use crypto_generate_hash instead. Do NOT use for cron expressions -- use schedule_parse_cron instead.`,
      inputSchema: {
        type: "object",
        properties: {
          json: { type: "string", description: "JSON string to validate" },
          schema: { type: "object", description: "Optional JSON Schema to validate against" },
        },
        required: ["json"],
      },
      outputSchema: {
        type: "object",
        properties: {
          valid: { type: "boolean", description: "Whether JSON is valid (syntax + schema if provided)" },
          syntaxValid: { type: "boolean", description: "Whether JSON syntax is correct" },
          schemaValid: { type: "boolean", description: "Whether JSON matches the provided schema" },
          schemaProvided: { type: "boolean", description: "Whether a schema was provided for validation" },
          parsed: { type: "string", description: "Pretty-printed formatted JSON string" },
          stats: {
            type: "object",
            description: "Structure statistics",
            properties: {
              depth: { type: "number", description: "Maximum nesting depth" },
              totalKeys: { type: "number", description: "Total number of object keys" },
              totalArrays: { type: "number", description: "Total number of arrays" },
              totalObjects: { type: "number", description: "Total number of objects" },
              totalValues: { type: "number", description: "Total number of values" },
              sizeBytes: { type: "number", description: "Size in bytes" },
              sizeFormatted: { type: "string", description: "Human-readable size (e.g. 1.2 KB)" },
            },
          },
        },
        required: ["valid", "syntaxValid"],
      },
    },
  ],
};
