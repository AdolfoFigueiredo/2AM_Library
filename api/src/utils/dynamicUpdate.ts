export function generateDynamicUpdate<T extends Record<string, any>>(
  table: string,
  dto: T,
  idColumn: string,
  idValue: number | string,
) {
  const fields: string[] = [];
  const values: any[] = [];

  const safeIdentifierRegex = /^[a-zA-Z0-9_]+$/;

  if (!safeIdentifierRegex.test(table) || !safeIdentifierRegex.test(idColumn)) {
    throw new Error("Nome de tabela ou coluna de ID inválido.");
  }

  Object.entries(dto).forEach(([key, value]) => {
    if (value !== undefined) {
      if (!safeIdentifierRegex.test(key)) {
        throw new Error(`Nome de coluna inválido ou suspeito: ${key}`);
      }

      fields.push(`\`${key}\` = ?`);
      values.push(value);
    }
  });

  if (fields.length === 0) {
    throw new Error("Nenhum campo válido foi fornecido para atualização.");
  }

  const query = `
    UPDATE \`${table}\` 
    SET ${fields.join(", ")} 
    WHERE \`${idColumn}\` = ? AND \`deletedAt\` IS NULL
  `;

  values.push(idValue);

  return { query, values };
}
