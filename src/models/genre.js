const { DataTypes } = require('@sequelize/core');
const i18n = require('i18n');
const { debug } = require('../modules/logger');
// (appConfig.APP_NAME + ':Model:User')
module.exports = (sequelize) => {
  const Genre = sequelize.define(
    'Genre',
    {
      genreID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        description: 'name English',
        allowNull: false,
      },
      
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: () => true,
      },
      deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: () => false,
      },
      createdOn: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedOn: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      deletedOn: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
  );

  Genre.associate = (Models) => {


    Models
      .Genre
      .belongsTo(Models.Employee, {
        // onDelete: "CASCADE",
        as: 'createdBy',
        foreignKey: {
          name: 'createdEmployeeID',
          allowNull: true,
        },
      });

    Models
      .Genre
      .belongsTo(Models.Employee, {
        // onDelete: "CASCADE",
        as: 'updatedBy',
        foreignKey: {
          name: 'updatedEmployeeID',
          allowNull: true,
        },
      });

    Models
      .Genre
      .belongsTo(Models.Employee, {
        // onDelete: "CASCADE",
        as: 'deletedBy',
        foreignKey: {
          name: 'deletedEmployeeID',
          allowNull: true,
        },
      });
  };
  return Genre;
};
