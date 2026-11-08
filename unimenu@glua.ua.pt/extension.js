import Gio from 'gi://Gio';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

import { MenuIndicator } from './ui/ui.js';
import { DataUpdater } from './utils/dataUpdater.js';

export default class UniMenuExtension extends Extension {
    enable() {
        this._indicator = new MenuIndicator(this.dir);
        Main.panel.addToStatusArea(this.uuid, this._indicator, 1, 'center');

        this._dataUpdater = new DataUpdater(this._indicator);

        this._dataUpdater.startAutoUpdate();

        /* Se o PC for suspenso, deteta quando voltou e atualiza os dados */
        this._sleepSignalId = Gio.DBus.system.signal_subscribe(
            'org.freedesktop.login1',
            'org.freedesktop.login1.Manager',
            'PrepareForSleep',
            '/org/freedesktop/login1',
            null,
            Gio.DBusSignalFlags.NONE,
            (connection, sender, path, iface, signal, parameters) => {
                const isGoingToSleep = parameters.get_child_value(0).get_boolean();
                if (!isGoingToSleep) {
                    this._dataUpdater.startAutoUpdate(); 
                }
            }
        );
    }

    disable() {
        this._dataUpdater.stopAutoUpdate();

        if (this._sleepSignalId) {
            Gio.DBus.system.signal_unsubscribe(this._sleepSignalId);
            this._sleepSignalId = null;
        }

        this._indicator.destroy();
        this._indicator = null;
    }
}