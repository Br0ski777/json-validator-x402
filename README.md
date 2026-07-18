# JSON Validator API

[![MCP Server](https://img.shields.io/badge/MCP-server-blue)](https://json-validator.api.klymax402.com/mcp)
[![x402](https://img.shields.io/badge/payments-x402-6E56CF)](https://x402.org)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)

JSON validator with optional JSON Schema validation and structure stats. Pay-per-call via [x402](https://x402.org) (USDC on Base L2) -- no API key, no signup, no rate-limit wall.

Part of the [klymax402](https://klymax402.com) marketplace -- 100 x402 micropayment APIs for AI agents, one wallet, USDC on Base.

## Quickstart -- MCP

Add to your MCP client config (Claude Desktop, Cursor, ElizaOS, etc.):

```json
{
  "mcpServers": {
    "json-validator": {
      "url": "https://json-validator.api.klymax402.com/mcp"
    }
  }
}
```

## Quickstart -- HTTP (x402)

```bash
curl -X POST "https://json-validator.api.klymax402.com/api/validate" \
  -H "Content-Type: application/json" \
  -d '{"json":"..."}'
# -> 402 Payment Required, with an x402 payment challenge in the response body
```

Any x402-aware client ([`@x402/fetch`](https://www.npmjs.com/package/@x402/fetch), [`x402-agent-tools`](https://www.npmjs.com/package/x402-agent-tools), ATXP) handles the 402 -> sign -> retry cycle automatically.

## Tools

| Tool | Method | Path | Price | Description |
|---|---|---|---|---|
| `data_validate_json` | POST | `/api/validate` | $0.003 | Validate JSON and optionally check against a JSON Schema |

### `data_validate_json`

Use this when you need to validate JSON syntax or validate JSON data against a JSON Schema. Returns validity status, parse errors, formatted JSON, and structure stats (depth, key count, arrays, total size). Do NOT use for password checking — use security_check_password. Do NOT use for hash generation — use crypto_generate_hash. Do NOT use for cron expressions — use util_parse_cron.

**Parameters**

| Name | Type | Required | Description |
|---|---|---|---|
| `json` | string | yes | JSON string to validate |
| `schema` | object | no | Optional JSON Schema to validate against |

## Example agent prompts

- "Validate JSON syntax or validate JSON data against a JSON Schema"

## Payment

- Protocol: [x402](https://x402.org) -- HTTP-native pay-per-call, no signup, no API key
- Network: Base L2 (`eip155:8453`)
- Asset: USDC
- Facilitator: Coinbase CDP (primary), PayAI (fallback)

## Part of klymax402

100 x402 micropayment APIs for AI agents -- one wallet, USDC on Base, zero signup.

- Catalog: https://klymax402.com/llms.txt
- Full API reference: https://klymax402.com/llms-full.txt
- Live stats: https://klymax402.com/stats

## License

MIT
