import St from 'gi://St';
import Clutter from 'gi://Clutter';

import { createCard, createDishRow, formatDate } from './components.js';
import { PRICE_NORMAL, PRICE_OPTION, PRICE_OTHER } from '../config.js';

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
        this.btnLunch.connect('clicked', () => this._changeMeal('lunch'));
        this.btnDinner.connect('clicked', () => this._changeMeal('dinner'));

        this.tabsBox.add_child(this.btnLunch);
        this.tabsBox.add_child(this.btnDinner);
        this.view.add_child(this.tabsBox);

        // Caixa da comida
        this.foodContainer = new St.BoxLayout({ vertical: true });
        this.view.add_child(this.foodContainer);
    }

    /* Método público chamado pela Main para abrir a ementa */
    render(canteen, days) {
        this.labelCanteenName.set_text(canteen.name);
        this.foodContainer.destroy_all_children();

        if (days && days.length > 0) {
            this._processJson(days);
            this.tabsBox.show();
            this.dateNavBox.show();
            this._changeMeal('lunch');
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
    _processJson(daysArray) {
        this.meals = {};
        this.availableDays = [];

        for (let day of daysArray) {
            this.availableDays.push(day.date);
            this.meals[day.date] = day.meals; 
        }

        this.availableDays.sort();
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

        if (type === 'lunch') {
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
        const canteenName = this.labelCanteenName.get_text();

        const mealMenu = this.meals[dateString];
        const currentMealData = mealMenu.find(m => m.service === this.currentMeal);

        if (!currentMealData || currentMealData.status !== 'available') {
            const mealName = this.currentMeal === 'lunch' ? 'o almoço' : 'o jantar';
            this.foodContainer.add_child(new St.Label({ text: `Sem ementa para ${mealName} neste dia.`, style_class: 'unavailable-label' }));
            return;
        }

        let sopaCard = null;
        let extrasList = [];
        let hasDishes = false;
        const dishesBox = new St.BoxLayout({ vertical: true, style_class: 'food-card' });
        dishesBox.add_child(new St.Label({ text: 'PRATOS', style_class: 'card-title' }));

        for (let item of currentMealData.items) {
            /* Ignora entradas inválidas */
            if (!item.text || item.text.replace(/[^a-zA-Z0-9À-ÿ]/g, '').trim().length === 0) {
                continue; 
            }

            if (item.category === 'soup') {
                sopaCard = createCard('SOPA', item.text);
            } else if (item.text) {   
                let dishName = item.text;
                
                let isExtra = false;
                if (canteenName === 'TrêsDê') {
                    let txt = item.text.toLowerCase();
                    if (txt.includes('fruta') || 
                        txt.includes('sobremesa') ||
                        txt.includes('bebida') ||
                        txt.includes('buffet')) {
                        isExtra = true;
                    }
                }

                if (isExtra) {
                    extrasList.push(dishName);
                } else {
                    hasDishes = true;
                    
                    if (canteenName == 'ESTGA' && (item.category === 'other' || !item.category)) {
                        let txt = item.text.toLowerCase();
                        if (txt.includes('prato de carne')) item.category = 'meat';
                        else if (txt.includes('prato de peixe')) item.category = 'fish';
                        else if (txt.includes('prato de dieta')) item.category = 'diet';
                        dishName = dishName.replace(/^Prato (de )?(Peixe|Carne|Dieta|Vegetariano)\s*[-–—]\s*/i, '').trim();
                    }
                    
                    let label = '';
                    let badgeClass = ''; 
                    let price = '';

                    switch (item.category) {
                        case 'meat':
                            label = 'Carne';
                            badgeClass = 'badge-meat';
                            price = PRICE_NORMAL;
                            break;
                        case 'fish':
                            label = 'Peixe';
                            badgeClass = 'badge-fish';
                            price = PRICE_NORMAL;
                            break;
                        case 'vegetarian':
                            label = 'Vegetariano';
                            badgeClass = 'badge-veg';
                            price = PRICE_NORMAL;
                            break;
                        case 'diet':
                            label = 'Dieta';
                            badgeClass = 'badge-diet';
                            price = PRICE_NORMAL;
                            break;

                        default:
                            if (item.tier === 'normal') {
                                label = 'Normal';
                                badgeClass = 'badge-normal';
                                price = PRICE_NORMAL;
                            } else if (item.tier === 'option') {
                                label = 'Opção';
                                badgeClass = 'badge-option';
                                price = PRICE_OPTION;
                            }
                    }
                    
                    if (canteenName === 'Grelhados') {
                        price = PRICE_OTHER;
                    } 
                    else if (canteenName === 'TrêsDê') {
                        price = PRICE_OTHER;
                        label = '';
                        badgeClass = '';
                    }
    
                    dishesBox.add_child(createDishRow(label, dishName, price, badgeClass));
                }
            }
        }

        if (sopaCard) {
            this.foodContainer.add_child(sopaCard);
        }

        if (hasDishes) {
            this.foodContainer.add_child(dishesBox);
        }

        if (extrasList.length > 0) {
            const extras = extrasList.join('\n');
            const extrasCard = createCard('EXTRAS', extras);
            this.foodContainer.add_child(extrasCard);
        }
    }
}