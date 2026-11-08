/* Lista das cantinas disponíveis */
export const CANTEENS = [
    { name: 'Santiago', id: 'santiago' },
    { name: 'Crasto', id: 'crasto' },
    { name: 'TrêsDê', id: 'tresde' },
    { name: 'Grelhados', id: 'grelhados' },
    //{ name: 'Restaurante Vegetariano', id: 'restaurante-vegetariano' },
    //{ name: 'Restaurante Universitário', id: 'restaurante-universitario' },
    { name: 'ESTGA', id: 'estga' }
];

export const PRICE_NORMAL = '2,80€';
export const PRICE_OPTION = '3,80€';
export const PRICE_OTHER = '4,70€';

/* Nomes, hiperligações e ícones das redes sociais e plataformas do GLUA. */
export const GLUA_LINKS = [
    { name: 'WebSite', url: 'https://glua.ua.pt/', icon: 'site-symbolic.svg' },
    { name: 'Instagram', url: 'https://www.instagram.com/glua.aettua/', icon: 'insta-symbolic.svg' },
    { name: 'Facebook', url: 'https://www.facebook.com/glua.ua/', icon: 'facebook-symbolic.svg' },
    { name: 'Linkedin', url: 'https://www.linkedin.com/company/glua/', icon: 'linkedin-symbolic.svg' },
    { name: 'GitHub', url: 'https://github.com/glua-ua', icon: 'github-symbolic.svg' },
    { name: 'Discord', url: 'https://discord.gg/MzxEcqV9', icon: 'discord-symbolic.svg' }
];

/* URL do servidor que fornece os dados das ementas */
export const SERVER = 'https://ementas.franciscoribeiro.pt/api/v1/menus';

/* URL do MYSAS para carregar o cartão */
export const MYSAS = 'https://mysas.ua.pt/Charging/Index'