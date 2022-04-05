// vite.config.ts
import { defineConfig } from "vite";
import checker from "vite-plugin-checker";
import tsconfigPaths from "vite-tsconfig-paths";
import vue from "@vitejs/plugin-vue";
var vite_config_default = defineConfig({
  plugins: [
    tsconfigPaths({ loose: true }),
    checker({ vueTsc: true }),
    vue()
  ],
  server: {
    open: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXG5cbmltcG9ydCBjaGVja2VyIGZyb20gJ3ZpdGUtcGx1Z2luLWNoZWNrZXInXG5pbXBvcnQgdHNjb25maWdQYXRocyBmcm9tICd2aXRlLXRzY29uZmlnLXBhdGhzJ1xuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7IC8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5cdHBsdWdpbnM6IFtcblx0XHR0c2NvbmZpZ1BhdGhzKHsgbG9vc2U6IHRydWUgfSksXG5cdFx0Y2hlY2tlcih7IHZ1ZVRzYzogdHJ1ZSB9KSxcblx0XHR2dWUoKSxcblx0XSxcblx0c2VydmVyOiB7XG5cdFx0b3BlbjogdHJ1ZSxcblx0fSxcbn0pXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQUE7QUFFQTtBQUNBO0FBQ0E7QUFFQSxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMzQixTQUFTO0FBQUEsSUFDUixjQUFjLEVBQUUsT0FBTyxLQUFLLENBQUM7QUFBQSxJQUM3QixRQUFRLEVBQUUsUUFBUSxLQUFLLENBQUM7QUFBQSxJQUN4QixJQUFJO0FBQUEsRUFDTDtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ1AsTUFBTTtBQUFBLEVBQ1A7QUFDRCxDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
