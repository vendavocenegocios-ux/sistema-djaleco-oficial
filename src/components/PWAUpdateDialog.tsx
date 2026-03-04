import { RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePWAUpdate } from "@/hooks/usePWA";

export function PWAUpdateDialog() {
  const { needRefresh, update, dismiss } = usePWAUpdate();

  return (
    <Dialog open={needRefresh} onOpenChange={(open) => !open && dismiss()}>
      <DialogContent className="max-w-sm text-center">
        <DialogHeader className="items-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <RefreshCw className="h-7 w-7 text-foreground" />
          </div>
          <DialogTitle className="text-xl">Nova versão disponível!</DialogTitle>
          <DialogDescription>
            Uma atualização está pronta para ser instalada. Atualize agora para
            ter acesso às últimas melhorias e correções.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={update} className="w-full gap-2">
            <RefreshCw className="h-4 w-4" />
            Atualizar Agora
          </Button>
          <Button variant="outline" onClick={dismiss} className="w-full">
            Depois
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
