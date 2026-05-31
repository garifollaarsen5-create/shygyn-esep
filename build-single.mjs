// Бәрін бір index.html файлына біріктіріп жинайды (серверсіз ашуға болатын нұсқа).
// Нәтиже: dist-single/index.html
process.env.SINGLEFILE = "1";
import { build } from "vite";

await build({
  build: { outDir: "dist-single" },
});

console.log("\n✅ Дайын! Мынаны екі рет басып ашыңыз:  dist-single/index.html");
