import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ระบบลงเวลาทำงาน",
    short_name: "BT ลงเวลา",
    description: "ระบบลงเวลาทำงานพนักงาน และสรุปข้อความจาก LINE",
    start_url: "/",
    display: "standalone",
    background_color: "#fdf9f0",
    theme_color: "#d98a3d",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
