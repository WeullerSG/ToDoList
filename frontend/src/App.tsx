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
import { EllipsisVertical } from "lucide-react";
import { toast } from "sonner";

interface Atividade {
  id: number;
  nome: string;
  descricao: string;
  data_criacao: string;
  status: string;
}

function App() {
  const [open, setOpen] = useState(false);
  const [atividades, setAtividades] = useState<Atividade[]>([]);

  async function listAll() {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/list`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
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
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!res.ok) throw new Error("Erro na requisição");

      toast.success("Removido com sucesso!");
      listAll();
    } catch {
      toast.error("Erro ao remover");
    }
  }

  useEffect(() => {
    listAll();
  }, []);

  return (
    <>
      <Toaster />
      <div>
        <div className="flex flex-col items-center ">
          <h1>To do List</h1>
          <Button variant="outline" onClick={() => setOpen(true)}>
            Add activity
          </Button>
          <div className="flex flex-col items-end pr-2.5">
            <FormDialog open={open} onOpenChange={setOpen} />
          </div>
          <Card className="w-full max-w-4xl">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Data limite</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {atividades.map((atividade) => (
                  <TableRow key={atividade.id}>
                    <TableCell>{atividade.nome}</TableCell>
                    <TableCell>{atividade.descricao}</TableCell>
                    <TableCell>{atividade.data_criacao}</TableCell>
                    <TableCell>{atividade.status}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <EllipsisVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuGroup>
                            <DropdownMenuItem><Button variant={"ghost"}>Editar</Button></DropdownMenuItem>
                            <DropdownMenuItem><Button variant={"ghost"} onClick={() => deleteActivity(atividade.id)}>Deletar</Button></DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
    </>
  );
}

export default App;
