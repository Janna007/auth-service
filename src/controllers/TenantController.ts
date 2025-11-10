import { NextFunction, Response } from 'express'
import { TenantService } from '../services/TenantService'
import { RequestCreateTenant } from '../types'
import { validationResult } from 'express-validator'

export class TenantController {
    constructor(private tenantService: TenantService) {}

    async createTenant(
        req: RequestCreateTenant,
        res: Response,
        next: NextFunction,
    ) {
        const result = validationResult(req)
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() })
        }
        const { name, address } = req.body
        try {
            const tenant = await this.tenantService.create({ name, address })
            res.status(201).json({ id: tenant.id })
        } catch (error) {
            next(error)
        }
    }
}
