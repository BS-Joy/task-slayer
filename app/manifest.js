export default function manifest() {
  return {
    name: "Task Slayer",
    short_name: "TSL",
    description: "Slay your tasks with Task Slayer",
    start_url: "/",
    display: "standalone",
    background_color: "#e4c090",
    theme_color: "#f8f4ee",
    icons: [
      {
        src: "/logo 192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/logo 512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
