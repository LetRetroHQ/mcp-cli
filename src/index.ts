const [,, cmd] = process.argv;

if (cmd === "install") {
  const { runInstaller } = await import("./install");
  await runInstaller();
} else {
  const { startServer } = await import("./server");
  await startServer();
}

export {};
