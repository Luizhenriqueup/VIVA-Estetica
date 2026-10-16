# Contrato de Projeto: Viva Estética Segura

**Sprint:** 1 - Contrato e Alinhamento Inicial  
**Período:** 24/08 – 04/09  
**Domínio:** Segurança do Paciente / Enfermagem  

---

## 1. Delimitação do Problema
Procedimentos estéticos (preenchimentos, peelings, aplicações e pós-operatórios) cresceram exponencialmente, muitas vezes realizados fora de ambientes clínicos adequados e por profissionais sem habilitação. Isso gera riscos reais de eventos adversos graves (infecções e reações) e deixa o cliente sem diretrizes claras sobre o que questionar.

**Estado atual do protótipo:** O projeto conta com uma aplicação web front-end em React + Vite (incluindo checklist de 4 etapas do Método VIVA, medidor de risco, 11 POPs, 5 módulos educativos e fluxo de notificação em 7 passos). Contudo, todo o sistema opera localmente via `localStorage`, sem backend, sem autenticação de usuários, sem persistência em nuvem e sem um painel de monitoramento para a pesquisadora responsável.

## 2. Confirmação do Demandante
* **Demandante:** Pesquisadora de doutorado em Enfermagem (idealizadora do Método VIVA).
* **Papel no projeto:** Validação dos fluxos de dados, fornecimento de conteúdo real dos módulos educativos e diretrizes dos POPs, além da definição dos requisitos do painel gerencial.

## 3. Escopo Acordado por Escrito

### O que faz parte do escopo (In-scope):
* Desenvolvimento de um Backend robusto para persistência e gestão de dados.
* Implementação de sistema de autenticação e controle de acesso por perfis (Paciente/Usuário e Pesquisadora).
* Substituição dos textos simulados do protótipo pelo conteúdo real de pesquisa do Método VIVA.
* Implementação funcional do fluxo de notificação de eventos adversos com envio para o destinatário correto.
* Criação de um Painel Administrativo para a pesquisadora visualizar, gerenciar e extrair dados consolidados.

### O que NÃO faz parte do escopo (Out-of-scope):
* Desenvolvimento de aplicativo mobile nativo (mantendo a aplicação web responsiva).
* Integrações complexas de inteligência artificial além da estrutura básica planejada.

## 4. Backlog Inicial (Critérios de Aceitação / Pronto Quando)
O projeto será considerado funcional e pronto para validação avançada quando:
* Duas pessoas em dispositivos diferentes conseguirem preencher os checklists simultaneamente e salvar os dados na nuvem.
* Uma notificação de evento adverso disparada por um usuário chegar corretamente ao destinatário responsável.
* A pesquisadora conseguir acessar o painel administrativo e extrair os dados consolidados da pesquisa.
