import type { IncomingMessage, ServerResponse } from 'node:http';

export interface ParsedRequest {
  method: string;
  path: string;
  query: Record<string, string>;
  body: unknown;
  headers: Record<string, string>;
}

const MAX_BODY_BYTES = 2_000_000;

export async function parseRequest(req: IncomingMessage): Promise<ParsedRequest> {
  const url = new URL(req.url ?? '/', 'http://localhost');
  const query: Record<string, string> = {};
  for (const [key, value] of url.searchParams) query[key] = value;

  const headers: Record<string, string> = {};
  for (const [key, value] of Object.entries(req.headers)) {
    headers[key] = Array.isArray(value) ? value.join(', ') : (value ?? '');
  }

  let body: unknown;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const chunks: Buffer[] = [];
    let size = 0;
    for await (const chunk of req) {
      size += (chunk as Buffer).length;
      if (size > MAX_BODY_BYTES) throw new Error(`Request body larger than ${MAX_BODY_BYTES} bytes.`);
      chunks.push(chunk as Buffer);
    }
    const raw = Buffer.concat(chunks).toString('utf8');
    if (raw.trim()) {
      try {
        body = JSON.parse(raw);
      } catch {
        throw new Error('The request body is not valid JSON. Add: -H "content-type: application/json"');
      }
    }
  }

  return { method: req.method ?? 'GET', path: url.pathname, query, body, headers };
}

export function sendJson(res: ServerResponse, status: number, payload: unknown): void {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    // Local development playground: the portal, the CLI simulator and a
    // student's own front-end on another port all talk to this gateway.
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'content-type, authorization',
    'access-control-allow-methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  });
  res.end(body);
}

export function sendText(
  res: ServerResponse,
  status: number,
  body: string,
  contentType = 'text/plain; charset=utf-8',
): void {
  res.writeHead(status, { 'content-type': contentType, 'content-length': Buffer.byteLength(body) });
  res.end(body);
}
