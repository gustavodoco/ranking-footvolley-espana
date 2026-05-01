# 🚀 Guia de Deploy - Ranking Footvolley

## Opção 1: GitHub Pages (RECOMENDADO)

### Passo 1: Criar repositório no GitHub
1. Acesse https://github.com e faça login
2. Clique em "New repository" (botão verde)
3. Nome sugerido: `ranking-footvolley-espana`
4. Marque como **Public**
5. Clique em "Create repository"

### Passo 2: Upload dos arquivos
Você pode fazer de 2 formas:

#### Opção A - Pelo navegador (mais fácil):
1. No seu novo repositório, clique em "uploading an existing file"
2. Arraste os 2 arquivos:
   - `index.html`
   - `ranking_data.json`
3. Escreva uma mensagem: "Initial commit"
4. Clique em "Commit changes"

#### Opção B - Via Git (se você usa terminal):
```bash
git clone https://github.com/SEU_USUARIO/ranking-footvolley-espana.git
cd ranking-footvolley-espana
# Copiar os arquivos index.html e ranking_data.json para essa pasta
git add .
git commit -m "Initial commit"
git push
```

### Passo 3: Ativar GitHub Pages
1. No repositório, vá em **Settings** (engrenagem)
2. No menu lateral, clique em **Pages**
3. Em "Source", selecione **main** branch
4. Clique em **Save**
5. Aguarde 1-2 minutos

### Passo 4: Acessar seu site
Seu ranking estará disponível em:
```
https://SEU_USUARIO.github.io/ranking-footvolley-espana/
```

---

## Opção 2: Netlify

### Passo a passo:
1. Acesse https://www.netlify.com
2. Clique em "Sign up" (pode usar conta do GitHub)
3. Clique em "Add new site" → "Deploy manually"
4. Arraste os 2 arquivos (`index.html` e `ranking_data.json`)
5. Pronto! URL gerada automaticamente

Vantagem: deploy instantâneo, sem precisar configurar nada.

---

## Opção 3: Vercel

1. Acesse https://vercel.com
2. "Sign up" com GitHub
3. "Add New..." → "Project"
4. "Import" do seu repositório GitHub
5. Deploy automático

---

## 🔄 Como atualizar o ranking

Quando você tiver novos dados das etapas:

1. Rode o script Python para gerar novo `ranking_data.json`
2. Substitua o arquivo antigo pelo novo
3. **GitHub Pages**: Faça commit e push
4. **Netlify/Vercel**: Arraste o novo arquivo ou faça push no Git

A página atualiza automaticamente!

---

## 📱 Funcionalidades da página

✅ **4 categorias**: Oro, Plata, Bronce, Femenino
✅ **2 visualizações**: Ranking de jogadores e ranking de clubes
✅ **Filtros**:
   - Busca por nome de jogador
   - Filtro por clube
✅ **Ordenação**: Clique nos cabeçalhos da tabela para ordenar
✅ **Responsivo**: Funciona bem em celular
✅ **Top 3 destacado**: Ouro, prata e bronze visual

---

## 💡 Dicas

- **Domínio customizado**: Depois você pode configurar um domínio próprio (tipo `ranking-footvolley.com`)
- **Google Analytics**: Pode adicionar para ver quantas visitas tem
- **SEO**: Adicione meta tags depois para aparecer melhor no Google

---

## 🆘 Problemas comuns

**Página em branco?**
- Certifique-se que os 2 arquivos estão na raiz do repositório
- Verifique se o `ranking_data.json` está no mesmo lugar que o `index.html`

**Dados não aparecem?**
- Abra o console do navegador (F12) e veja se tem erro
- Verifique se o JSON está válido

**GitHub Pages não ativa?**
- Certifique-se que o repositório é **public**
- Aguarde até 10 minutos na primeira vez

---

## 📧 Suporte

Se tiver qualquer dúvida, só me chamar!
