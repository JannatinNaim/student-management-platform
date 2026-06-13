import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import path from "path";
import { corsOptions } from "./lib/cors";
import { UPLOAD_DIR } from "./lib/storage";
import { errorHandler, notFoundHandler } from "./middleware/error";
import { apiLimiter } from "./middleware/rateLimit";

import adminRoutes from "./routes/admin";
import authRoutes from "./routes/auth";
import commentRoutes from "./routes/comments";
import dashboardRoutes from "./routes/dashboard";
import groupRoutes from "./routes/groups";
import interactionRoutes from "./routes/interactions";
import noteRoutes from "./routes/notes";
import notificationRoutes from "./routes/notifications";
import problemRoutes from "./routes/problems";
import statsRoutes from "./routes/stats";
import studyToolsRoutes from "./routes/studyTools";
import subjectRoutes from "./routes/subjects";
import syllabusRoutes from "./routes/syllabus";
import userRoutes from "./routes/users";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );
  app.use(cors(corsOptions));
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(cookieParser());

  // Local file storage (development / single-server deployments)
  app.use(
    "/uploads",
    express.static(path.resolve(UPLOAD_DIR), {
      maxAge: "7d",
      setHeaders: (res) => res.setHeader("X-Content-Type-Options", "nosniff"),
    })
  );

  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  app.use("/api", apiLimiter);
  app.use("/api/auth", authRoutes);
  app.use("/api/notes", noteRoutes);
  app.use("/api/subjects", subjectRoutes);
  app.use("/api", interactionRoutes);
  app.use("/api", commentRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/stats", statsRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/study", studyToolsRoutes);
  app.use("/api/syllabus", syllabusRoutes);
  app.use("/api/groups", groupRoutes);
  app.use("/api/problems", problemRoutes);
  app.use("/api/admin", adminRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
