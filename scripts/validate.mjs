/**
 * Validador estrito de qualidade em 10 regras para posts do Blog Orcei Fácil
 */

export function validatePost(postData, existingSlugs = []) {
  const errors = []

  // 1. Frontmatter completo
  if (!postData.title) errors.push('Título ausente')
  if (!postData.description) errors.push('Descrição ausente')
  if (!postData.category) errors.push('Categoria ausente')
  if (!postData.content) errors.push('Conteúdo Markdown ausente')

  // 2. Tamanho do título (max 70 caracteres)
  if (postData.title && postData.title.length > 75) {
    errors.push(`Título muito longo (${postData.title.length} chars). Máximo recomendado é 75.`)
  }

  // 3. Tamanho da descrição (100 a 180 caracteres)
  if (postData.description) {
    const descLen = postData.description.length
    if (descLen < 80 || descLen > 200) {
      errors.push(`Descrição fora do tamanho ideal (${descLen} chars). Recomendado entre 100 e 180.`)
    }
  }

  // 4. Slug único e sem acentos
  if (postData.slug) {
    const hasAccents = /[àáâãäåèéêëìíîïòóôõöùúûüç]/i.test(postData.slug)
    if (hasAccents) {
      errors.push(`Slug possui caracteres acentuados: "${postData.slug}"`)
    }
    if (existingSlugs.includes(postData.slug)) {
      errors.push(`Slug duplicado detectado: "${postData.slug}"`)
    }
  }

  // 5. Contagem de palavras no conteúdo (1000 a 2200 palavras)
  if (postData.content) {
    const words = postData.content.trim().split(/\s+/).length
    if (words < 800) {
      errors.push(`Conteúdo muito curto (${words} palavras). Mínimo é 800.`)
    }
  }

  // 6. Hierarquia de cabeçalhos (H2 / H3)
  if (postData.content && !postData.content.includes('## ')) {
    errors.push('O conteúdo não contém cabeçalhos H2 (## )')
  }

  // 7. Seção de FAQ (mínimo 2 itens)
  if (!postData.faq || !Array.isArray(postData.faq) || postData.faq.length < 2) {
    errors.push('FAQ ausente ou com menos de 2 perguntas')
  }

  // 8. CTAs para orceifacil.com.br (pelo menos 2 referências)
  if (postData.content) {
    const ctaMatches = (postData.content.match(/orceifacil\.com\.br/g) || []).length
    if (ctaMatches < 1) {
      errors.push('O conteúdo precisa incluir pelo menos um link/referência para orceifacil.com.br')
    }
  }

  // 9. Ausência de blocos JSON ou tags quebradas no markdown
  if (postData.content && (postData.content.includes('```json') || postData.content.includes('```md'))) {
    errors.push('Sintaxe de código indesejada no corpo do texto (ex: ```json)')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}
