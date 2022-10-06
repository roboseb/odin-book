const { check } = require('express-validator')
// const repo = require('./repository')
module.exports = {

    validateConfirmPassword: check('confirmPassword')

        // To delete leading and trailing space
        .trim()

        // Validate minimum length of password
        // Optional for this context
        .isLength({ min: 6, max: 16 })

        // Custom message
        .withMessage('Password must be between 6 to 16 characters')

        // Custom validation
        // Validate confirmPassword
        .custom(async (confirmPassword, { req }) => {
            const password = req.body.password

            // If password and confirm password not same
            // don't allow to sign up and throw error
            if (password !== confirmPassword) {
                throw new Error('Passwords must match.')
            }
        }),
}