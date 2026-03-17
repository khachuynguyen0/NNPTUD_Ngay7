let { body, validationResult } = require('express-validator')
module.exports = {
    validatedResult: function (req, res, next) {
        let result = validationResult(req);
        if (result.errors.length > 0) {
            res.status(400).send(result.errors.map(
                function (e) {
                    return {
                        [e.path]: e.msg
                    }
                }
            ));
            return;
        }
        next();
    },
    CreateAnUserValidator: [
        body('email').notEmpty().withMessage("email khong duoc de trong").bail().isEmail().withMessage("email sai dinh dang").normalizeEmail(),
        body('username').notEmpty().withMessage("username khong duoc de trong").bail().isAlphanumeric().withMessage("username khong duoc chua ki tu dac biet"),
        body('password').notEmpty().withMessage("password khong duoc de trong").bail().isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minNumbers: 1,
            minSymbols: 1,
            minUppercase: 1
        }).withMessage("password phai co it nhat 8 ki tu trong do co it nhat 1 ki tu chu hoa, 1 ki tu chu thuong,1 ki tu so va 1 ki tu dac biet"),
        body('role').notEmpty().withMessage("role khong duoc de trong").bail().isMongoId().withMessage("role phai la ID"),
        body('avatarUrl').optional().isURL().withMessage("avatarUrl phai la URL hop le"),
    ],
    RegisterValidator: [
        body('email').notEmpty().withMessage("email khong duoc de trong").bail().isEmail().withMessage("email sai dinh dang").normalizeEmail(),
        body('username').notEmpty().withMessage("username khong duoc de trong").bail().isAlphanumeric().withMessage("username khong duoc chua ki tu dac biet"),
        body('password').notEmpty().withMessage("password khong duoc de trong").bail().isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minNumbers: 1,
            minSymbols: 1,
            minUppercase: 1
        }).withMessage("password phai co it nhat 8 ki tu trong do co it nhat 1 ki tu chu hoa, 1 ki tu chu thuong,1 ki tu so va 1 ki tu dac biet"),
    ],
    ChangePasswordValidator: [
        body('oldpassword').notEmpty().withMessage("oldpassword khong duoc de trong"),
        body('newpassword').notEmpty().withMessage("newpassword khong duoc de trong").bail().isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minNumbers: 1,
            minSymbols: 1,
            minUppercase: 1
        }).withMessage("password phai co it nhat 8 ki tu trong do co it nhat 1 ki tu chu hoa, 1 ki tu chu thuong,1 ki tu so va 1 ki tu dac biet"),
    ],
    ModifyAnUserValidator: [
        body('email').isEmpty().withMessage("email khong duoc thay doi"),
        body('username').isEmpty().withMessage("username khong duoc thay doi"),
        body('password').optional().isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minNumbers: 1,
            minSymbols: 1,
            minUppercase: 1
        }).withMessage("password phai co it nhat 8 ki tu trong do co it nhat 1 ki tu chu hoa, 1 ki tu chu thuong,1 ki tu so va 1 ki tu dac biet"),
        body('role').isEmpty().withMessage("role khong duoc thay doi"),
        body('avatarUrl').optional().isURL().withMessage("avatarUrl phai la URL hop le"),
    ],
    CreateOrderValidator: [
        body('user').notEmpty().withMessage("user khong duoc de trong").bail().isMongoId().withMessage("user phai la ID"),
        body('items').notEmpty().withMessage("items khong duoc de trong").bail().isArray({ min: 1 }).withMessage("items phai la mang co it nhat 1 phan tu"),
        body('items.*.product').notEmpty().withMessage("product trong item khong duoc de trong").bail().isMongoId().withMessage("product phai la ID"),
        body('items.*.quantity').notEmpty().withMessage("quantity trong item khong duoc de trong").bail().isInt({ min: 1 }).withMessage("quantity phai la so nguyen lon hon 0"),
        body('shippingAddress').optional().isString().withMessage("shippingAddress phai la chuoi"),
        body('note').optional().isString().withMessage("note phai la chuoi"),
    ]
}
