import { checkSchema } from 'express-validator'

// export default [body('email').notEmpty().withMessage("Email is required")]

export default checkSchema({
    name: {
        errorMessage: 'Tenant Name is required',
        notEmpty: true,
        trim: true,
    },
    address: {
        trim: true,
        errorMessage: 'Tenant Address is required',
        notEmpty: true,
    },
})
