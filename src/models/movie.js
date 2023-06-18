const { DataTypes } = require('@sequelize/core');
const i18n = require('i18n');
const { debug } = require('../modules/logger');
// (appConfig.APP_NAME + ':Model:User')
module.exports = (sequelize) => {
  const Movie = sequelize.define(
    'Movie',
    {
      movieID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING,
        description: 'Movie title',
        allowNull: false,
      },

      numberInStock:{
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      dailyRentalRate:{
        type: DataTypes.FLOAT,
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

  Movie.associate = (Models) => {


    Models
      .Movie
      .belongsTo(Models.Genre, {
        onDelete: "CASCADE",
        as: 'Genre',
        foreignKey: {
          name: 'genreID',
          allowNull: false,
        },
      });

    Models
      .Movie
      .belongsTo(Models.Employee, {
        // onDelete: "CASCADE",
        as: 'createdBy',
        foreignKey: {
          name: 'createdEmployeeID',
          allowNull: true,
        },
      });

    Models
      .Movie
      .belongsTo(Models.Employee, {
        // onDelete: "CASCADE",
        as: 'updatedBy',
        foreignKey: {
          name: 'updatedEmployeeID',
          allowNull: true,
        },
      });

    Models
      .Movie
      .belongsTo(Models.Employee, {
        // onDelete: "CASCADE",
        as: 'deletedBy',
        foreignKey: {
          name: 'deletedEmployeeID',
          allowNull: true,
        },
      });
  };
  return Movie;
};
