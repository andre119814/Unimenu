import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';

import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';
import { CANTEENS } from './config.js';
import { GLUA_LINKS } from './config.js';

export default class UniMenuPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        /* Ficheiro de configuração da extensão */
        const settings = this.getSettings('org.gnome.shell.extensions.unimenu');

        /* Página Settings */
        const pageCantinas = new Adw.PreferencesPage({
            title: 'Settings',
            icon_name: 'view-list-symbolic',
        });

        const groupCantinas = new Adw.PreferencesGroup({
            title: 'Cantinas Visíveis',
            description: 'Seleciona as cantinas que queres ver no teu painel.',
        });

        /* Lê a lista de cantinas disponíveis do ficheiro de configuração */
        let activeCanteens = settings.get_strv('active-canteens');

        /* Cria uma entrada para cada cantina */
        for (let canteen of CANTEENS) {
            const row = new Adw.ActionRow({ title: canteen.name });
            const toggle = new Gtk.Switch({
                active: activeCanteens.includes(canteen.id),
                valign: Gtk.Align.CENTER,
            });

            /* Grava na lista quando é selecionada pelo user */
            toggle.connect('notify::active', () => {
                if (toggle.active) {
                    if (!activeCanteens.includes(canteen.id)) {
                        activeCanteens.push(canteen.id);
                        settings.set_strv('active-canteens', activeCanteens);
                    }
                } else {
                    /* Não permite desativar todas as cantinas */
                    if (activeCanteens.length <= 1 && activeCanteens.includes(canteen.id)) {
                        toggle.set_active(true); 
                    } else {
                        activeCanteens = activeCanteens.filter(id => id !== canteen.id);
                        settings.set_strv('active-canteens', activeCanteens);
                    }
                }
            });

            row.add_suffix(toggle);
            groupCantinas.add(row);
        }

        pageCantinas.add(groupCantinas);
        window.add(pageCantinas);

        /* Página About */
        const pageAbout = new Adw.PreferencesPage({
            title: 'About',
            icon_name: 'info-symbolic',
        });

        const groupHeader = new Adw.PreferencesGroup();
        
        const cardBox = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            css_classes: ['card'],
        });

        const headerBox = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 12,
            margin_top: 48,
            margin_bottom: 48,
            margin_start: 32,
            margin_end: 32,
            halign: Gtk.Align.CENTER
        });

        const extDir = Gio.File.new_for_uri(import.meta.url).get_parent();
        const logoFile = extDir.get_child('icons').get_child('logo.svg'); 
        
        const logo = Gtk.Image.new_from_file(logoFile.get_path());
        logo.set_pixel_size(128);

        const titleLabel = new Gtk.Label({
            label: 'UniMenu',
            css_classes: ['title-1']
        });

        const descLabel = new Gtk.Label({
            label: 'GNOME Shell Extension para consultar os menus das cantinas da Universidade de Aveiro',
            justify: Gtk.Justification.CENTER,
            wrap: true,
            css_classes: ['dim-label']
        });

        const versionLabel = new Gtk.Label({
            label: 'Version 1.0 • GLUA',
            margin_top: 8,
            css_classes: ['dim-label', 'caption']
        });

        headerBox.append(logo);
        headerBox.append(titleLabel);
        headerBox.append(descLabel);
        headerBox.append(versionLabel);
        
        cardBox.append(headerBox);
        groupHeader.add(cardBox);
        pageAbout.add(groupHeader);

        /* Lista de Links */
        const groupLinks = new Adw.PreferencesGroup({ title: 'Links' });

        for (let linkInfo of GLUA_LINKS) {
            const row = new Adw.ActionRow({
                title: linkInfo.name,
                activatable: true
            });

            const iconFile = extDir.get_child('icons').get_child(linkInfo.icon);
            let iconImage = Gtk.Image.new_from_file(iconFile.get_path());
            row.add_prefix(iconImage);

            const externalIcon = new Gtk.Image({ 
                icon_name: 'external-link-symbolic',
                valign: Gtk.Align.CENTER
            });
            row.add_suffix(externalIcon);

            row.connect('activated', () => {
                Gio.AppInfo.launch_default_for_uri(linkInfo.url, null);
            });

            groupLinks.add(row);
        }

        pageAbout.add(groupLinks);
        window.add(pageAbout);
    }
}