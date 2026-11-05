// Local development: ek hi command (npm run dev) se backend (5000) + website (5173) dono chalte hain.
const { spawn } = require("child_process");
const path = require("path");

function run(name, dir, args) {
  const child = spawn("npm", args, {
    cwd: path.join(__dirname, dir),
    shell: true,
    stdio: "inherit",
  });
  child.on("exit", (code) => {
    console.log(`[${name}] band ho gaya (code ${code})`);
  });
  return child;
}

const server = run("server", "server", ["run", "dev"]);
const client = run("client", "client", ["run", "dev"]);

function stop() {
  for (const c of [server, client]) {
    try {
      c.kill();
    } catch (e) {}
  }
  process.exit(0);
}
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
