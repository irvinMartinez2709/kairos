import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.irvin.kairos",
  appName: "Kairós",
  webDir: "dist",
  android: {
    allowMixedContent: false,
  },
};

export default config;
