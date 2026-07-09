// STUB(F が実装): LP(サービス紹介)。CONTRACTS §6。
import { SITE_NAME, SITE_TAGLINE } from "~/lib/site";

export default function Index() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="font-bold text-3xl text-slate-900">{SITE_NAME}</h1>
      <p className="mt-2 text-slate-600">{SITE_TAGLINE}</p>
      <p className="mt-8 rounded-xl border bg-white p-4 text-slate-500 text-sm shadow-sm">
        TODO: LP(担当: F)
      </p>
    </main>
  );
}
