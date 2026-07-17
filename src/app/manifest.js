import { withBasePath } from "@/lib/base-path";

export const dynamic = "force-static";

export default function manifest() {
  return {
    name: "Piggy Land",
    short_name: "Piggy Land",
    description: "Антикафе с минипигами в Санкт-Петербурге.",
    start_url: withBasePath("/"),
    display: "standalone",
    background_color: "#fbf5ed",
    theme_color: "#b64230",
    lang: "ru",
    icons: [
      {
        src: withBasePath("/images/piggilandlogo-icon.webp"),
        sizes: "256x256",
        type: "image/webp"
      }
    ]
  };
}
