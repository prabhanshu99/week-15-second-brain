
import  jwt  from "jsonwebtoken";
import { JWT_PASSWORD } from "./config.js";
import type { RequestHandler } from "express";

export const userMiddleware: RequestHandler = (req, res, next) => {
  const header = req.headers["authorization"];

  if (!header) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  try {
    const decoded = jwt.verify(header as string, JWT_PASSWORD) as { id: string };

    // Attach user ID to request object
    // @ts-ignore
    req.userId = decoded.id;

    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
};