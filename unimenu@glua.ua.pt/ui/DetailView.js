import St from 'gi://St';
import Clutter from 'gi://Clutter';

import { createCard, createDishRow, formatDate } from './components.js';

export class DetailView {
    constructor(indicator) {
        this.indicator = indicator;
        
        /* Começa por mostrar o almoço */
        this.currentMeal = 'almoço';
        
        this.availableDays = [];
        this.meals = {};
        this.currentDayIndex = 0;

        /* Detalhes do menu */
        this.view = new St.BoxLayout({ vertical: true });

        /* Header com o botão de voltar e título */
        const headerBox = new St.BoxLayout({ vertical: false });

        /* Botão de voltar (esquerda) */
        const leftBox = new St.BoxLayout({ x_expand: true, x_align: Clutter.ActorAlign.START, y_align: Clutter.ActorAlign.CENTER });
        const btnBack = new St.Button({ style_class: 'back-button', reactive: true, y_align: Clutter.ActorAlign.CENTER });
        const backIcon = new St.Icon({ icon_name: 'go-previous-symbolic', icon_size: 16 });
        btnBack.set_child(backIcon);
        btnBack.connect('clicked', () => this.indicator.closeMenu());
        leftBox.add_child(btnBack);

        /* Nome da cantina (centro) */
        this.labelCanteenName = new St.Label({ text: '', style_class: 'canteen-title', y_align: Clutter.ActorAlign.CENTER });

        /* Botão invisível na direita para facilitar o alinhamento */
        const rightBox = new St.BoxLayout({ x_expand: true, x_align: Clutter.ActorAlign.END, y_align: Clutter.ActorAlign.CENTER });
        const dummyIcon = new St.Icon({ icon_name: 'go-previous-symbolic', icon_size: 16 });
        const dummyBtn = new St.Button({ style_class: 'back-button', reactive: false, opacity: 0 });
        dummyBtn.set_child(dummyIcon);
        rightBox.add_child(dummyBtn);

        /* Agrupa tudo e adiciona ao menu */
        headerBox.add_child(leftBox);
        headerBox.add_child(this.labelCanteenName);
        headerBox.add_child(rightBox);
        this.view.add_child(headerBox);

        /* Datas */
        this.dateNavBox = new St.BoxLayout({ style_class: 'date-navigator' });

        const iconPrev = new St.Icon({ icon_name: 'go-previous-symbolic', icon_size: 16 });
        this.btnPrev = new St.Button({ style_class: 'nav-arrow-button', reactive: true, y_align: Clutter.ActorAlign.CENTER });
        this.btnPrev.set_child(iconPrev);

        this.dateLabel = new St.Label({ text: 'A carregar...', x_expand: true, x_align: Clutter.ActorAlign.CENTER });

        this.btnNext = new St.Button({ style_class: 'nav-arrow-button', reactive: true, y_align: Clutter.ActorAlign.CENTER });
        const iconNext = new St.Icon({ icon_name: 'go-next-symbolic', icon_size: 16 });
        this.btnNext.set_child(iconNext);

        this.dateNavBox.add_child(this.btnPrev);
        this.dateNavBox.add_child(this.dateLabel);
        this.dateNavBox.add_child(this.btnNext);
        this.view.add_child(this.dateNavBox);

        /* Mudar dias */
        this.btnPrev.connect('clicked', () => this._changeDay(-1));
        this.btnNext.connect('clicked', () => this._changeDay(1));

        /* Botões de almoço/jantar */
        this.tabsBox = new St.BoxLayout({ style_class: 'meal-tabs-box', vertical: false });
        this.btnLunch = new St.Button({ child: new St.Label({ text: 'Almoço', style_class: 'meal-tab-label' }), style_class: 'meal-tab meal-tab-active', x_expand: true, reactive: true });
        this.btnDinner = new St.Button({ child: new St.Label({ text: 'Jantar', style_class: 'meal-tab-label' }), style_class: 'meal-tab', x_expand: true, reactive: true });

        /* Botões de alternar de refeição (almoço ou jantar) */
        this.btnLunch.connect('clicked', () => this._changeMeal('almoço'));
        this.btnDinner.connect('clicked', () => this._changeMeal('jantar'));

        this.tabsBox.add_child(this.btnLunch);
        this.tabsBox.add_child(this.btnDinner);
        this.view.add_child(this.tabsBox);

        // Caixa da comida
        this.foodContainer = new St.BoxLayout({ vertical: true });
        this.view.add_child(this.foodContainer);
    }

