import { useState } from "react";
import { useStore } from "./store";
import { t } from "./i18n";
import { BottomNav, type Screen } from "./components/BottomNav";
import { AddExpenseSheet } from "./components/AddExpenseSheet";
import { Dashboard } from "./screens/Dashboard";
import { TransactionList } from "./screens/TransactionList";
import { Stats } from "./screens/Stats";
import { Budget } from "./screens/Budget";
import { Settings } from "./screens/Settings";
import type { Transaction } from "./types";

export function App() {
  const { settings } = useStore();
  const lang = settings.lang;
  const [screen, setScreen] = useState<Screen>("home");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  function openAdd() {
    setEditing(null);
    setSheetOpen(true);
  }
  function openEdit(tx: Transaction) {
    setEditing(tx);
    setSheetOpen(true);
  }
  function closeSheet() {
    setSheetOpen(false);
    setEditing(null);
  }

  return (
    <div className="mx-auto min-h-full w-full max-w-md px-4 pb-32 pt-[calc(0.5rem+env(safe-area-inset-top))]">
      <main key={screen} className="rise">
        {screen === "home" && <Dashboard onEdit={openEdit} onNavigate={setScreen} />}
        {screen === "list" && <TransactionList onEdit={openEdit} />}
        {screen === "stats" && <Stats />}
        {screen === "budget" && <Budget />}
        {screen === "settings" && <Settings />}
      </main>

      {/* Флоат "+" батырмасы (баптаулардан басқа экрандарда) */}
      {screen !== "settings" && (
        <button
          onClick={openAdd}
          className="fixed bottom-24 left-1/2 z-40 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full text-3xl font-light transition-transform active:scale-90"
          style={{
            background: "var(--primary)",
            color: "var(--on-primary)",
            boxShadow: "0 12px 30px -6px color-mix(in srgb, var(--primary) 60%, transparent)",
          }}
          aria-label={t("addExpense", lang)}
        >
          +
        </button>
      )}

      <BottomNav active={screen} onChange={setScreen} lang={lang} />

      {sheetOpen && <AddExpenseSheet onClose={closeSheet} editing={editing} />}
    </div>
  );
}
