import type { Hono } from "hono";

interface JsonStats {
  depth: number;
  totalKeys: number;
  totalArrays: number;
  totalObjects: number;
  totalValues: number;
  sizeBytes: number;
}

function analyzeJson(obj: any, depth = 0): JsonStats {
  const stats: JsonStats = { depth, totalKeys: 0, totalArrays: 0, totalObjects: 0, totalValues: 0, sizeBytes: 0 };

  if (Array.isArray(obj)) {
    stats.totalArrays = 1;
    let maxChildDepth = depth;
    for (const item of obj) {
      const childStats = analyzeJson(item, depth + 1);
      stats.totalKeys += childStats.totalKeys;
      stats.totalArrays += childStats.totalArrays;
      stats.totalObjects += childStats.totalObjects;
      stats.totalValues += childStats.totalValues;
      maxChildDepth = Math.max(maxChildDepth, childStats.depth);
    }
    stats.depth = maxChildDepth;
  } else if (obj !== null && typeof obj === "object") {
    stats.totalObjects = 1;
    const keys = Object.keys(obj);
    stats.totalKeys = keys.length;
    let maxChildDepth = depth;
    for (const key of keys) {
      const childStats = analyzeJson(obj[key], depth + 1);
      stats.totalKeys += childStats.totalKeys;
      stats.totalArrays += childStats.totalArrays;
      stats.totalObjects += childStats.totalObjects;
      stats.totalValues += childStats.totalValues;
      maxChildDepth = Math.max(maxChildDepth, childStats.depth);
    }
    stats.depth = maxChildDepth;
  } else {
    stats.totalValues = 1;
  }

  return stats;
}

function validateAgainstSchema(data: any, schema: any, path = ""): string[] {
  const errors: string[] = [];

  if (!schema || typeof schema !== "object") return errors;

  // Type validation
  if (schema.type) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    const actualType = Array.isArray(data) ? "array" : data === null ? "null" : typeof data;
    if (!types.includes(actualType)) {
      errors.push(`${path || "root"}: expected type ${schema.type}, got ${actualType}`);
      return errors;
    }
  }

  // Required properties
  if (schema.required && Array.isArray(schema.required) && typeof data === "object" && data !== null) {
    for (const req of schema.required) {
      if (!(req in data)) {
        errors.push(`${path || "root"}: missing required property "${req}"`);
      }
    }
  }

  // Properties validation
  if (schema.properties && typeof data === "object" && data !== null && !Array.isArray(data)) {
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      if (key in data) {
        const propErrors = validateAgainstSchema(data[key], propSchema as any, `${path}.${key}`);
        errors.push(...propErrors);
      }
    }
  }

  // Array items validation
  if (schema.items && Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      const itemErrors = validateAgainstSchema(data[i], schema.items, `${path}[${i}]`);
      errors.push(...itemErrors);
    }
  }

  // Min/max length for strings
  if (typeof data === "string") {
    if (schema.minLength !== undefined && data.length < schema.minLength) {
      errors.push(`${path || "root"}: string length ${data.length} < minLength ${schema.minLength}`);
    }
    if (schema.maxLength !== undefined && data.length > schema.maxLength) {
      errors.push(`${path || "root"}: string length ${data.length} > maxLength ${schema.maxLength}`);
    }
    if (schema.pattern) {
      try {
        if (!new RegExp(schema.pattern).test(data)) {
          errors.push(`${path || "root"}: string does not match pattern "${schema.pattern}"`);
        }
      } catch {}
    }
  }

  // Min/max for numbers
  if (typeof data === "number") {
    if (schema.minimum !== undefined && data < schema.minimum) {
      errors.push(`${path || "root"}: ${data} < minimum ${schema.minimum}`);
    }
    if (schema.maximum !== undefined && data > schema.maximum) {
      errors.push(`${path || "root"}: ${data} > maximum ${schema.maximum}`);
    }
  }

  // Enum
  if (schema.enum && !schema.enum.includes(data)) {
    errors.push(`${path || "root"}: value not in enum [${schema.enum.join(", ")}]`);
  }

  return errors;
}

export function registerRoutes(app: Hono) {
  app.post("/api/validate", async (c) => {
    const body = await c.req.json().catch(() => null);
    if (!body || !body.json) {
      return c.json({ error: "Missing required field: json (string to validate)" }, 400);
    }

    const jsonStr: string = body.json;
    const schema = body.schema || null;

    // Try parsing
    let parsed: any;
    let parseError: string | null = null;

    try {
      parsed = JSON.parse(jsonStr);
    } catch (e: any) {
      parseError = e.message;
    }

    if (parseError) {
      return c.json({
        valid: false,
        syntaxValid: false,
        errors: [parseError],
        schemaErrors: [],
        parsed: null,
        stats: null,
      });
    }

    // Analyze structure
    const stats = analyzeJson(parsed);
    stats.sizeBytes = new TextEncoder().encode(jsonStr).length;

    // Schema validation
    let schemaErrors: string[] = [];
    if (schema) {
      schemaErrors = validateAgainstSchema(parsed, schema);
    }

    const formatted = JSON.stringify(parsed, null, 2);

    return c.json({
      valid: schemaErrors.length === 0,
      syntaxValid: true,
      errors: schemaErrors.length > 0 ? schemaErrors : [],
      schemaProvided: !!schema,
      parsed: formatted,
      stats: {
        depth: stats.depth,
        totalKeys: stats.totalKeys,
        totalArrays: stats.totalArrays,
        totalObjects: stats.totalObjects,
        totalValues: stats.totalValues,
        sizeBytes: stats.sizeBytes,
        sizeFormatted: stats.sizeBytes > 1024 ? `${(stats.sizeBytes / 1024).toFixed(1)} KB` : `${stats.sizeBytes} B`,
      },
    });
  });
}
