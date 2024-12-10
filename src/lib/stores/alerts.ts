import { writable } from 'svelte/store';

export type AlertType = 'info' | 'success' | 'warning' | 'error';

export interface AlertMessage {
    type: AlertType;
    text: string;
    secs: number;
    id: number;
}

export function createAlertStore() {
    const { subscribe, update } = writable<AlertMessage[]>([]);
    let nextId = 1;

    return {
        subscribe,
        addAlert: (type: AlertType, text: string, secs: number = 3) => {
            const id = nextId++;
            update(alerts => [...alerts, { type, text, secs, id }]);
            
            // 设定时间后自动移除
            setTimeout(() => {
                update(alerts => alerts.filter(alert => alert.id !== id));
            }, secs * 1000);
        },
        removeAlert: (id: number) => {
            update(alerts => alerts.filter(alert => alert.id !== id));
        }
    };
}

export const alerts = createAlertStore(); 