# AI-Soldiers-UI

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.15.

Aplicação **Angular** para análise de possíveis malwares em arquivos **CSV**, utilizando **WatsonX** para processamento inteligente e geração de relatórios.

---

## 📌 Funcionalidades
- Upload de arquivos CSV
- Análise automática com **WatsonX**
- Relatórios interativos com classificação de risco
- Visualização de estatísticas (porcentagem)

---

## 🏗️ Arquitetura
- **Frontend:** Angular 19+
- **Backend/API:** Python
- **IA/ML:** WatsonX 
- **UI/UX:** Bootstrap / Material Angular
- **Node:** 20.17.0

---

## 🌐 Backend

O repositório do backend que hospeda a API está disponível no seguinte link:  

👉 [Acessar Repositório do Frontend](https://github.com/vek03/AI-Soldiers-WatsonX-GPT4-API)

---

## 📂 Estrutura do Projeto
```bash
.
├── src/
│   ├── app/
│   │   ├── components/     # Componentes da UI
|   |   ├── shared/         # Pasta de componentes e services compartilhados
|   |   |    ├── services/  # Serviços (API WatsonX)
│   └── environments/       # Configurações de ambiente
└── README.md
```

---

## ▶️ Como rodar a UI

> Crie um arquivo "environments.ts" baseado em "environments.example.ts" em src/environments

```bash
# Instalar dependências
npm install

# Rodar app
npm start
```

---
