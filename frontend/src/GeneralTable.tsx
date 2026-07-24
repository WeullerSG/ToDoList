import { useEffect, useState } from "react";
import "./App.css";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { Toaster } from "./components/ui/sonner";
import { FormDialog } from "./form/formDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu";
import {
  ClipboardList,
  EllipsisVertical,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "./lib/utils";
import { useUser } from "@clerk/react";

export interface Atividade {
  id: number;
  nome: string;
  descricao: string;
  data_criacao: string;
  status: string;
}

function GeneralTable() {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [isEditAtividades, setIsEditAtividades] = useState<Atividade | null>(
    null,
  );

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) setIsEditAtividades(null);
  }
  async function listAll() {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/list?user_id=${user?.id}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );
      const data = await res.json();
      setAtividades(data);
    } catch {}
  }

  async function deleteActivity(id: number) {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/list?id=${id}`,
        {
          method: "DELETE",
        },
      );

      if (!res.ok) throw new Error("Erro na requisição");
      toast.success("Removido com sucesso!");
      listAll();
      return res.json();
    } catch {
      toast.error("Erro ao remover");
    }
  }

  useEffect(() => {
    listAll();
  }, []);

  const statusStyles: Record<
    string,
    { label: string; dot: string; badge: string }
  > = {
    pendente: {
      label: "Pendente",
      dot: "bg-amber-500",
      badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    "Em progresso": {
      label: "Em progresso",
      dot: "bg-blue-500",
      badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    Finalizado: {
      label: "Finalizado",
      dot: "bg-emerald-500",
      badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
  };

  const sortedAtividades = [...atividades].sort((a, b) =>
    a.data_criacao.localeCompare(b.data_criacao),
  );

  return (
    <>
      <Toaster />
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 text-left sm:px-6 sm:py-10">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="m-0 font-heading text-2xl font-semibold tracking-tight text-foreground">
              Minhas atividades
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Organize e acompanhe o que precisa ser feito.
            </p>
          </div>
          <Button
            onClick={() => setOpen(true)}
            className="w-full gap-1.5 sm:w-auto"
          >
            <Plus className="size-4" />
            Nova atividade
          </Button>
        </div>

        <FormDialog
          open={open}
          onOpenChange={handleOpenChange}
          activity={isEditAtividades}
          onSuccess={listAll}
        />

        <Card className="w-full">
          {sortedAtividades.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
              <div className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <ClipboardList className="size-5" />
              </div>
              <p className="text-sm font-medium text-foreground">
                Nenhuma atividade ainda
              </p>
              <p className="text-sm text-muted-foreground">
                Clique em "Nova atividade" para começar.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Descrição
                  </TableHead>
                  <TableHead>Data limite</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAtividades.map((atividade) => {
                  const status = statusStyles[atividade.status];
                  return (
                    <TableRow key={atividade.id}>
                      <TableCell className="font-medium text-foreground">
                        {atividade.nome}
                      </TableCell>
                      <TableCell
                        className="hidden max-w-50 truncate text-muted-foreground sm:table-cell"
                        title={atividade.descricao}
                      >
                        {atividade.descricao || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {atividade.data_criacao
                          ? format(
                              new Date(atividade.data_criacao),
                              "dd/MM/yyyy",
                            )
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {status ? (
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
                              status.badge,
                            )}
                          >
                            <span
                              className={cn(
                                "size-1.5 rounded-full",
                                status.dot,
                              )}
                            />
                            {status.label}
                          </span>
                        ) : (
                          atividade.status
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm">
                              <EllipsisVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuGroup>
                              <DropdownMenuItem
                                onClick={() => {
                                  setIsEditAtividades(atividade);
                                  setOpen(true);
                                }}
                              >
                                <Pencil />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => deleteActivity(atividade.id)}
                              >
                                <Trash2 />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </>
  );
}

export default GeneralTable;
