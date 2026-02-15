import { Suspense } from "react";
import ItemsClient from "./ItemsClient";

export default function ItemsPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <ItemsClient />
    </Suspense>
  );
}
