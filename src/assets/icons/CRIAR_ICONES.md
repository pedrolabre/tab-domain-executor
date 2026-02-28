# Como Criar os Ícones

## Opção 1: Usar icon.svg (Recomendado)

Use o arquivo `icon.svg` nesta pasta para gerar os PNGs:

### Online (Mais Fácil):
1. Acesse: https://cloudconvert.com/svg-to-png
2. Upload do `icon.svg`
3. Gere 4 versões:
   - 16x16 → salve como `icon16.png`
   - 32x32 → salve como `icon32.png`
   - 48x48 → salve como `icon48.png`
   - 128x128 → salve como `icon128.png`

### ImageMagick (Linha de comando):
```bash
convert icon.svg -resize 16x16 icon16.png
convert icon.svg -resize 32x32 icon32.png
convert icon.svg -resize 48x48 icon48.png
convert icon.svg -resize 128x128 icon128.png
```

## Opção 2: Criar Seus Próprios Ícones

Use qualquer ferramenta de design:
- Figma, Canva, Photoshop, GIMP, etc.
- Cores sugeridas: #4285f4 (azul do Google)
- Texto: "TDE" ou desenhe um ícone relacionado a abas

## Opção 3: Usar Placeholders Temporários

Para testar rapidamente:
1. Acesse: https://via.placeholder.com/
2. Baixe:
   - https://via.placeholder.com/16/4285f4/FFFFFF?text=TDE
   - https://via.placeholder.com/32/4285f4/FFFFFF?text=TDE
   - https://via.placeholder.com/48/4285f4/FFFFFF?text=TDE
   - https://via.placeholder.com/128/4285f4/FFFFFF?text=TDE
3. Renomeie para icon16.png, icon32.png, etc.

## ⚠️ Importante

Sem os ícones PNG, a extensão vai:
- ✅ Funcionar normalmente
- ❌ Não ter ícone visual na barra do Chrome
- ❌ Gerar warning no console (não afeta funcionamento)

**Para desenvolvimento/teste: pode pular esta etapa!**

**Para produção: crie ícones profissionais**
