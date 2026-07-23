import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Field, FieldGroup } from "../components/ui/field";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import {
  CalendarIcon,
  Loader2,
  Save,
} from "lucide-react";
import { Calendar } from "../components/ui/calendar";
import { toast } from "sonner";
import type { Atividade } from "../App";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { cn } from "../lib/utils";

interface FormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity?: Atividade | null;
  onSuccess?: () => void;
}

export function FormDialog({
  open,
  onOpenChange,
  activity,
  onSuccess,
}: FormProps) {
  const [formData, setFormData] = useState({ name: "", descricao: "", status:""});
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      criadoEm: date ? format(date, "yyyy-MM-dd") : "",
    };

    if (!activity) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/list`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Erro na requisição");

        toast.success("Criado com sucesso!");
        onSuccess?.();
        onOpenChange(false);
      } catch {
        toast.error("Erro ao enviar");
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/list/${activity.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );

        if (!res.ok) throw new Error("Erro na requisição");

        toast.success("Atualizado com sucesso!");
        setFormData({ name: "", descricao: "", status: ""});
        setDate(undefined);
        onSuccess?.();
        onOpenChange(false);
      } catch {
        toast.error("Erro ao enviar");
      } finally {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    if (activity) {
      setFormData({ name: activity.nome, descricao: activity.descricao, status: activity.status });
      setDate(
        activity.data_criacao ? new Date(activity.data_criacao) : undefined,
      );
    } else {
      setFormData({ name: "", descricao: "", status: "" });
      setDate(undefined);
    }
  }, [activity, open]);

  const items = [
    { label: "Pendente", value: "pendente", dot: "bg-amber-500" },
    { label: "Em progresso", value: "Em progresso", dot: "bg-blue-500" },
    { label: "Finalizado", value: "Finalizado", dot: "bg-emerald-500" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {activity ? "Editar atividade" : "Nova atividade"}
            </DialogTitle>
            <DialogDescription>O que você tem para fazer.</DialogDescription>
          </DialogHeader>

          <FieldGroup className="my-5 gap-4">
            <Field>
              <Label htmlFor="name-1" className="gap-1.5 text-muted-foreground">
                Nome
              </Label>
              <Input
                id="name-1"
                name="name"
                placeholder="Ex: Revisar relatório"
                className="h-9"
                value={formData.name}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, name: e.target.value }))
                }
              />
            </Field>

            <Field>
              <Label htmlFor="descricao" className="gap-1.5 text-muted-foreground">
                Descrição
              </Label>
              <textarea
                id="descricao"
                name="descricao"
                placeholder="Detalhes da atividade (opcional)"
                rows={3}
                className="w-full min-w-0 resize-none rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
                value={formData.descricao}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, descricao: e.target.value }))
                }
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <Label htmlFor="status" className="gap-1.5 text-muted-foreground">
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData((p) => ({ ...p, status: value }))
                  }
                >
                  <SelectTrigger id="status" className="h-9 w-full">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {items.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          <span className="flex items-center gap-2">
                            <span
                              className={cn("size-2 rounded-full", item.dot)}
                            />
                            {item.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <Label htmlFor="dataLimite" className="gap-1.5 text-muted-foreground">
                  Data limite
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="dataLimite"
                      type="button"
                      variant="outline"
                      data-empty={!date}
                      className="h-9 w-full justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
                    >
                      <span className="truncate">
                        {date ? format(date, "dd/MM/yyyy") : "Escolha"}
                      </span>
                      <CalendarIcon className="size-3.5 text-muted-foreground" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      defaultMonth={date}
                    />
                  </PopoverContent>
                </Popover>
              </Field>
            </div>
          </FieldGroup>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={loading} className="gap-1.5">
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
