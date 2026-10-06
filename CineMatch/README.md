# CineMatch

Site de recomendação de filmes com quiz de perfil e catálogo externo.

## Como rodar

1. Instale Node.js 18+.
2. Crie uma conta no TMDB e gere um token de API.
3. Copie `.env.example` para `.env`.
4. Coloque seu token em `TMDB_TOKEN`.
5. Execute:

```bash
npm install
npm start
```

6. Abra `http://localhost:3000`.

## Metacritic

Os cards não guardam um banco local. Eles são buscados do catálogo externo e, ao clicar, o site abre a página correspondente do filme no Metacritic.

O projeto não faz scraping automático do Metacritic. Isso é intencional: o Metacritic não oferece uma API pública gratuita; a API oficial é disponibilizada via Fabric Origin mediante acesso aprovado/assinatura. Para usar dados oficiais de Metascore diretamente dentro do sistema, substitua o módulo de catálogo por uma API licenciada.

## IA

A interface já está preparada para a parte prática da V1. O ranking atual é um motor de pontuação no backend. Para a entrega da disciplina, ele pode ser substituído/expandido pelos cinco modelos exigidos: Árvore de Decisão, KNN, K-Means, Regressão Linear e Apriori, além do módulo Fuzzy e do Sistema Especialista.
