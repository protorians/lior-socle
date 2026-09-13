'use client';

import React from 'react';
import { Button } from '@sentients/sdk/presentation/ui/button';
import { Input } from '@sentients/sdk/presentation/ui/input';
import { useModalStepper, ModalStepperStep } from '@sentients/sdk/presentation/modals/components/ModalStepper';
import { toast } from 'sonner';

export function StepperModalDemo() {
  const openStepper = useModalStepper();

  const handleOpenStepper = async () => {
    const steps: ModalStepperStep[] = [
      {
        id: 'step1',
        title: 'Informations personnelles',
        description: 'Parlez-nous de vous',
        content: ({ next, updateData, data }: any) => (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nom complet</label>
              <Input
                type="text"
                value={data.firstname || ''}
                onChange={(e) => updateData({ name: e.target.value })}
                placeholder="Jean Dupont"
              />
            </div>
            <Button onClick={next} disabled={!data.firstname} className="w-full">Continuer</Button>
          </div>
        )
      },
      {
        id: 'step2',
        title: 'Préférences',
        description: 'Configurez votre compte',
        content: ({ next, prev, updateData, data }: any) => (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Thème préféré</label>
              <select 
                className="w-full p-2 border rounded"
                value={data.theme || 'light'}
                onChange={(e) => updateData({ theme: e.target.value })}
              >
                <option value="light">Clair</option>
                <option value="dark">Sombre</option>
                <option value="system">Système</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={prev} className="flex-1">Retour</Button>
              <Button onClick={next} className="flex-1">Suivant</Button>
            </div>
          </div>
        )
      },
      {
        id: 'step3',
        title: 'Confirmation',
        description: 'Vérifiez vos informations',
        content: ({ next, prev, data }: any) => (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded text-sm space-y-2">
              <p><strong>Nom :</strong> {data.firstname}</p>
              <p><strong>Thème :</strong> {data.theme}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={prev} className="flex-1">Retour</Button>
              <Button onClick={next} className="flex-1">Confirmer et Terminer</Button>
            </div>
          </div>
        )
      }
    ];

    try {
      const result = await openStepper({
        steps,
        title: "Assistant de Configuration",
        initialData: { theme: 'light' }
      });

      if (result && result.result) {
        toast.success(`Configuration terminée pour ${(result.result as any).name}`);
        console.log('Stepper Result:', result);
      } else {
        toast.info("Action annulée");
      }
    } catch (error) {
      console.error('Stepper Error:', error);
    }
  };

  return (
    <div className="p-8 flex flex-col items-center justify-center space-y-4">
      <h2 className="text-2xl font-bold">Démo Modal Stepper Dynamique</h2>
      <p className="text-muted-foreground text-center max-w-md">
        Cliquez sur le bouton ci-dessous pour tester le nouveau modal stepper créé avec react-call.
      </p>
      <Button onClick={handleOpenStepper} size="lg">
        Ouvrir le Stepper
      </Button>
    </div>
  );
}
