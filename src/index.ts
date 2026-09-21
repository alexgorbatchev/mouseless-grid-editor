import { serve } from "bun";
import index from "./index.html";
import type { GridLevels } from "./types";
import { findMouselessConfigPath } from "./utils/mouselessPath";
import { generateMouselessGridYaml, parseMouselessGridYaml, updateMouselessConfigFile } from "./utils/yamlConfig";

const server = serve({
  port: Number(process.env.PORT) || 3100,
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    "/api/config": {
      async GET() {
        try {
          const { path: configPath, exists } = await findMouselessConfigPath();
          if (!exists) {
            return Response.json({
              success: true,
              exists: false,
              path: configPath,
              message: "Mouseless config file not found at default locations",
            });
          }

          const content = await Bun.file(configPath).text();
          const parsedLevels = parseMouselessGridYaml(content);

          return Response.json({
            success: true,
            exists: true,
            path: configPath,
            content,
            parsedLevels,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          return Response.json({ success: false, error: errorMessage }, { status: 500 });
        }
      },

      async POST(req) {
        try {
          const body = (await req.json()) as {
            levels?: GridLevels;
            presetName?: string;
            path?: string;
          };

          if (!body.levels) {
            return Response.json({ success: false, error: "Missing levels in request body" }, { status: 400 });
          }

          const { path: detectedPath, exists } = await findMouselessConfigPath();
          const targetPath = body.path || detectedPath;

          let updatedContent = "";
          if (exists) {
            const currentContent = await Bun.file(targetPath).text();
            // Create backup file first
            await Bun.write(`${targetPath}.bak`, currentContent);
            updatedContent = updateMouselessConfigFile(currentContent, body.levels, body.presetName || "custom");
          } else {
            updatedContent = generateMouselessGridYaml(body.levels, body.presetName || "custom");
          }

          await Bun.write(targetPath, updatedContent);

          return Response.json({
            success: true,
            path: targetPath,
            message: exists
              ? "Mouseless config updated successfully! (Backup saved as .bak)"
              : "Mouseless config created successfully!",
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          return Response.json({ success: false, error: errorMessage }, { status: 500 });
        }
      },
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
