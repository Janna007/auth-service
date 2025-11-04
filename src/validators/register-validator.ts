import { checkSchema } from 'express-validator'

// export default [body('email').notEmpty().withMessage("Email is required")]

export default checkSchema({
    email: {
        errorMessage: 'Email is required',
        notEmpty: true,
        trim: true,
        isEmail: {
            errorMessage: 'Email is not valid',
        },
    },
    firstName: {
        errorMessage: 'firstName is required',
        notEmpty: true,
    },
    lastName: {
        errorMessage: 'lastName is required',
        notEmpty: true,
    },
    password: {
        errorMessage: 'password is missing',
        notEmpty: true,
        isLength: {
            options: { min: 8 },
            errorMessage: 'Password should be at least 8 chars',
        },
    },
})
