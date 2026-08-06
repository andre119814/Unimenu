import St from 'gi://St';
import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';

import { CANTEENS, GLUA_LINKS, MYSAS } from '../config.js';

export class MainMenu {
    constructor(indicator) {
        this.indicator = indicator;
        
        /* Caixa que contém tudo o que pertence ao MainMenu */
        this.view = new St.BoxLayout({ vertical: true });

        /* Título */
        this.titleLabel = new St.Label({ text: 'UniMenu', style_class: 'title' });
        this.view.add_child(this.titleLabel);

        /* Lista das cantinas */
        const canteensLabel = new St.Label({ text: 'Cantinas', style_class: 'section-label' });
        this.view.add_child(canteensLabel);
        
        this.canteensView = new St.BoxLayout({ vertical: true });
        CANTEENS.forEach(canteen => {
            const btn = new St.Button({ style_class: 'canteen-button', x_expand: true });
            btn.set_child(new St.Label({ style_class: 'canteen-label', text: canteen.name }));
            btn.connect('clicked', () => this.indicator.openMenu(canteen));
            this.canteensView.add_child(btn);
        });
        this.view.add_child(this.canteensView);

        /* Botão de carregar o cartão */
        const topupBtn = new St.Button({ style_class: 'card-button', x_expand: true });        
        topupBtn.set_child(new St.Label({ style_class: 'canteen-label', text: 'Carregar Cartão' })); 
        
        topupBtn.connect('clicked', () => {
            Gio.AppInfo.launch_default_for_uri(MYSAS, null);
            this.indicator.menu.close();
        });
        
        this.view.add_child(topupBtn);

        /* Caixa de botões sociais */
        const socialsLabel = new St.Label({ text: 'Redes Sociais', style_class: 'section-label' });
        this.view.add_child(socialsLabel);
        
        this.socialBox = new St.BoxLayout({
            vertical: true,
            style_class: 'social-box',
            x_align: Clutter.ActorAlign.CENTER
        });

        let currentRow = new St.BoxLayout({ vertical: false, style_class: 'new-row' });
        this.socialBox.add_child(currentRow);

        /* Limita o número de botões por linha a 4 */
        const maxButtonsPerRow = 4;
        let currentCount = 0;

        GLUA_LINKS.forEach(link => {
            if (currentCount >= maxButtonsPerRow) {
                currentRow = new St.BoxLayout({
                    vertical: false,
                    style_class: 'new-row',
                    x_align: Clutter.ActorAlign.CENTER
                });
                this.socialBox.add_child(currentRow);
                currentCount = 0;
            }

            const btn = new St.Button({ style_class: 'social-button', reactive: true });
            
            const iconFile = this.indicator.extensionDir.get_child('icons').get_child(link.icon);

            if (iconFile.query_exists(null)) {
                const icon = new St.Icon({
                    gicon: new Gio.FileIcon({ file: iconFile }),
                    icon_size: 25
                });
                btn.set_child(icon);
            }

            btn.connect('clicked', () => {
                Gio.AppInfo.launch_default_for_uri(link.url, null);
                this.indicator.menu.close();
            });

            currentRow.add_child(btn);
            currentCount++;
        });

        this.view.add_child(this.socialBox);
    }
}