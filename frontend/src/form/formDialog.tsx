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
import { useState } from "react";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { ChevronDownIcon } from "lucide-react";
import { Calendar } from "../components/ui/calendar";
import { toast } from "sonner";

interface FormProps{
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FormDialog({ open, onOpenChange }: FormProps) {
  const [formData, setFormData] = useState({ name: "", descricao: "" });
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      criadoEm: date ? format(date, "yyyy-MM-dd") : "",
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/list`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erro na requisição");

      toast.success("Adicionado com sucesso!");
      setFormData({ name: "", descricao: "" });
      setDate(undefined);
      onOpenChange(false);
    } catch {
      toast.error("Erro ao enviar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>

      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Activity</DialogTitle>
            <DialogDescription>O que você tem para fazer.</DialogDescription>
          </DialogHeader>

          <FieldGroup className="my-4">
            <Field>
              <Label htmlFor="name-1">Name</Label>
              <Input
                id="name-1"
                name="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, name: e.target.value }))
                }
              />
            </Field>

            <Field>
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                name="descricao"
                value={formData.descricao}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, descricao: e.target.value }))
                }
              />
            </Field>

            <Field>
              <Label htmlFor="dataLimite">Data limite</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="dataLimite"
                    type="button"
                    variant="outline"
                    data-empty={!date}
                    className="w-full justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
                  >
                    {date ? format(date, "PPP") : <span>Escolha uma data</span>}
                    <ChevronDownIcon className="text-muted-foreground" />
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
          </FieldGroup>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? "Enviando..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
