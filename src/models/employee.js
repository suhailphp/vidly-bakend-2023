const { DataTypes } = require('@sequelize/core');
const i18n = require('i18n');
const { debug } = require('../modules/logger');
// (appConfig.APP_NAME + ':Model:Employee')
module.exports = (sequelize) => {
  const Employee = sequelize.define(
    'Employee',
    {
      employeeID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userName: {
        type: DataTypes.STRING,
        // unique: true,
        allowNull: true,
      },
      userType: { // ADMIN, SUPER-ADMIN, USER
        type: DataTypes.STRING,
        allowNull: true,
      },
      userPrivileges: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      password: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },
      passwordSalt: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },
      fullNameEn: {
        type: DataTypes.STRING,
        description: 'User`s full name',
        allowNull: false,
      },
      fullNameAr: {
        type: DataTypes.STRING,
        description: 'User`s full name Arabic',
        allowNull: false,
      },

      militaryNumber: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      mobile: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      language: {
        type: DataTypes.STRING(2),
        allowNull: false,
        defaultValue: () => 'ar',
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
      lastLoggedIn: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      isManager: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: () => false,
      },
      isAdmin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: () => false,
      },
      isSuperAdmin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: () => false,
      },
      ADLogin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: () => false,
      },
    },
  );
  Employee.associate = (Models) => {
    /**
         * With Users Table
         */
    Models
      .Employee
      .belongsTo(Models.Employee, {
        // onDelete: "CASCADE",
        as: 'createdBy',
        foreignKey: {
          name: 'createdEmployeeID',
          allowNull: true,
        },
      });

    Models
      .Employee
      .belongsTo(Models.Employee, {
        // onDelete: "CASCADE",
        as: 'updatedBy',
        foreignKey: {
          name: 'updatedEmployeeID',
          allowNull: true,
        },
      });

    Models
      .Employee
      .belongsTo(Models.Employee, {
        // onDelete: "CASCADE",
        as: 'deletedBy',
        foreignKey: {
          name: 'deletedEmployeeID',
          allowNull: true,
        },
      });

    Models
      .Employee
      .belongsTo(Models.Document, {
        // onDelete: "CASCADE",
        as: 'profilePhoto',
        foreignKey: {
          name: 'profilePhotoDocumentID',
          allowNull: true,
        },
      });
    /**
         * With Organization Table
         */



  };
  return Employee;
};
