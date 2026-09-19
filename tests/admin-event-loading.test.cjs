// Run with: node --test tests/admin-event-loading.test.cjs
const test = require("node:test");
const assert = require("node:assert/strict");
const { build } = require("esbuild");
const Module = require("node:module");
const React = require("react");
const { renderToString } = require("react-dom/server");

test("admin event navigation does not wait for backend data", async () => {
  const { outputFiles } = await build({
    entryPoints: ["src/pages/admin/event/[eventId]/[year]/index.tsx"],
    bundle: true,
    write: false,
    platform: "node",
    format: "cjs",
    jsx: "automatic",
    external: ["react", "react/jsx-runtime"],
    plugins: [
      {
        name: "page-boundaries",
        setup(build) {
          build.onResolve({ filter: /^(next\/|@\/|lucide-react)/ }, (args) => ({
            path: args.path,
            namespace: "boundary",
          }));
          build.onLoad({ filter: /.*/, namespace: "boundary" }, ({ path }) => ({
            contents:
              path === "next/router"
                ? 'export const useRouter = () => ({isReady:true,query:{eventId:"mis",year:"2026"}});'
                : path === "next/dynamic"
                  ? "export default () => () => null;"
                  : path === "@/lib/db"
                    ? "export const fetchBackend = () => new Promise(() => {});"
                    : "export default () => null; export const DataTable=()=>null, Button=()=>null, ChartLine=()=>null, Eye=()=>null, MessageSquareText=()=>null, Pencil=()=>null, Table2=()=>null, UsersRound=()=>null;",
          }));
        },
      },
    ],
  });
  const compiled = new Module(__filename);
  compiled.paths = module.paths;
  compiled._compile(outputFiles[0].text, __filename);
  const page = compiled.exports;

  // The backend stub never responds. Route props must still resolve immediately.
  let timer;
  try {
    const props = await Promise.race([
      page.getServerSideProps({ params: { eventId: "mis", year: "2026" } }),
      new Promise((_, reject) => {
        timer = setTimeout(
          () => reject(new Error("Route blocked on backend data")),
          250,
        );
      }),
    ]);
    assert.deepEqual(props, { props: {} });
  } finally {
    clearTimeout(timer);
  }

  const html = renderToString(React.createElement(page.default));
  assert.match(html, /Event Data/);
  assert.match(html, /role="status"/);
  assert.match(html, /Loading event data/);
});
