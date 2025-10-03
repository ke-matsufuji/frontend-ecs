import { useLoaderData } from "react-router";

export async function loader() {
  // シンプルなローダーに変更
  const message = "サーバーでフェッチしたデータ";
  return { message };
}

export default function About() {
  const { message } = useLoaderData() as { message: string };
  return (
    <section>
      <h2>About</h2>
      <p>このページはサーバーでデータを読み込んでSSRします。</p>
      <p>
        メッセージ: {message}
      </p>
    </section>
  );
}