    /* Método público chamado pela Main para abrir a ementa */
    render(canteen, data) {
        this.labelCanteenName.set_text(canteen.name);
        this.foodContainer.destroy_all_children();

        if (data) {
            this._processJson(data);
            this.tabsBox.show();
            this.dateNavBox.show();
            this._changeMeal('almoço');
        } else {
            this.tabsBox.hide();
            this.dateNavBox.hide();

            let errorText = Object.keys(this.indicator.serverData).length === 0
                ? 'A carregar ementas...'
                : 'Ementa indisponível.';
            
            this.foodContainer.add_child(new St.Label({ text: errorText, style_class: 'unavailable-label' }));
        }
    }

    /* Função auxiliar para processar o JSON da ementa recebida */
    _processJson(json) {
        this.availableDays = Object.keys(json.meals_by_date).sort();
        this.meals = json.meals_by_date;
        this.currentDayIndex = 0;
    }

    /* Função auxiliar para navegar entre os dias disponíveis */
    _changeDay(direction) {
        const newIndex = this.currentDayIndex + direction;
        if (newIndex >= 0 && newIndex < this.availableDays.length) {
            this.currentDayIndex = newIndex;
            this._renderFood();
        }
    }

    /* Função auxiliar para alternar entre almoço e jantar */
    _changeMeal(type) {
        this.currentMeal = type;

        if (type === 'almoço') {
            this.btnLunch.add_style_class_name('meal-tab-active');
            this.btnDinner.remove_style_class_name('meal-tab-active');
        } else {
            this.btnDinner.add_style_class_name('meal-tab-active');
            this.btnLunch.remove_style_class_name('meal-tab-active');
        }

        this._renderFood();
    }

    /* Função auxiliar para mostrar os dados da ementa na interface */
    _renderFood() {
        if (this.availableDays.length === 0) return;

        const dateString = this.availableDays[this.currentDayIndex];
        this.dateLabel.set_text(formatDate(dateString));
        this.foodContainer.destroy_all_children();

        const mealMenu = this.meals[dateString][this.currentMeal];

        if (!mealMenu) {
            this.foodContainer.add_child(new St.Label({ text: `Sem ementa para o ${this.currentMeal} neste dia.`, style_class: 'unavailable-label' }));
            return;
        }

        if (Array.isArray(mealMenu)) {
            this.foodContainer.add_child(createCard('SOPA', mealMenu[0]));

            const dishes = mealMenu.slice(1).join(';\n');
            this.foodContainer.add_child(createCard('PRATOS', dishes));

        } else {
            if (mealMenu.sopa) {
                this.foodContainer.add_child(createCard('SOPA', mealMenu.sopa));
            }

            if (mealMenu.carne || mealMenu.peixe || mealMenu.vegetariano) {
                const dishesBox = new St.BoxLayout({ vertical: true, style_class: 'food-card' });
                dishesBox.add_child(new St.Label({ text: 'PRATOS', style_class: 'card-title' }));

                if (mealMenu.carne) dishesBox.add_child(createDishRow('Carne', mealMenu.carne, 'badge-meat'));
                if (mealMenu.peixe) dishesBox.add_child(createDishRow('Peixe', mealMenu.peixe, 'badge-fish'));
                if (mealMenu.vegetariano) dishesBox.add_child(createDishRow('Vegetariano', mealMenu.vegetariano, 'badge-veg'));

                this.foodContainer.add_child(dishesBox);
            }
        }
    }
}