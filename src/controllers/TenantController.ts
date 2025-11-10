import { NextFunction, Response } from 'express'
import { TenantService } from '../services/TenantService'
import { RequestCreateTenant } from '../types'

export class TenantController {
    constructor(private tenantService: TenantService) {}

    async createTenant(
        req: RequestCreateTenant,
        res: Response,
        next: NextFunction,
    ) {
        const { name, address } = req.body
        try {
            const tenant = await this.tenantService.create({ name, address })
            res.status(201).json({ id: tenant.id })
        } catch (error) {
            next(error)
        }
    }
}
