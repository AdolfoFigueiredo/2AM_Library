export interface BaseQueryPagination {
  page: number;
  limit: number;
  sortBy: string;
  order: "ASC" | "DESC" | "asc" | "desc";
}

export function generateDynamicSelect<F extends Record<string, any>>(
  tableOrView: string,
  filters: F,
  pagination: BaseQueryPagination,
) {
  const { page, limit, sortBy, order } = pagination;
  const whereConditions: string[] = [];
  const values: any[] = [];
  const safeIdentifierRegex = /^[a-zA-Z0-9_]+$/;

  // 1. Validações de segurança estrutural (Contra SQL Injection em locais que não aceitam '?')
  if (!safeIdentifierRegex.test(tableOrView)) {
    throw new Error("Nome de tabela ou view inválido.");
  }
  if (!safeIdentifierRegex.test(sortBy)) {
    throw new Error(`Coluna de ordenação inválida: ${sortBy}`);
  }

  const cleanOrder = order.toUpperCase() === "DESC" ? "DESC" : "ASC";

  // 2. Construção dinâmica do WHERE com placeholders '?'
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (!safeIdentifierRegex.test(key)) {
        throw new Error(
          `Nome de coluna inválido ou suspeito no filtro: ${key}`,
        );
      }

      if (typeof value === "string") {
        whereConditions.push(`\`${key}\` LIKE ?`);
        values.push(`%${value}%`);
      } else {
        whereConditions.push(`\`${key}\` = ?`);
        values.push(value);
      }
    }
  });

  // 3. Aplicação padrão do Soft Delete
  whereConditions.push(`\`deletedAt\` IS NULL`);

  const whereClause = `WHERE ${whereConditions.join(" AND ")}`;

  // 4. Cálculo do OFFSET para paginação
  const offset = (page - 1) * limit;

  // 5. Geração das duas queries necessárias
  const dataQuery = `
    SELECT * FROM \`${tableOrView}\` 
    ${whereClause} 
    ORDER BY \`${sortBy}\` ${cleanOrder} 
    LIMIT ${limit} OFFSET ${offset}
  `.trim();

  const countQuery = `
    SELECT COUNT(*) AS total FROM \`${tableOrView}\` ${whereClause}
  `.trim();

  return {
    dataQuery,
    countQuery,
    values,
  };
}
