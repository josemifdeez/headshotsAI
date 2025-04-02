import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const WaitingForMagicLink = ({
  toggleState,
}: {
  toggleState: () => void;
}) => {
  return (
    <>
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col gap-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 p-4 rounded-xl max-w-sm w-full">
          <h1 className="text-xl">Revisa tu correo para continuar</h1>
          <div className="flex flex-col gap-2">
            <p className="text-sm">
            Te hemos enviado un enlace para acceder a tu cuenta.
            </p>
            <p className="text-xs opacity-60">
            Consejo: puede que esté en tu carpeta de spam.
            </p>
          </div>
          <div>
            <Button onClick={toggleState} variant="secondary" size="sm">
              <ArrowLeft size={14} />
              Volver
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
