import GLib from 'gi://GLib';
import { CANTEENS, SERVER } from '../config.js';
import { fetchServerData } from './api.js';

export class DataUpdater {
    constructor(indicator) {
        this._indicator = indicator;

        /* Inicia o relógio para atualizações de dados */
        this._timeoutId = null;
        
        /* Inicializa o temporizador para atualizações em caso de falha */
        this._retryTimeoutId = null; 

        /* Flag para evitar atualizações sobrepostas */
        this._isFetching = false;
    }

    startAutoUpdate() {
        this._updateData();
    }

    stopAutoUpdate() {
        /* Para o relógio principal */
        this._clearTimeout('_timeoutId');

        /* Para o temporizador de falha */
        this._clearTimeout('_retryTimeoutId');
    }

    /* Função para limpar temporizadores */
    _clearTimeout(timer) {
        if (this[timer]) {
            GLib.Source.remove(this[timer]);
            this[timer] = null;
        }
    }

    /* Mudar aqui de const para this. */
    _getDate() {
        const today = new Date();
        const fromDate = today.toISOString().split('T')[0];

        const futureDate = new Date(today);
        futureDate.setDate(futureDate.getDate() + 7);
        const toDate = futureDate.toISOString().split('T')[0];

        return [fromDate, toDate];
    }
    
    /* Função para atualizar os dados das ementas */
    async _updateData() {
        /* Se já estiver a fazer download, não faz nada */
        if (this._isFetching) return;

        this._isFetching = true;

        let allMenu = {};

        let [fromDate, toDate] = this._getDate();
        let cantinasIds = CANTEENS.map(canteen => canteen.id).join('%2C');
        let url = `${SERVER}?from=${fromDate}&to=${toDate}&canteens=${cantinasIds}`;

        let canteenData = await fetchServerData(url);

        if (canteenData && canteenData.canteens) {
            for (let canteen of canteenData.canteens) {
                allMenu[canteen.id] = canteen.days;
            }
        }

        /* Atualiza os dados */
        if (this._indicator) {
            this._indicator._setServerData(allMenu);
        }

        this._isFetching = false;

        /* Se o update falhar */
        if (Object.keys(allMenu).length === 0) {
            /* Desliga o temporizador principal */
            this._clearTimeout('_timeoutId');

            /* Agenda uma nova tentativa em 2 minutos */
            this._scheduleRetry(120);

        /* Se for bem sucedido */
        } else {
            /* Desliga o temporizador de falha, se estiver ativo */
            this._clearTimeout('_retryTimeoutId');

            /* Reagenda a próxima atualização */
            this._scheduleNextTarget();
        }
    }

    /* Função para agendar uma nova tentativa de atualização em caso de falha */
    _scheduleRetry(seconds) {
        this._clearTimeout('_retryTimeoutId');
        
        this._retryTimeoutId = GLib.timeout_add_seconds(
            GLib.PRIORITY_DEFAULT,
            seconds,
            () => {
                this._updateData(); 
                return GLib.SOURCE_REMOVE;
            }
        );
    }

    /* Função para agendar a próxima atualização automática */
    _scheduleNextTarget() {
        this.stopAutoUpdate();

        let currentTime = new Date();
        let nextUpdate = new Date(currentTime);

        if (currentTime.getHours() < 12) {
            /* Meio dia */
            nextUpdate.setHours(12, 0, 0, 0);
        } else {
            /* Meia noite */
            nextUpdate.setDate(currentTime.getDate() + 1);
            nextUpdate.setHours(0, 0, 0, 0);
        }

        /* Calcula o tempo restante em segundos até a próxima atualização */
        let secondsToUpdate = Math.floor((nextUpdate.getTime() - currentTime.getTime()) / 1000);

        /* Agenda a próxima atualização */
        this._timeoutId = GLib.timeout_add_seconds(
            GLib.PRIORITY_DEFAULT,
            secondsToUpdate,
            () => {
                this._updateData();
                return GLib.SOURCE_REMOVE;
            }
        );
    }
}