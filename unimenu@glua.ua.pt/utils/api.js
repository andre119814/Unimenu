import Soup from 'gi://Soup?version=3.0';
import GLib from 'gi://GLib';

const httpSession = new Soup.Session();

/* Função auxiliar para ir buscar dados ao servidor */
export async function fetchServerData(url) {
    try {
        let message = Soup.Message.new('GET', url);
        let bytes = await httpSession.send_and_read_async(message, GLib.PRIORITY_DEFAULT, null);

        if (message.get_status() !== Soup.Status.OK) {
            throw new Error(`Error: ${message.get_status()}`);
        }

        let decoder = new TextDecoder('utf-8');
        let data = JSON.parse(decoder.decode(bytes.get_data()));
        return data;
    } catch (e) {
        return null;
    }
}