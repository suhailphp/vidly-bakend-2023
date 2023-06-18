const pageLimit = 10;
const defaultOptions = { defaultSort: ['CreatedOn', 'ASC'] };
const { Op } = require('@sequelize/core');
const logger = require('../modules/logger');
/**
 * Datatable paggination
 */
module.exports.res = (req, list) => {
  const query = req.query || req;
  const draw = parseInt(query.draw);
  return {
    data: list.rows,
    draw,
    recordsTotal: list.count,
    recordsFiltered: list.count,
  };
};
/**
 *  Usage
 *  ...pagination.init(query, {
      defaultSort: ['CreatedOn', 'ASC'],
      whereLike: ['ID', 'Name', '$SubTable.Name$'],
      allowedSortColumns: ['ID', 'Name', { key: 'Operation.Name', model: ModelRef, field: 'Name' }, { key: 'Operation.Name', model: {model: ModelRef, as: 'assosiationName'}, field: 'Name' }],
      where,
    }),
 * @param {*} req || req.query
 * @param {*} options = {where, whereLike, defaultSort, allowedSortColumns}
 * @returns
 */
module.exports.init = (reqOrQuery, options = {
  whereLike: [], where: {}, defaultSort: defaultOptions.defaultSort, allowedSortColumns: [],
}) => {
  const query = reqOrQuery.query || reqOrQuery;
  let searchQuery = query.search ? query.search.value : '';
  if (searchQuery) { searchQuery = searchQuery.trim(); }
  const start = parseInt(query.start || 0);
  const length = parseInt(query.length || pageLimit);
  logger.silly('pagination %o', query);

  const queryOrder = query.order ? query.order[0] : {};
  let queryOrderCol = queryOrder.column || null;
  let queryOrderDir = queryOrder.dir || 'desc';
  let queryOrderModel = null;

  /**
     * check allowed sort columns
     */
  let found = false;
  if (options.allowedSortColumns && options.allowedSortColumns.length > 0) {
    // eslint-disable-next-line no-restricted-syntax
    for (const colKey of options.allowedSortColumns) {
      if (typeof colKey === 'object' && colKey.key === queryOrderCol) {
        queryOrderCol = colKey.field;
        queryOrderModel = colKey.model;
        found = true;
        break;
      } else if (colKey === queryOrderCol) {
        found = true;
        break;
      }
    }
  }
  if (!found) {
    queryOrderCol = null;
    queryOrderDir = null;
  }

  const whereQuery = { ...options.where || {} };
  if (options.whereLike && options.whereLike.length > 0) {
    whereQuery[Op.or] = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const wOr of options.whereLike) {
      // console.log(`%${searchQuery}%`);
      whereQuery[Op.or].push({ [wOr]: { [Op.like]: `%${searchQuery}%` } });
    }
  }
  let order = null;
  if (options.defaultSort) {
    order = [
      options.defaultSort,
    ];
  }
  if (queryOrderCol) {
    order = [
      [queryOrderCol, queryOrderDir],
    ];
    if (queryOrderModel) {
      if (Array.isArray(queryOrderModel)) {
        order = [
          [...queryOrderModel, queryOrderCol, queryOrderDir],
        ];
      } else {
        order = [
          [queryOrderModel, queryOrderCol, queryOrderDir],
        ];
      }
    }
  }
  logger.silly('pagination:order %o', JSON.stringify(order));
  logger.silly('pagination:where %o', (whereQuery));
  return {
    where: whereQuery,
    order,
    limit: length,
    offset: start,
  };
};
