# Manual de instalação e execução do app

## Pré-requisitos

* [Node.js](https://nodejs.org/en/download/package-manager)
* [Git](https://git-scm.com/downloads)
* [Expo](https://docs.expo.dev/) - Instale o aplicativo Expo Go no seu smartphone.

## Clonando o repositório

```bash
git clone https://github.com/guisantosfr/engage-quiz-student
```

## Instalando as dependências

1. No terminal do Visual Studio Code, navegue até o app do aluno com  `cd apps/student`.
2. Dentro desta pasta, execute  `npm install`, para instalação das dependências.
3. Para o projeto do professor, repita os dois passos anteriores, porém navegue até a pasta do professor com  `cd apps/teacher`

## Variáveis de ambiente

Na pasta raiz do app do aluno, crie um arquivo .env e preencha-o com o seguinte conteúdo
```
EXPO_PUBLIC_API_URL=url do backend, sem aspas
EXPO_PUBLIC_WEBSOCKET_URL=endereço do websocket, sem aspas
```

## Executando os apps

1. Estando na pasta `apps/student` ou `apps/teacher`, execute no terminal o comando `npm start`.
    - Certifique-se de que computador e smartphone estejam na mesma rede wi-fi.
2. Com o app do expo instalado e aberto no smartphone, escaneie o qr code gerado para emulação do app.
3. Se preferir, pressione a tela `w` no terminal. O app será aberto no navegador.

## Fazendo Build com EAS
1. Instale globalmente o EAS CLI: `npm install -g cli`
2. Faça login no EAS: `eas login`
    - Crie uma conta no [Expo](https://expo.dev/), caso não tenha
3. Para gerar a build, execute um dos seguintes comandos, a depender da plataforma:
```
eas build --platform android --profile production

```

```
eas build --platform ios --profile production

```
4. Você pode acompanhar o progresso da build na organization criada no Expo.

## Problemas comuns
- O refresh do app está demorando após salvar uma alteração qualquer no código
    - Para isso, pressione `r` no terminal, para fazer o reload (recarregar) o app

- Ao executar, aparece algum erro devido a alguma dependência que parece estar faltando
    - Possivelmente algum commit mais recente incluiu alguma nova dependência
    - Para isso, execute `git pull` na pasta raiz, `/engajamento`, e `npm install` no app que retornou esse erro, para trazer as novas dependências ao projeto.

- O comando build está demorando.
    - Após iniciado o comando, a build é colocada em uma fila, que pode demorar mais a depender do horário do dia.
    - Já é sabido que os horários da manhã e da tarde tendem a ser piores nesse sentido, enquanto à noite, tende a não demorar.

- Ao visualizar a build no site do expo, um comando com o nome de `Run expo doctor` gerou um warning.
    - Isso acontece quando alguma versão de alguma dependência deveria ser atualizada para melhor compatibilidade com a versão do Expo
    - Em geral, são apenas warnings e a build é gerada com sucesso.
