import { Show, SignUpButton, UserButton } from "@clerk/react";
import { ClipboardList } from "lucide-react";
import { Button } from "./components/ui/button";
import GeneralTable from "./GeneralTable";

function App() {
  return (
    <>
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ClipboardList className="size-4" />
            </div>
            <span className="font-heading text-base font-semibold tracking-tight text-foreground">
              Minhas atividades
            </span>
          </div>
          <Show when="signed-out">
            <div className="flex items-center gap-2">
              <SignUpButton mode="modal">
                <Button>Entrar</Button>
              </SignUpButton>
            </div>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </header>

      <Show when="signed-out">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-3 px-4 py-24 text-center sm:px-6">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <ClipboardList className="size-6" />
          </div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            Organize suas atividades
          </h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            Entre ou crie uma conta para acompanhar suas tarefas.
          </p>
        </div>
      </Show>

      <Show when="signed-in">
        <GeneralTable />
      </Show>
    </>
  );
}

export default App;
