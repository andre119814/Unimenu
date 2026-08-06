import St from 'gi://St';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import { MainMenu } from './MainMenu.js';
import { DetailView } from './DetailView.js';

export const MenuIndicator = GObject.registerClass(
    class MenuIndicator extends PanelMenu.Button {

        _init(extensionDir) {
            super._init(0.0, 'UniMenu');
            this.extensionDir = extensionDir;
            
            this.serverData = {};
            this.currentCanteen = null;

            /* Icon principal da extensão */
            const iconFile = extensionDir.get_child('./icons').get_child('logo.svg');
            const icon = new St.Icon({
                gicon: new Gio.FileIcon({ file: iconFile }),
                style_class: 'system-status-icon'
            });
            this.add_child(icon);
            
            /* Caixa principal do Menu */
            const mainItem = new PopupMenu.PopupBaseMenuItem({ reactive: false });
            this.mainBox = new St.BoxLayout({ vertical: true, style_class: 'canteen-list-box' });
            mainItem.add_child(this.mainBox);
            this.menu.addMenuItem(mainItem);

            /* Inicializa o MainMenu (título, cantinas, redes sociais) */
            this.mainMenu = new MainMenu(this);
            
            /* Inicializa o DetailView (ementas, datas, voltar) */
            this.detailView = new DetailView(this);
            this.detailView.view.hide(); /* Esconde os detalhes ao iniciar */

            /* Adiciona ambos à caixa principal */
            this.mainBox.add_child(this.mainMenu.view);
            this.mainBox.add_child(this.detailView.view);
        }

        /* Método público chamado pelo MainMenu quando uma cantina é selecionada */
        openMenu(canteen) {
            this.currentCanteen = canteen;

            this.mainBox.add_style_class_name('menu-box-expanded');
            this.mainMenu.view.hide();
            this.detailView.view.show();

            const data = this.serverData[canteen.id];
            
            this.detailView.render(canteen, data);
        }

        /* Método público chamado pelo DetailView quando clica no botão voltar */
        closeMenu() {
            this.currentCanteen = null;

            this.mainBox.remove_style_class_name('menu-box-expanded');
            this.detailView.view.hide();
            this.mainMenu.view.show();
        }

        /* Função auxiliar para atualizar os dados das ementas na interface*/
        _setServerData(data) {
            /* Se a extensão estiver fechada, apenas atualiza os dados */
            this.serverData = data;
            
            /* Se a extensão estiver aberta e a cantina atual visível, atualiza os dados a ementa dessa cantina na interface */
            if (this.currentCanteen) {
                this.openMenu(this.currentCanteen);
            }
        }
    }
);