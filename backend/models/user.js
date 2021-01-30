'use strict';

const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Reaction }) {
			this.hasMany(Reaction, { as: 'reactions' }) 	
        }
  };
  User.init({
    
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: {
                args: true,
                msg: 'must be a valid email id'
            }
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    imageUrl: DataTypes.STRING
  }, 
  {
    sequelize,
    modelName: 'User',
    tableName: 'users'
  });
  return User
};
