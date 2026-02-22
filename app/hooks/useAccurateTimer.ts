import { useState, useEffect } from 'react';

export default function useAccurateTimer(timeLimitSeconds: number, isLocked: boolean) {
    const [timeLeft, setTimeLeft] = useState(timeLimitSeconds);

    useEffect(() => {
        // Se a questão já foi travada (respondida ou backend fechou), não faz nada.
        if (timeLimitSeconds <= 0 || isLocked) {
            return;
        }

        // 1. Descobrimos a "Data/Hora de Fim" exata no mundo real
        // Date.now() retorna os milissegundos atuais.
        const targetEndTimeMs = Date.now() + (timeLimitSeconds * 1000);

        const interval = setInterval(() => {
            // 2. Que horas são *agora* no mundo real?
            const now = Date.now();

            // 3. Quanto tempo falta até chegar na Data/Hora de Fim?
            const remainingMs = targetEndTimeMs - now;

            // Convertendo de volta para segundos (arredondando para cima para a UI ficar bonita)
            const remainingSeconds = Math.ceil(remainingMs / 1000);

            if (remainingSeconds <= 0) {
                setTimeLeft(0);
                clearInterval(interval);
            } else {
                setTimeLeft(remainingSeconds);
            }

        }, 1000); // Mesmo que o iOS atrase esse "1000" para "5000", o cálculo sempre será exato.

        return () => clearInterval(interval);
    }, [timeLimitSeconds, isLocked]);

    return timeLeft;
}