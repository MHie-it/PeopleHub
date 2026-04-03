let positionModel = require('../schemas/positions');

module.exports = {
    CreatePosition: async function (code, title, department, level, description) {
        let newPosition = new positionModel({
            code: code,
            title: title,
            department: department,
            level: level,
            description: description
        });

        await newItem.save();
        return newPosition;
    },

    getAllPosition: async function () {
        return await positionModel.find({
            isDeleted: false
        })
    },

    getPositionById: async function (id) {
        try {
            return await positionModel.find({
                isDeleted: false,
                _id: id
            }).populate('department')
        } catch (error) {
            return false;
        }
    }
};