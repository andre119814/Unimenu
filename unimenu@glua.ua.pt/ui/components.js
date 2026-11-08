import St from 'gi://St';
import Clutter from 'gi://Clutter';

/* Função auxiliar para criar o cartão de ementa (SOPA ou PRATOS) */
export function createCard(title, description) {
    const box = new St.BoxLayout({ vertical: true, style_class: 'food-card' });
    box.add_child(new St.Label({ text: title, style_class: 'card-title' }));

    const contentLabel = new St.Label({ text: description });
    contentLabel.clutter_text.line_wrap = true;

    box.add_child(contentLabel);
    return box;
}

/* Função auxiliar para criar o label de tipo de comida */
export function createDishRow(labelText, dishName, price, cssBadge) {
    const row = new St.BoxLayout({ vertical: false, style_class: 'dish-row' });

    if (labelText) {
        const badge = new St.Label({
            text: labelText,
            style_class: `badge ${cssBadge}`,
            y_align: Clutter.ActorAlign.START
        });
        row.add_child(badge);
    }
    
    const nameLabel = new St.Label({
        text: dishName,
        style_class: 'dish-name',
        y_align: Clutter.ActorAlign.START,
    });
    nameLabel.clutter_text.line_wrap = true;
    row.add_child(nameLabel);

    const spacer = new St.Widget({ x_expand: true });
    row.add_child(spacer);

    const priceLabel = new St.Label({
        text: price,
        style_class: 'dish-price',
        y_align: Clutter.ActorAlign.START,
    });
    row.add_child(priceLabel);

    return row;
}

/* Função auxiliar para formatar a data */
export function formatDate(isoDate) {
    const date = new Date(isoDate);
    
    const formattedDate = date.toLocaleDateString('pt-PT', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });
    
    return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
}