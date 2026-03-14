import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      rawBody?: string;
    }
  }
}

export function captureRawBody(
  req: Request,
  _res: unknown,
  buf: Buffer
): void {
  req.rawBody = buf.toString("utf8");
}
