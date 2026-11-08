# UniMenu — Frontend

UniMenu é uma extensão para o GNOME Shell que mostra as ementas das cantinas universitárias no painel, com navegação por cantina, dia e refeição.

## Estrutura do projeto

- `extension.js` — cria o indicador no painel e controla o ciclo de vida da extensão.
- `prefs.js` — interface de preferências da extensão, onde se escolhem as cantinas visíveis e se consultam informações.
- `schemas/gschemas.compiled` — versão compilada do schema GSettings, usada pelo GNOME para carregar as definições da extensão.
- `schemas/org.gnome.shell.extensions.unimenu.gschema.xml` — define as opções GSettings da extensão, incluindo as cantinas ativas por omissão.
- `ui/ui.js` — implementação do `MenuIndicator` (GObject) que junta o menu principal e a vista de detalhes.
- `ui/MainMenu.js` — vista inicial com o título, lista de cantinas e botões sociais.
- `ui/DetailView.js` — vista de detalhes com navegação por datas, alternância entre almoço e jantar e ementas.
- `ui/components.js` — funções auxiliares para criar os elementos visuais da interface.
- `utils/api.js` — função auxiliar para pedidos HTTP GET e leitura da resposta JSON do servidor.
- `utils/dataUpdater.js` - classe responsável para a sincronização de dados.
- `config.js` — configuração das cantinas, preços, links sociais e URL do servidor e do MYSAS.
- `stylesheet.css` — estilos visuais da interface.
- `icons/` — ícones usados na interface.
- `metadata.json` — metadados da extensão para o GNOME.

## Preferências

A janela de preferências permite ativar ou ocultar cantinas no menu principal. É necessário manter pelo menos uma cantina ativa. A página «About» apresenta informações sobre a extensão e ligações do GLUA.

As definições são declaradas em `schemas/org.gnome.shell.extensions.unimenu.gschema.xml` e `schemas/gschemas.compiled` é a versão compilada usada pelo GNOME.

## Funcionamento

1. A extensão lê a lista de cantinas em `config.js`.
2. Para cada cantina, constrói uma URL baseada no `SERVER` e no identificador da cantina.
3. O módulo `utils/api.js` faz um pedido HTTP com `Soup`.
4. Os dados recebidos são enviados para a interface através do `MenuIndicator`.
5. A vista de detalhes renderiza os cartões de sopa e pratos para o dia e refeição selecionados.

## Sincronização de dados

A atualização automática é feita pela lógica implementada em `utils/dataUpdater.js`:

- quando a extensão é ativada, começa imediatamente uma primeira tentativa de recolha de dados;
- depois disso, agenda a próxima sincronização para o próximo ponto relevante do dia:
  - se a hora atual for anterior a meio-dia, agenda para as 12:00;
  - caso contrário, agenda para a meia-noite do dia seguinte.

O processo usa um temporizador do GLib para manter as atualizações periódicas.

## Comportamento em caso de falha

Se uma sincronização falhar:

1. marca a tentativa como falhada;
2. cancela o agendamento normal;
3. agenda uma nova tentativa em 2 minutos;
4. repete este ciclo até conseguir recolher dados válidos.

## Sleep/Hibernate

Quando o computador entra em modo sleep ou hibernate, o temporizador fica suspenso. Ao recuperar o sistema, a extensão deteta essa transição através de sinais do `logind` e volta a iniciar o ciclo de atualização:

1. O sistema entra em sleep;
2. O temporizador fica pausado;
3. Ao recuperar o sistema, a extensão deteta esse evento;
4. Reinicia imediatamente a atualização de dados e reagenda a próxima atualização.

## Instalação

A extensão deve estar instalada na pasta de extensões do utilizador:

```bash
mkdir -p ~/.local/share/gnome-shell/extensions/unimenu@glua.ua.pt
cp -r . ~/.local/share/gnome-shell/extensions/unimenu@glua.ua.pt/
```

Criar symbolic link:

```bash
ln -s ~/.local/share/gnome-shell/extensions/unimenu@glua.ua.pt
```

## Testar

### 1. Iniciar um servidor local (temporário)

Na pasta `data`:

```bash
cd data
python3 -m http.server 8000
```

### 3. Ativar a extensão

```bash
gnome-extensions enable unimenu@glua.ua.pt
```

### 4. Recarregar a extensão

```bash
gnome-extensions disable unimenu@glua.ua.pt
gnome-extensions enable unimenu@glua.ua.pt
```

### 5. Reiniciar GNOME Shell

```bash
Alt+F2
r
Enter
```
