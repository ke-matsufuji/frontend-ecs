export function loader() {
  return new Response("ok", { status: 200, headers: { "content-type": "text/plain" } });
}
export default function Health() {
  return null;
}
