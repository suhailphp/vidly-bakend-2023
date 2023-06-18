const { DataTypes } = require('@sequelize/core');
const appConfig = require('../config');
const { debug } = require('../modules/logger'); // (appConfig.APP_NAME + ':Model:Document')

module.exports = (sequelize) => {
  const Document = sequelize.define(
    'Document',
    {
      documentID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      fileName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      fileType: {
        /**     IMAGE, PDF, WORD */
        type: DataTypes.STRING,
        allowNull: false,
      },
      data: {
        type: DataTypes.BLOB,
        allowNull: false,
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
    },
  );

  Document.associate = (Models) => {

    /**
         * With Users Table
         */
    //  Models
    //     .Document
    //     .belongsTo(Models.User, {
    //         // onDelete: "CASCADE",
    //         as: 'documentCreatedBy',
    //         foreignKey: {
    //             name: 'documentCreatedUserID',
    //             allowNull: false
    //         }
    //     });

  };

  return Document;
};
