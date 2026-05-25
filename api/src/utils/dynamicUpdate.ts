/**
 * Helper para gerar cláusulas SET dinâmicas para queries de UPDATE em SQL Puro.
 * * @param table Nome da tabela no banco de dados.
 * @param dto Objeto contendo os campos que serão atualizados (parciais).
 * @param idColumn Nome da coluna de identificação (padrão: 'id').
 * @param idValue Valor do ID do registro que será atualizado.
 * * @returns Um objeto com a string da query pronta e o array de valores limpos.
 */
export function generateDynamicUpdate<T extends Record<string, any>>(
  table: string,
  dto: T,
  idColumn: string,
  idValue: number | string,
) {
  const fields: string[] = [];
  const values: any[] = [];

  // Filtra propriedades que são undefined (não enviadas na requisição)
  Object.entries(dto).forEach(([key, value]) => {
    if (value !== undefined) {
      fields.push(`\`${key}\` = ?`);
      values.push(value);
    }
  });

  // Se o DTO veio vazio (ex: {}), lança um erro para evitar quebrar o banco
  if (fields.length === 0) {
    throw new Error("Nenhum campo válido foi fornecido para atualização.");
  }

  // Monta a query final considerando que não atualizamos registros deletados (Soft Delete)
  const query = `
    UPDATE \`${table}\` 
    SET ${fields.join(", ")} 
    WHERE \`${idColumn}\` = ? AND \`deletedAt\` IS NULL
  `;

  // O ID sempre entra como o último parâmetro para fechar o WHERE
  values.push(idValue);

  return { query, values };
}
